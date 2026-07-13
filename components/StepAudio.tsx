import React, { useRef, useState, useEffect } from 'react';
import { Button } from './Button';

interface StepAudioProps {
  script: string;
  setScript: (text: string) => void;
  audioUrl?: string;
  onGenerateAudio: () => void;
  onRewrite: (mode: 'longer' | 'shorter') => void;
  onExportZip: () => void;
  onBack: () => void;
  isLoading: boolean;
  isRewriting: boolean;
}

export const StepAudio: React.FC<StepAudioProps> = ({
  script,
  setScript,
  audioUrl,
  onGenerateAudio,
  onRewrite,
  onExportZip,
  onBack,
  isLoading,
  isRewriting
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play audio when generated
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(e => console.log("Auto-play prevented"));
    }
  }, [audioUrl]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto h-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-hand text-3xl font-bold text-ink">Phòng Thu Âm (Audio Studio)</h2>
          <p className="font-sans text-gray-600 text-sm">Chỉnh sửa lời dẫn và tạo giọng đọc AI.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={onBack}>Quay lại</Button>
            <Button onClick={onExportZip} disabled={!audioUrl}>
              ⬇ Tải Toàn Bộ (ZIP)
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        {/* Left: Script Editor */}
        <div className="flex flex-col gap-4 bg-white/50 p-6 rounded-xl border-2 border-ink/10 shadow-sm">
          <div className="flex justify-between items-center">
             <label className="font-hand text-xl font-bold text-ink">Kịch bản tổng hợp</label>
             <div className="flex gap-2">
                <button 
                   onClick={() => onRewrite('shorter')} 
                   disabled={isRewriting}
                   className="text-xs bg-paper border border-ink/20 px-2 py-1 rounded hover:bg-white transition-colors"
                >
                   {isRewriting ? '...' : 'Ngắn gọn hơn'}
                </button>
                <button 
                   onClick={() => onRewrite('longer')} 
                   disabled={isRewriting}
                   className="text-xs bg-paper border border-ink/20 px-2 py-1 rounded hover:bg-white transition-colors"
                >
                   {isRewriting ? '...' : 'Chi tiết hơn'}
                </button>
             </div>
          </div>
          <textarea 
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="flex-1 w-full p-4 bg-paper rounded-lg border-2 border-transparent focus:border-ink outline-none resize-none font-sans text-base leading-relaxed shadow-inner"
            placeholder="Kịch bản sẽ xuất hiện ở đây..."
          />
        </div>

        {/* Right: Audio Player & Action */}
        <div className="flex flex-col items-center justify-center bg-paper paper-texture p-6 rounded-xl border-2 border-ink shadow-md relative overflow-hidden">
           
           <div className="text-center space-y-6 z-10 w-full flex flex-col items-center">
              <div className="w-24 h-24 bg-ink rounded-full flex items-center justify-center mb-4 shadow-lg">
                 {isLoading ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-paper"></div>
                 ) : (
                    <svg className="w-10 h-10 text-paper" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                 )}
              </div>

              {audioUrl ? (
                <div className="w-full bg-white/80 p-4 rounded-lg border border-ink/10">
                    <audio ref={audioRef} controls src={audioUrl} className="w-full h-10" />
                    <p className="text-xs text-gray-500 mt-2 font-sans">Đã tạo xong voiceover.wav</p>
                </div>
              ) : (
                 <p className="font-hand text-xl text-gray-500">Chưa có âm thanh</p>
              )}

              <Button 
                onClick={onGenerateAudio} 
                isLoading={isLoading} 
                disabled={!script}
                className="w-full max-w-xs"
              >
                 {audioUrl ? '🔄 Tạo Lại Giọng Đọc' : '🎙 Tạo Giọng Đọc AI'}
              </Button>
           </div>
           
           {/* Decorative elements */}
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-2xl"></div>
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-ink/5 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
};