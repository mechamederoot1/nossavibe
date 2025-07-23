import { useEffect, useState } from 'react';

interface Story {
  id: string;
  expires_at: string;
  author: {
    first_name: string;
    last_name: string;
  };
}

interface UseStoryNotificationsProps {
  userToken: string;
  userId?: number;
}

export const useStoryNotifications = ({ userToken, userId }: UseStoryNotificationsProps) => {
  const [userStories, setUserStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!userId || !userToken) return;

    const fetchUserStories = async () => {
      try {
        const response = await fetch(`http://localhost:8000/stories/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });
        
        if (response.ok) {
          const stories = await response.json();
          setUserStories(stories);
        }
      } catch (error) {
        console.error('Erro ao buscar stories do usuário:', error);
      }
    };

    fetchUserStories();
    
    // Check every minute for expiring stories
    const interval = setInterval(fetchUserStories, 60000);
    
    return () => clearInterval(interval);
  }, [userId, userToken]);

  useEffect(() => {
    const checkExpiringStories = () => {
      const now = new Date();
      
      userStories.forEach(story => {
        const expiresAt = new Date(story.expires_at);
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
        
        // Notify when story is about to expire (1 hour before)
        if (hoursUntilExpiry > 0 && hoursUntilExpiry <= 1) {
          const minutesLeft = Math.floor((timeUntilExpiry / (1000 * 60)));
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Story expirando!', {
              body: `Seu story expira em ${minutesLeft} minutos`,
              icon: '/vite.svg',
              tag: `story-expiring-${story.id}`,
            });
          }
        }
      });
    };

    if (userStories.length > 0) {
      checkExpiringStories();
      
      // Check every 5 minutes for expiring stories
      const interval = setInterval(checkExpiringStories, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [userStories]);

  return { userStories };
};