import React, { useState } from 'react';
import { Eye, User } from 'lucide-react';
import { useUserStories } from '../../hooks/useUserStories';

interface StoryAvatarProps {
  userId: number;
  userToken: string;
  avatarUrl?: string;
  userName: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  onViewPhoto?: () => void;
  onViewStory?: () => void;
  showIndicator?: boolean;
  showOptionsMenu?: boolean;
  className?: string;
}

export function StoryAvatar({
  userId,
  userToken,
  avatarUrl,
  userName,
  size = 'medium',
  onClick,
  onViewPhoto,
  onViewStory,
  showIndicator = true,
  showOptionsMenu = false,
  className = ''
}: StoryAvatarProps) {
  const { hasStories, loading } = useUserStories(userId, userToken);
  const [showMenu, setShowMenu] = useState(false);

  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-32 h-32'
  };

  const indicatorSizes = {
    small: 'w-12 h-12',
    medium: 'w-[4.5rem] h-[4.5rem]',
    large: 'w-36 h-36'
  };

  const getAvatarUrl = () => {
    if (!avatarUrl) {
      return null; // Retorna null para mostrar ícone ao invés de URL gerada
    }

    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }

    return `http://localhost:8000${avatarUrl}`;
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showOptionsMenu && (onViewPhoto || onViewStory)) {
      setShowMenu(!showMenu);
    } else if (onClick) {
      onClick();
    }
  };

  const handleViewPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onViewPhoto) onViewPhoto();
  };

  const handleViewStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onViewStory) onViewStory();
  };

  const avatarElement = (
    <div className={`relative inline-block ${className}`}>
      {/* Story indicator ring - static without animation */}
      {showIndicator && hasStories && !loading && (
        <div className={`absolute -inset-1 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 p-1 shadow-lg`}>
        </div>
      )}

      {/* Avatar image or icon */}
      {getAvatarUrl() ? (
        <img
          src={getAvatarUrl()}
          alt={userName}
          className={`${sizeClasses[size]} rounded-full object-cover ${
            showIndicator && hasStories && !loading
              ? 'border-3 border-white relative z-10'
              : 'border-2 border-gray-200'
          } shadow-md`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-100 border-2 border-gray-200 shadow-md flex items-center justify-center`}
        >
          <User className={`${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-6 h-6' : 'w-12 h-12'} text-gray-400`} />
        </div>
      )}

      {/* Loading indicator */}
      {loading && showIndicator && (
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-3 border-gray-300 animate-spin border-t-blue-500`} />
      )}

      {/* Options Menu */}
      {showMenu && showOptionsMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />

          {/* Menu */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[160px] overflow-hidden">
            {onViewPhoto && (
              <button
                onClick={handleViewPhoto}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-gray-800">Ver foto de perfil</span>
              </button>
            )}

            {onViewStory && hasStories && (
              <button
                onClick={handleViewStory}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors border-t border-gray-100"
              >
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-gray-800">Ver story</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (onClick || showOptionsMenu) {
    return (
      <button
        onClick={handleAvatarClick}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-transform hover:scale-105"
      >
        {avatarElement}
      </button>
    );
  }

  return avatarElement;
}
