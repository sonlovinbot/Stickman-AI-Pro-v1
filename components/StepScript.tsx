import React from 'react';
import { Button } from './Button';
import { Scene } from '../types';

interface StepScriptProps {
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const StepScript: React.FC<StepScriptProps> = ({ scenes, setScenes, onNext, onBack, isLoading }) => {
  
  const handleVoiceoverChange = (id: string, text: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, voiceover: text } : s));
  };

  const handleVisualChange = (id: string, text: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, visualPrompt: text } : s));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto h-full">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="font-hand text-3xl font-bold text-ink">Kịch Bản Phân Cảnh (Storyboard)</h2>
            <p className="font-sans text-gray-600 text-sm">Chỉnh sửa lời thoại và mô tả hình ảnh trước khi vẽ.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" onClick={onBack}>Quay lại</Button>
            <Button onClick={onNext} isLoading={isLoading}>Vẽ Hình Ảnh</Button>
        </div>
      </div>

      <div className="grid gap-6 overflow-y-auto pr-2 pb-10" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {scenes.map((scene, index) => (
          <div key={scene.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-hand font-bold text-lg border border-gray-300">
              {index + 1}
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lời thoại (Voiceover)</label>
              <textarea
                value={scene.voiceover}
                onChange={(e) => handleVoiceoverChange(scene.id, e.target.value)}
                className="w-full p-2 bg-paper rounded border border-gray-200 font-sans text-base focus:border-ink focus:ring-0 outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-accent uppercase tracking-wider">Mô tả hình ảnh (Visual Prompt)</label>
              <textarea
                value={scene.visualPrompt}
                onChange={(e) => handleVisualChange(scene.id, e.target.value)}
                className="w-full p-2 bg-yellow-50/50 rounded border border-yellow-200 font-hand text-lg focus:border-accent focus:ring-0 outline-none resize-none text-gray-700"
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
