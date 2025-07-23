import React from 'react';

interface ReactionSummaryProps {
  reactions: Record<string, number>;
  loveCount: number;
}

export const ReactionSummary: React.FC<ReactionSummaryProps> = ({
  reactions,
  loveCount
}) => {
  const reactionIcons = {
    like: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
          fill="#3B82F6"
        />
      </svg>
    ),
    amei: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 8.5c0-2.485-2.239-4.5-5-4.5-1.664 0-3.134.785-4 2.015C11.134 4.785 9.664 4 8 4 5.239 4 3 6.015 3 8.5c0 3.5 3.5 6.5 9 11.5 5.5-5 9-8 9-11.5z"
          fill="#EF4444"
        />
      </svg>
    ),
    uau: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" fill="#F59E0B"/>
        <circle cx="8" cy="10" r="1" fill="white"/>
        <circle cx="16" cy="10" r="1" fill="white"/>
        <ellipse cx="12" cy="15" rx="2" ry="1.5" fill="white"/>
      </svg>
    ),
    grr: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" fill="#EF4444"/>
        <circle cx="8" cy="10" r="1" fill="white"/>
        <circle cx="16" cy="10" r="1" fill="white"/>
        <path d="M8 16s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    triste: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" fill="#3B82F6"/>
        <circle cx="8" cy="10" r="1" fill="white"/>
        <circle cx="16" cy="10" r="1" fill="white"/>
        <path d="M8 16s1.5-2 4-2 4 2 4 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    nojinho: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" fill="#10B981"/>
        <circle cx="8" cy="10" r="1" fill="white"/>
        <circle cx="16" cy="10" r="1" fill="white"/>
        <path d="M8 15s1-1 4-1 4 1 4 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    apaixonado: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" fill="#EC4899"/>
        <path d="M8 10c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" fill="white"/>
        <path d="M14 10c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" fill="white"/>
        <path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0) + loveCount;

  if (totalReactions === 0) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 px-6 pb-2">
      <div className="flex -space-x-1">
        {Object.entries(reactions).map(([type, count]) => {
          if (count === 0) return null;
          return (
            <div key={type} className="bg-white rounded-full p-1 border border-gray-200">
              {reactionIcons[type as keyof typeof reactionIcons]}
            </div>
          );
        })}
        {loveCount > 0 && (
          <div className="bg-white rounded-full p-1 border border-gray-200">
            {reactionIcons.amei}
          </div>
        )}
      </div>
      <span>
        {totalReactions} {totalReactions === 1 ? 'reação' : 'reações'}
      </span>
    </div>
  );
};