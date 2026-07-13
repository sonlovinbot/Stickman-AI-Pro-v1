import React from 'react';
import { Button } from './Button';
import { GeneratedTitle } from '../types';

interface StepTitlesProps {
  titles: GeneratedTitle[];
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const StepTitles: React.FC<StepTitlesProps> = ({ titles, onSelect, onNext, onBack, isLoading }) => {
  const selectedId = titles.find(t => t.selected)?.id;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="text-center">
        <h2 className="font-hand text-3xl font-bold text-ink">Chọn Tiêu Đề Viral</h2>
        <p className="font-sans text-gray-600">Đây là "câu móc" (hook) quan trọng nhất của video.</p>
      </div>

      <div className="space-y-3">
        {titles.map((title) => (
          <div
            key={title.id}
            onClick={() => onSelect(title.id)}
            className={`
              p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
              ${title.selected 
                ? 'bg-ink text-paper border-ink shadow-lg scale-[1.02]' 
                : 'bg-white text-ink border-gray-200 hover:border-ink hover:shadow-md'}
            `}
          >
            <h3 className="font-sans font-bold text-lg md:text-xl">{title.text}</h3>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>Quay lại</Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedId} 
          isLoading={isLoading}
        >
          Viết Kịch Bản
        </Button>
      </div>
    </div>
  );
};
