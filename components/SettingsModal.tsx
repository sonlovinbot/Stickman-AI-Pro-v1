import React, { useState } from 'react';
import { Button } from './Button';
import { ApiSettings, CoachioAspectRatio, CoachioResolution, ImageProvider } from '../types';
import {
  COACHIO_PRICING,
  MAX_REFERENCE_IMAGES,
  uploadImage,
  testConnection,
} from '../services/coachioService';

interface SettingsModalProps {
  settings: ApiSettings;
  onSave: (settings: ApiSettings) => void;
  onClose: () => void;
  onConnectGeminiKey: () => void;
}

const RESOLUTIONS: CoachioResolution[] = ['1k', '2k', '4k'];

const ASPECT_RATIOS: { id: CoachioAspectRatio; label: string }[] = [
  { id: 'follow-app', label: 'Theo khung hình app' },
  { id: 'auto', label: 'auto (chỉ 1k)' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '1:1', label: '1:1' },
  { id: '4:5', label: '4:5' },
  { id: '3:4', label: '3:4' },
  { id: '4:3', label: '4:3' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  onConnectGeminiKey,
}) => {
  const [draft, setDraft] = useState<ApiSettings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const coachio = draft.coachio;
  const setCoachio = (patch: Partial<ApiSettings['coachio']>) =>
    setDraft({ ...draft, coachio: { ...coachio, ...patch } });

  // `auto` is only valid at 1k, so force the resolution back down when it's picked.
  const setAspectRatio = (aspectRatio: CoachioAspectRatio) =>
    setCoachio({
      aspectRatio,
      resolution: aspectRatio === 'auto' ? '1k' : coachio.resolution,
    });

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await testConnection(coachio);
      setTestResult({ ok: true, message: 'Kết nối Coachio thành công. API Key hợp lệ.' });
    } catch (e: any) {
      setTestResult({ ok: false, message: e?.message || 'Kết nối thất bại.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleUploadReference = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    const room = MAX_REFERENCE_IMAGES - coachio.referenceImages.length;
    if (room <= 0) {
      alert(`Tối đa ${MAX_REFERENCE_IMAGES} ảnh tham chiếu.`);
      return;
    }

    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files.slice(0, room)) {
        urls.push(await uploadImage(file, coachio));
      }
      setCoachio({ referenceImages: [...coachio.referenceImages, ...urls] });
    } catch (e: any) {
      alert(e?.message || 'Upload ảnh tham chiếu thất bại.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const removeReference = (url: string) =>
    setCoachio({ referenceImages: coachio.referenceImages.filter((u) => u !== url) });

  const providers: { id: ImageProvider; title: string; subtitle: string }[] = [
    { id: 'gemini', title: 'Google Gemini', subtitle: 'Nano Banana Pro — mặc định, trả ảnh trực tiếp' },
    { id: 'coachio', title: 'Coachio', subtitle: 'GPT Image 2 — tối đa 4K, hỗ trợ ảnh tham chiếu' },
  ];

  const canSave = draft.imageProvider === 'gemini' || coachio.apiKey.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-paper paper-texture w-full max-w-2xl my-8 rounded-xl border-2 border-ink shadow-[6px_6px_0px_0px_rgba(26,26,26,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-ink/10">
          <div>
            <h2 className="font-hand text-3xl font-bold text-ink">Cài đặt API</h2>
            <p className="font-sans text-sm text-gray-600">Chọn công cụ tạo ảnh cho người que của bạn.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink hover:bg-black/5 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider */}
          <div className="space-y-2">
            <label className="font-hand text-2xl text-ink block">Nguồn tạo ảnh</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDraft({ ...draft, imageProvider: p.id })}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${draft.imageProvider === p.id
                      ? 'bg-ink text-paper border-ink shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}
                  `}
                >
                  <div className="font-sans font-bold">{p.title}</div>
                  <div className={`font-sans text-xs mt-1 ${draft.imageProvider === p.id ? 'text-paper/70' : 'text-gray-500'}`}>
                    {p.subtitle}
                  </div>
                </button>
              ))}
            </div>
            <p className="font-sans text-xs text-gray-500">
              Kịch bản, tiêu đề và giọng đọc luôn dùng Gemini. Thiết lập này chỉ đổi nguồn tạo <strong>ảnh</strong>.
            </p>
          </div>

          {draft.imageProvider === 'gemini' && (
            <div className="bg-white/60 border-2 border-ink/10 rounded-lg p-4 space-y-3">
              <p className="font-sans text-sm text-gray-600">
                Gemini dùng API Key từ biến môi trường <code className="bg-black/5 px-1 rounded">GEMINI_API_KEY</code>,
                hoặc key đã chọn trong AI Studio.
              </p>
              <Button variant="secondary" onClick={onConnectGeminiKey} className="text-sm px-4 py-1">
                🔑 Kết nối / đổi Gemini Key
              </Button>
            </div>
          )}

          {draft.imageProvider === 'coachio' && (
            <div className="space-y-5">
              {/* API Key */}
              <div className="space-y-2">
                <label className="font-hand text-2xl text-ink block">Coachio API Key</label>
                <div className="flex gap-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={coachio.apiKey}
                    onChange={(e) => setCoachio({ apiKey: e.target.value.trim() })}
                    placeholder="lv_..."
                    autoComplete="off"
                    className="flex-1 bg-white border-2 border-gray-300 focus:border-ink rounded-lg p-3 font-mono text-sm outline-none transition-colors"
                  />
                  <Button variant="secondary" onClick={() => setShowKey(!showKey)} className="text-sm px-3 py-1">
                    {showKey ? 'Ẩn' : 'Hiện'}
                  </Button>
                </div>
                <p className="font-sans text-xs text-gray-500">
                  Tạo key tại Coachio Dashboard → API Keys. Key được lưu trong localStorage của trình duyệt này.
                </p>
              </div>

              {/* Base URL */}
              <div className="space-y-2">
                <label className="font-hand text-2xl text-ink block">Base URL</label>
                <input
                  type="text"
                  value={coachio.baseUrl}
                  onChange={(e) => setCoachio({ baseUrl: e.target.value.trim() })}
                  className="w-full bg-white border-2 border-gray-300 focus:border-ink rounded-lg p-3 font-mono text-sm outline-none transition-colors"
                />
                <p className="font-sans text-xs text-gray-500">
                  Đổi sang URL proxy của bạn nếu trình duyệt chặn CORS.
                </p>
              </div>

              {/* Resolution */}
              <div className="space-y-2">
                <label className="font-hand text-2xl text-ink block">Độ phân giải</label>
                <div className="grid grid-cols-3 gap-2">
                  {RESOLUTIONS.map((r) => {
                    const disabled = coachio.aspectRatio === 'auto' && r !== '1k';
                    return (
                      <button
                        key={r}
                        disabled={disabled}
                        onClick={() => setCoachio({ resolution: r })}
                        className={`
                          p-3 rounded-lg border-2 font-sans font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
                          ${coachio.resolution === r
                            ? 'bg-ink text-paper border-ink shadow-md'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}
                        `}
                      >
                        <div className="uppercase">{r}</div>
                        <div className="text-xs font-normal opacity-70">{COACHIO_PRICING[r]} credits</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect ratio */}
              <div className="space-y-2">
                <label className="font-hand text-2xl text-ink block">Tỷ lệ khung hình</label>
                <select
                  value={coachio.aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as CoachioAspectRatio)}
                  className="w-full bg-white border-2 border-gray-300 focus:border-ink rounded-lg p-3 font-sans outline-none transition-colors"
                >
                  {ASPECT_RATIOS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
                <p className="font-sans text-xs text-gray-500">
                  Mặc định bám theo khung hình đã chọn ở bước Chủ đề (16:9 hoặc 9:16).
                </p>
              </div>

              {/* Reference images */}
              <div className="space-y-2">
                <label className="font-hand text-2xl text-ink block">
                  Ảnh tham chiếu ({coachio.referenceImages.length}/{MAX_REFERENCE_IMAGES})
                </label>
                <p className="font-sans text-xs text-gray-500">
                  Tuỳ chọn. Tải lên ảnh mẫu để GPT Image 2 giữ đúng nét vẽ người que xuyên suốt các cảnh.
                </p>

                {coachio.referenceImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {coachio.referenceImages.map((url) => (
                      <div key={url} className="relative">
                        <img
                          src={url}
                          alt="Ảnh tham chiếu"
                          className="w-20 h-20 object-cover rounded-lg border-2 border-ink/20"
                        />
                        <button
                          onClick={() => removeReference(url)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full text-xs font-bold shadow"
                          aria-label="Xoá ảnh"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-400
                    font-hand text-lg cursor-pointer hover:border-ink transition-colors
                    ${(isUploading || !coachio.apiKey || coachio.referenceImages.length >= MAX_REFERENCE_IMAGES)
                      ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  {isUploading ? 'Đang tải lên...' : '+ Thêm ảnh (JPG/PNG/WebP, ≤15MB)'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleUploadReference}
                  />
                </label>
              </div>

              {/* Test connection */}
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  onClick={handleTest}
                  isLoading={isTesting}
                  disabled={!coachio.apiKey}
                  className="text-base px-4 py-1"
                >
                  Kiểm tra kết nối
                </Button>
                {testResult && (
                  <p className={`font-sans text-sm ${testResult.ok ? 'text-green-700' : 'text-accent'}`}>
                    {testResult.ok ? '✅ ' : '⚠️ '}{testResult.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t-2 border-ink/10">
          <Button variant="ghost" onClick={onClose}>Huỷ</Button>
          <Button onClick={() => onSave(draft)} disabled={!canSave}>Lưu cài đặt</Button>
        </div>
      </div>
    </div>
  );
};
