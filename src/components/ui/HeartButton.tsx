import React from 'react';
import { Heart } from 'lucide-react';

interface HeartButtonProps {
  isLoved: boolean;
  onToggle: () => void;
  loveCount: number;
}

export const HeartButton: React.FC<HeartButtonProps> = ({
  isLoved,
  onToggle,
  loveCount
}) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        isLoved
          ? 'text-red-600 bg-red-50 transform scale-105'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Heart 
        className={`w-5 h-5 transition-all duration-300 ${
          isLoved ? 'fill-current animate-pulse' : ''
        }`} 
      />
      <span className="text-sm font-medium">
        {loveCount > 0 ? loveCount : 'Amei'}
      </span>
    </button>
  );
};