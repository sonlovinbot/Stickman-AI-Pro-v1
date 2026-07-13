import { CoachioSettings } from "../types";

export const COACHIO_DEFAULT_BASE_URL = "https://api.coachio.ai/api/v1";

/** gpt_image_2 supports these; `auto` is only valid together with resolution `1k`. */
export const COACHIO_ASPECT_RATIOS = [
  'auto', '1:1', '5:4', '9:16', '21:9', '16:9', '4:3', '3:2', '4:5', '3:4', '2:3'
] as const;

export const COACHIO_RESOLUTIONS = ['1k', '2k', '4k'] as const;

/** Credits per image, used to show an estimate in the settings panel. */
export const COACHIO_PRICING: Record<string, number> = {
  '1k': 0.81,
  '2k': 1.35,
  '4k': 3.2,
};

export const MAX_REFERENCE_IMAGES = 5;
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export interface CoachioTaskStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  result_urls?: string[];
  result?: { output_urls?: string[] };
}

export class CoachioError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'CoachioError';
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const baseUrl = (settings: CoachioSettings) =>
  (settings.baseUrl || COACHIO_DEFAULT_BASE_URL).replace(/\/+$/, '');

/**
 * Turns an HTTP failure into a CoachioError with a message the user can act on.
 */
const toError = async (response: Response): Promise<CoachioError> => {
  let detail = '';
  try {
    const body = await response.json();
    detail = body?.message || body?.detail || body?.error || '';
  } catch {
    // Body was not JSON; the status code alone has to carry the message.
  }

  const messages: Record<number, string> = {
    400: 'Yêu cầu không hợp lệ. Kiểm tra lại tham số (tỷ lệ khung hình / độ phân giải).',
    401: 'API Key Coachio không hợp lệ hoặc đã hết hạn.',
    402: 'Tài khoản Coachio không đủ credits.',
    413: 'File vượt quá giới hạn 15MB.',
    415: 'Định dạng file không được hỗ trợ.',
    429: 'Coachio đang giới hạn tốc độ (rate limit). Vui lòng thử lại sau.',
    500: 'Máy chủ Coachio gặp sự cố. Vui lòng thử lại.',
  };

  const base = messages[response.status] || `Lỗi Coachio (HTTP ${response.status}).`;
  return new CoachioError(detail ? `${base} — ${detail}` : base, response.status);
};

const isRetryable = (status: number) => status === 429 || status >= 500;

/**
 * fetch + exponential backoff on 429/5xx. Other failures throw immediately.
 */
const request = async (
  url: string,
  init: RequestInit,
  retries = 4,
  delay = 2000
): Promise<Response> => {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (e: any) {
    throw new CoachioError(
      `Không thể kết nối tới Coachio. Kiểm tra mạng hoặc CORS/Base URL. (${e?.message || e})`,
      0
    );
  }

  if (response.ok) return response;

  if (retries > 0 && isRetryable(response.status)) {
    await sleep(delay);
    return request(url, init, retries - 1, delay * 2);
  }

  throw await toError(response);
};

/**
 * Upload a reference image. Returns a permanent CDN URL usable as `media_inputs.images_url`.
 */
export const uploadImage = async (file: File, settings: CoachioSettings): Promise<string> => {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new CoachioError('File vượt quá giới hạn 15MB.', 413);
  }

  const form = new FormData();
  form.append('file', file);

  const response = await request(`${baseUrl(settings)}/upload/image`, {
    method: 'POST',
    headers: { 'X-API-Key': settings.apiKey },
    body: form,
  });

  const data = await response.json();
  if (!data?.url) throw new CoachioError('Coachio không trả về URL sau khi upload.', 500);
  return data.url as string;
};

/**
 * Submit an image task and return its task_id.
 */
export const submitImageTask = async (
  prompt: string,
  settings: CoachioSettings,
  aspectRatio: string,
  resolution: string
): Promise<string> => {
  // The API rejects `auto` at anything above 1k.
  const safeResolution = aspectRatio === 'auto' ? '1k' : resolution;

  const payload: Record<string, unknown> = {
    task_type: 'image',
    prompt,
    ai_model_config: {
      model_identifier: 'gpt_image_2',
      generation_mode: 'default',
      aspect_ratio: aspectRatio,
      resolution: safeResolution,
    },
  };

  const references = (settings.referenceImages || []).slice(0, MAX_REFERENCE_IMAGES);
  if (references.length > 0) {
    payload.media_inputs = { images_url: references };
  }

  const response = await request(`${baseUrl(settings)}/task/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': settings.apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!data?.task_id) throw new CoachioError('Coachio không trả về task_id.', 500);
  return data.task_id as string;
};

/**
 * Poll until the task completes, fails, or the timeout is reached.
 * `signal` lets the caller stop polling when the user navigates away.
 */
export const pollTaskStatus = async (
  taskId: string,
  settings: CoachioSettings,
  options: { onProgress?: (status: CoachioTaskStatus) => void; signal?: AbortSignal } = {}
): Promise<string[]> => {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (options.signal?.aborted) throw new CoachioError('Đã huỷ tác vụ.', 0);

    const response = await request(`${baseUrl(settings)}/task/status/${taskId}`, {
      method: 'GET',
      headers: { 'X-API-Key': settings.apiKey },
      signal: options.signal,
    });

    const status: CoachioTaskStatus = await response.json();
    options.onProgress?.(status);

    if (status.status === 'completed') {
      const urls = status.result_urls || status.result?.output_urls || [];
      if (urls.length === 0) {
        throw new CoachioError('Tác vụ hoàn tất nhưng không có ảnh trả về.', 500);
      }
      return urls;
    }

    if (status.status === 'failed') {
      throw new CoachioError(status.message || 'Coachio tạo ảnh thất bại.', 500);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new CoachioError('Hết thời gian chờ Coachio (5 phút).', 408);
};

/**
 * Fetch a remote image and inline it as a base64 data URL so the ZIP export and
 * the offline project file keep working. Falls back to the remote URL when the
 * CDN blocks cross-origin reads.
 */
const toDataUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return url;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
};

/**
 * Full submit → poll → download flow. Returns a data URL (or the CDN URL on CORS failure).
 */
export const generateCoachioImage = async (
  prompt: string,
  settings: CoachioSettings,
  aspectRatio: string,
  options: { onProgress?: (status: CoachioTaskStatus) => void; signal?: AbortSignal } = {}
): Promise<string | undefined> => {
  if (!settings.apiKey) {
    throw new CoachioError('Chưa cấu hình API Key Coachio.', 401);
  }

  const requestedAspect =
    settings.aspectRatio === 'follow-app' ? aspectRatio : settings.aspectRatio;
  const taskId = await submitImageTask(prompt, settings, requestedAspect, settings.resolution);
  const urls = await pollTaskStatus(taskId, settings, options);
  return toDataUrl(urls[0]);
};

/**
 * Cheap credential check for the settings panel: submit nothing, just hit a
 * status endpoint with a bogus id. 401 means the key is bad; 404 means it works.
 */
export const testConnection = async (settings: CoachioSettings): Promise<void> => {
  const response = await fetch(
    `${baseUrl(settings)}/task/status/00000000-0000-0000-0000-000000000000`,
    { headers: { 'X-API-Key': settings.apiKey } }
  ).catch((e) => {
    throw new CoachioError(`Không thể kết nối tới Coachio. (${e?.message || e})`, 0);
  });

  if (response.status === 401 || response.status === 403) {
    throw await toError(response);
  }
};
