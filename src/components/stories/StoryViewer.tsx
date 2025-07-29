import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MoreVertical, Trash2, Eye } from 'lucide-react';

interface Story {
  id: string;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  media_type?: string;
  media_url?: string;
  content?: string;
  background_color?: string;
  created_at: string;
  expires_at: string;
  views_count: number;
  viewed_by_user?: boolean;
}

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  userToken: string;
  onDelete?: (storyId: string) => void;
  currentUserId?: number;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex,
  onClose,
  userToken,
  onDelete,
  currentUserId
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [duration] = useState(5000); // 5 seconds per story
  const [isMobile, setIsMobile] = useState(false);

  const currentStory = stories[activeIndex];

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, activeIndex, duration]);

  useEffect(() => {
    // Mark story as viewed and reset progress
    if (currentStory) {
      markAsViewed(currentStory.id);
    }
    setProgress(0);
  }, [activeIndex]);

  const markAsViewed = async (storyId: string) => {
    try {
      await fetch(`http://localhost:8000/stories/${storyId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const nextStory = () => {
    if (activeIndex < stories.length - 1) {
      setActiveIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDeleteStory = async () => {
    if (!currentStory || !onDelete) return;
    
    if (!confirm('Tem certeza que deseja excluir este story?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/stories/${currentStory.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        onDelete(currentStory.id);
        setShowOptions(false);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const renderStoryContent = () => {
    if (!currentStory) return null;

    // Helper function to get full URL for media
    const getMediaUrl = (url: string) => {
      if (url.startsWith('http')) {
        return url; // Already a full URL
      }
      // Add API base URL for relative paths
      return `http://localhost:8000${url}`;
    };

    if ((currentStory.media_type === 'photo' || currentStory.media_type === 'image') && currentStory.media_url) {
      return (
        <div className="relative w-full h-full">
          <img
            src={getMediaUrl(currentStory.media_url)}
            alt="Story"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('❌ Failed to load story image:', currentStory.media_url);
              e.currentTarget.style.display = 'none';
            }}
          />
          {currentStory.content && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-50 text-white p-4 rounded-lg max-w-xs text-center">
                {currentStory.content}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (currentStory.media_type === 'video' && currentStory.media_url) {
      return (
        <div className="relative w-full h-full">
          <video
            src={getMediaUrl(currentStory.media_url)}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            onError={(e) => {
              console.error('❌ Failed to load story video:', currentStory.media_url);
            }}
          />
          {currentStory.content && (
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-black bg-opacity-50 text-white p-2 rounded-lg text-center">
                {currentStory.content}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (currentStory.media_type === 'music' && currentStory.media_url) {
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center text-white p-4"
          style={{ backgroundColor: currentStory.background_color || '#3B82F6' }}
        >
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">🎵</div>
            {currentStory.content && (
              <div className="text-lg font-medium mb-4">{currentStory.content}</div>
            )}
          </div>
          <audio
            src={getMediaUrl(currentStory.media_url)}
            controls
            className="w-full max-w-xs"
            autoPlay
            onError={(e) => {
              console.error('❌ Failed to load story audio:', currentStory.media_url);
            }}
          />
        </div>
      );
    }
    
    // Text story
    return (
      <div 
        className="w-full h-full flex items-center justify-center text-white text-center p-4"
        style={{ backgroundColor: currentStory.background_color || '#3B82F6' }}
      >
        <div className="text-lg font-medium">
          {currentStory.content}
        </div>
      </div>
    );
  };

  if (!currentStory) return null;

  const isCurrentUserStory = currentUserId === currentStory.author.id;

  return (
    <div className={`fixed inset-0 bg-black z-50 flex items-center justify-center ${isMobile ? '' : 'p-4'}`}>
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: index < activeIndex ? '100%' : index === activeIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <img
            src={currentStory.author.avatar || `https://ui-avatars.com/api/?name=${currentStory.author.first_name}+${currentStory.author.last_name}&background=3B82F6&color=fff`}
            alt={`${currentStory.author.first_name} ${currentStory.author.last_name}`}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <p className="text-white font-medium">
              {currentStory.author.first_name} {currentStory.author.last_name}
            </p>
            <p className="text-gray-300 text-sm">
              {formatTimeAgo(currentStory.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Views count */}
          <div className="flex items-center space-x-1 text-white">
            <Eye className="w-4 h-4" />
            <span className="text-sm">{currentStory.views_count}</span>
          </div>
          
          {isCurrentUserStory && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 text-white hover:bg-black hover:bg-opacity-20 rounded-full"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-10 bg-gray-800 rounded-lg shadow-lg z-20 w-48 overflow-hidden">
                  <button
                    onClick={handleDeleteStory}
                    className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Deletar Story</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-black hover:bg-opacity-20 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div className={`relative ${isMobile ? 'w-full h-full' : 'w-full h-full max-w-md mx-auto'}`}>
        {renderStoryContent()}

        {/* Navigation areas */}
        <div className="absolute inset-0 flex">
          <div 
            className="w-1/2 h-full cursor-pointer" 
            onClick={prevStory}
          />
          <div 
            className="w-1/2 h-full cursor-pointer" 
            onClick={nextStory}
          />
        </div>

        {/* Tap to pause/play */}
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 w-full h-full opacity-0"
        />
      </div>

      {/* Navigation buttons (visible on hover for desktop) */}
      {!isMobile && (
        <>
          <button
            onClick={prevStory}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-40 text-white rounded-full z-10 transition-opacity hover:bg-opacity-60 ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-70'}`}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextStory}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-40 text-white rounded-full z-10 transition-opacity hover:bg-opacity-60 ${activeIndex === stories.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-70'}`}
            disabled={activeIndex === stories.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Play/Pause indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <div className="w-0 h-0 border-l-8 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
          </div>
        </div>
      )}
    </div>
  );
};
