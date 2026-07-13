import { ApiSettings } from "../types";
import { COACHIO_DEFAULT_BASE_URL } from "./coachioService";

const STORAGE_KEY = 'stickman-ai-pro:api-settings';

export const DEFAULT_SETTINGS: ApiSettings = {
  imageProvider: 'gemini',
  coachio: {
    apiKey: '',
    baseUrl: COACHIO_DEFAULT_BASE_URL,
    resolution: '1k',
    aspectRatio: 'follow-app',
    referenceImages: [],
  },
};

export const loadSettings = (): ApiSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      coachio: { ...DEFAULT_SETTINGS.coachio, ...(parsed.coachio || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: ApiSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Không thể lưu cấu hình API', e);
  }
};

export const clearSettings = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
