import React from 'react';
import { Button } from './Button';

interface StepThumbnailProps {
  thumbnailUrl?: string;
  isGenerating: boolean;
  onRegenerate: () => void;
  onExportZip: () => void;
  onBack: () => void;
  aspectRatio: '16:9' | '9:16';
}

export const StepThumbnail: React.FC<StepThumbnailProps> = ({ 
  thumbnailUrl, 
  isGenerating, 
  onRegenerate, 
  onExportZip, 
  onBack,
  aspectRatio
}) => {
    
  const downloadImage = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const aspectClass = aspectRatio === '16:9' ? "max-w-3xl aspect-video" : "max-w-sm aspect-[9/16]";

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto h-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="font-hand text-3xl font-bold text-ink">Ảnh Bìa (Thumbnail)</h2>
            <p className="font-sans text-gray-600 text-sm">Tạo ấn tượng đầu tiên mạnh mẽ.</p>
        </div>
        <div className="flex gap-2">
             <Button variant="secondary" onClick={onBack}>Quay lại</Button>
            <Button onClick={onExportZip} disabled={!thumbnailUrl}>
                Tiếp: Tạo Audio & Tải về
            </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white/50 border-2 border-ink/10 rounded-xl">
        <div className={`w-full ${aspectClass} bg-paper paper-texture relative rounded-lg overflow-hidden border-4 border-ink shadow-2xl group`}>
             {isGenerating ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-ink"></div>
                    <span className="font-hand text-xl">Đang thiết kế...</span>
                 </div>
              ) : thumbnailUrl ? (
                <>
                  <img 
                    src={thumbnailUrl} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-paper/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-10">
                    <Button 
                        variant="secondary" 
                        onClick={onRegenerate}
                    >
                        Tạo Lại Khác
                    </Button>
                    <button 
                        onClick={() => downloadImage(thumbnailUrl, 'thumbnail.png')}
                        className="bg-ink text-paper px-6 py-2 rounded-lg font-hand text-lg hover:bg-black transition-colors flex items-center gap-2 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Tải Ảnh Này
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink/30 font-hand text-2xl">
                   [ Chưa có Thumbnail ]
                </div>
              )}
        </div>
        
        {!isGenerating && !thumbnailUrl && (
             <Button onClick={onRegenerate} className="mt-8">Tạo Thumbnail Ngay</Button>
        )}
      </div>
    </div>
  );
};