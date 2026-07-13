import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Scene } from '../types';

interface StepVisualsProps {
  scenes: Scene[];
  regenerateImage: (id: string, prompt: string, keywords: string) => void;
  onNext: () => void;
  onBack: () => void;
  aspectRatio: '16:9' | '9:16';
}

export const StepVisuals: React.FC<StepVisualsProps> = ({ scenes, regenerateImage, onNext, onBack, aspectRatio }) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (playingIndex !== null) {
      if (playingIndex >= scenes.length) {
        setPlayingIndex(null);
        return;
      }
      const timer = setTimeout(() => {
        setPlayingIndex(prev => (prev !== null ? prev + 1 : null));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [playingIndex, scenes.length]);

  const downloadImage = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Dynamic classes based on aspect ratio
  const gridClass = aspectRatio === '16:9' 
    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    
  const aspectClass = aspectRatio === '16:9' ? "aspect-video" : "aspect-[9/16]";

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="font-hand text-3xl font-bold text-ink">Xưởng Hình Ảnh ({aspectRatio})</h2>
            <p className="font-sans text-gray-600 text-sm">Người que, mực đen và giấy cũ.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPlayingIndex(0)} disabled={playingIndex !== null}>
                {playingIndex !== null ? 'Đang chiếu...' : '▶ Xem Thử'}
            </Button>
            <Button onClick={onNext}>Tiếp: Tạo Thumbnail</Button>
        </div>
      </div>

      <div className={`flex-1 grid ${gridClass} gap-6 overflow-y-auto pb-10 px-4`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {scenes.map((scene, index) => (
          <div 
            key={scene.id} 
            className={`
                relative rounded-sm overflow-hidden border-4 transition-all duration-300 bg-paper paper-texture flex flex-col
                ${playingIndex === index ? 'border-accent shadow-2xl scale-105 z-20' : 'border-ink/10 hover:border-ink/30 shadow-md'}
            `}
          >
            {/* Image Area */}
            <div className={`${aspectClass} w-full relative group bg-transparent overflow-hidden`}>
              {scene.isGeneratingImage ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
                    <span className="font-hand">Đang vẽ...</span>
                 </div>
              ) : scene.imageUrl ? (
                <>
                  <img 
                    src={scene.imageUrl} 
                    alt="Doodle" 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-paper/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10">
                    <Button 
                        variant="secondary" 
                        onClick={() => regenerateImage(scene.id, scene.visualPrompt, scene.keywords)}
                        className="scale-90 shadow-sm"
                    >
                        Vẽ Lại
                    </Button>
                    <button 
                        onClick={() => downloadImage(scene.imageUrl!, `scene-${index+1}.png`)}
                        className="bg-ink text-paper px-4 py-2 rounded-lg font-hand hover:bg-black transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Tải Ảnh
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink/30 font-hand text-xl">
                   [ Chờ vẽ... ]
                </div>
              )}
            </div>
            
            {/* Script Section */}
            <div className="p-4 border-t-2 border-ink/5 bg-white/40 backdrop-blur-sm flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-ink/50 uppercase tracking-widest">CẢNH {index + 1}</span>
                </div>
                <p className="font-sans text-sm font-medium text-ink leading-relaxed flex-1">
                    {scene.voiceover}
                </p>
                <div className="mt-3 pt-2 border-t border-ink/5 text-xs text-gray-500 font-sans">
                    <span className="font-bold text-accent">Text:</span> {scene.keywords}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};