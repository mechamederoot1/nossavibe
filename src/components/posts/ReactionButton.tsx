import React, { useState, useRef, useEffect } from 'react';

interface ReactionButtonProps {
  currentReaction?: string;
  onReaction: (type: string) => void;
  onLongPress: () => void;
  reactionsCount: number;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  currentReaction,
  onReaction,
  onLongPress,
  reactionsCount
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [touchStartTime, setTouchStartTime] = useState(0);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(true);
    setTouchStartTime(Date.now());
    
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, 500);
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Se foi um toque rápido (menos de 500ms), executa like simples
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 500) {
      onReaction('like');
    }
  };

  const handleLeave = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <button
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleLeave}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        currentReaction === 'like'
          ? 'text-blue-600 bg-blue-50 transform scale-105'
          : 'text-gray-600 hover:bg-gray-100'
      } ${isPressed ? 'transform scale-95' : ''}`}
    >
      {/* Like SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className={`transition-all duration-300 ${
          currentReaction === 'like' ? 'animate-bounce' : ''
        }`}
      >
        <path
          d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
          fill={currentReaction === 'like' ? '#3B82F6' : 'currentColor'}
          stroke={currentReaction === 'like' ? '#3B82F6' : 'currentColor'}
          strokeWidth="0.5"
        />
      </svg>
      <span className="text-sm font-medium">
        {reactionsCount > 0 ? reactionsCount : 'Curtir'}
      </span>
    </button>
  );
};