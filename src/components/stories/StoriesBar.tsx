import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoryViewer } from '../stories/StoryViewer';

interface Story {
  id: number;
  content: string;
  media_type?: string;
  media_url?: string;
  background_color?: string;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  created_at: string;
  expires_at: string;
  views_count: number;
  viewed_by_user?: boolean;
}

interface StoriesBarProps {
  userToken: string;
  onCreateStory: () => void;
  currentUser: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    token: string;
  };
  refreshTrigger?: number;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ userToken, onCreateStory, currentUser, refreshTrigger }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [groupedStories, setGroupedStories] = useState<{ [key: number]: Story[] }>({});
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<Story[] | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const storiesPerPage = isMobile ? 4 : 6;

  useEffect(() => {
    fetchStories();

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Refresh stories when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchStories();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    // Group stories by author
    const grouped = stories.reduce((acc, story) => {
      const authorId = story.author.id;
      if (!acc[authorId]) {
        acc[authorId] = [];
      }
      acc[authorId].push(story);
      return acc;
    }, {} as { [key: number]: Story[] });

    // Sort stories within each group by creation date
    Object.keys(grouped).forEach(authorId => {
      grouped[parseInt(authorId)].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    setGroupedStories(grouped);
  }, [stories]);

  const fetchStories = async () => {
    try {
      const response = await fetch('http://localhost:8000/stories/', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStories(data);
      }
    } catch (error) {
      console.error('Erro ao carregar stories:', error);
    }
  };

  const handleViewStoryGroup = (authorId: number, storyIndex: number = 0) => {
    const authorStories = groupedStories[authorId];
    if (authorStories && authorStories.length > 0) {
      setSelectedStoryGroup(authorStories);
      setSelectedStoryIndex(storyIndex);

      // Marcar stories como lidos quando o grupo é aberto
      markStoriesAsViewed(authorStories);
    }
  };

  const markStoriesAsViewed = async (storiesToMark: Story[]) => {
    // Marcar apenas stories que ainda não foram lidos
    const unreadStories = storiesToMark.filter(story => !story.viewed_by_user);

    if (unreadStories.length === 0) return;

    // Atualizar estado local imediatamente para melhor UX
    setStories(prevStories =>
      prevStories.map(story => {
        if (unreadStories.some(unread => unread.id === story.id)) {
          return { ...story, viewed_by_user: true };
        }
        return story;
      })
    );

    // Marcar no backend (assíncrono)
    for (const story of unreadStories) {
      try {
        await fetch(`http://localhost:8000/stories/${story.id}/view`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });
      } catch (error) {
        console.error(`Erro ao marcar story ${story.id} como lido:`, error);
      }
    }
  };

  const handleDeleteStory = (storyId: string) => {
    setStories(prev => prev.filter(story => story.id !== parseInt(storyId)));
    
    // If the deleted story was the last one in the group, close the viewer
    if (selectedStoryGroup) {
      const updatedGroup = selectedStoryGroup.filter(story => story.id !== parseInt(storyId));
      if (updatedGroup.length === 0) {
        setSelectedStoryGroup(null);
      } else {
        setSelectedStoryGroup(updatedGroup);
        // Adjust index if necessary
        if (selectedStoryIndex >= updatedGroup.length) {
          setSelectedStoryIndex(updatedGroup.length - 1);
        }
      }
    }
  };

  const getStoryPreview = (authorStories: Story[]) => {
    const latestStory = authorStories[authorStories.length - 1];

    // Helper function to get full URL for media
    const getMediaUrl = (url: string) => {
      if (url.startsWith('http')) {
        return url; // Already a full URL
      }
      // Add API base URL for relative paths
      return `http://localhost:8000${url}`;
    };

    if ((latestStory.media_type === 'photo' || latestStory.media_type === 'image') && latestStory.media_url) {
      return (
        <img
          src={getMediaUrl(latestStory.media_url)}
          alt="Story preview"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('❌ Failed to load story preview image:', latestStory.media_url);
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    
    if (latestStory.media_type === 'video' && latestStory.media_url) {
      return (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
          <video
            src={getMediaUrl(latestStory.media_url)}
            className="w-full h-full object-cover absolute inset-0"
            muted
            onError={(e) => {
              console.error('❌ Failed to load story preview video:', latestStory.media_url);
            }}
          />
          <span className="text-white text-2xl relative z-10">📹</span>
        </div>
      );
    }
    
    if (latestStory.media_type === 'music' && latestStory.media_url) {
      return (
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: latestStory.background_color || '#3B82F6' }}
        >
          <span className="text-white text-2xl">🎵</span>
        </div>
      );
    }
    
    return (
      <div 
        className="w-full h-full flex items-center justify-center text-white text-xs font-medium p-1"
        style={{ backgroundColor: latestStory.background_color || '#3B82F6' }}
      >
        <span className="text-center leading-tight">
          {latestStory.content?.substring(0, 10) || '📝'}
          {latestStory.content && latestStory.content.length > 10 && '...'}
        </span>
      </div>
    );
  };

  const uniqueAuthors = Object.keys(groupedStories).map(id => parseInt(id));
  const totalPages = Math.ceil(uniqueAuthors.length / storiesPerPage);
  const currentAuthors = uniqueAuthors.slice(
    currentPage * storiesPerPage,
    (currentPage + 1) * storiesPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Stories</h3>
          <div className="flex items-center space-x-2">
            {totalPages > 1 && (
              <>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500 px-2">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex space-x-4 overflow-hidden">
          {/* Add Story Button */}
          <button
            onClick={onCreateStory}
            className="flex-shrink-0 flex flex-col items-center space-y-2 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Seu story</span>
          </button>

          {/* Stories */}
          {currentAuthors.map((authorId) => {
            const authorStories = groupedStories[authorId];
            const author = authorStories[0].author;
            const totalViews = authorStories.reduce((sum, story) => sum + story.views_count, 0);

            // Verificar se há stories não lidos neste grupo
            const hasUnreadStories = authorStories.some(story => !story.viewed_by_user);

            return (
              <button
                key={authorId}
                onClick={() => handleViewStoryGroup(authorId)}
                className="flex-shrink-0 flex flex-col items-center space-y-2 group"
              >
                <div className="relative">
                  {/* Container com borda gradient estilo Instagram */}
                  <div className={`w-16 h-16 rounded-full p-0.5 group-hover:scale-105 transition-all duration-200 ${
                    hasUnreadStories
                      ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 shadow-lg'
                      : 'bg-gray-300'
                  }`}>
                    {/* Fundo branco interno para criar efeito de borda */}
                    <div className="w-full h-full rounded-full p-0.5 bg-white">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                        {getStoryPreview(authorStories)}
                      </div>
                    </div>
                  </div>

                  {/* Indicador de novo story (ponto azul) */}
                  {hasUnreadStories && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                  
                  {/* Story count indicator */}
                  {authorStories.length > 1 && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                      {authorStories.length}
                    </div>
                  )}
                  
                  {/* Views count */}
                  {totalViews > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{totalViews > 99 ? '99+' : totalViews}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 max-w-16 truncate font-medium">
                  {author.first_name}
                </span>
              </button>
            );
          })}

          {/* Empty state */}
          {uniqueAuthors.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-8">
              <p className="text-gray-500 text-sm">Nenhum story ainda. Seja o primeiro!</p>
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer */}
      {selectedStoryGroup && (
        <StoryViewer
          stories={selectedStoryGroup.map(story => ({
            ...story,
            id: story.id.toString()
          }))}
          currentIndex={selectedStoryIndex}
          onClose={() => {
            setSelectedStoryGroup(null);
            // Refresh stories para atualizar indicadores após visualização
            fetchStories();
          }}
          userToken={userToken}
          onDelete={handleDeleteStory}
          currentUserId={currentUser.id}
        />
      )}
    </>
  );
};
