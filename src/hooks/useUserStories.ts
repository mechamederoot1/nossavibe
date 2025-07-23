import { useState, useEffect } from 'react';
import { apiCall } from '../config/api';

interface Story {
  id: string;
  author_id: number;
  created_at: string;
  expires_at: string;
}

export function useUserStories(userId: number, userToken: string) {
  const [hasStories, setHasStories] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserStories() {
      if (!userId || !userToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiCall(`/stories/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          const stories: Story[] = await response.json();
          
          // Check if user has any active (non-expired) stories
          const now = new Date();
          const activeStories = stories.filter(story => {
            const expiresAt = new Date(story.expires_at);
            return expiresAt > now;
          });

          setHasStories(activeStories.length > 0);
        } else {
          // Fallback: check general stories endpoint
          const generalResponse = await apiCall('/stories/', {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });

          if (generalResponse.ok) {
            const allStories: Story[] = await generalResponse.json();
            const userStories = allStories.filter(story => story.author_id === userId);
            
            const now = new Date();
            const activeStories = userStories.filter(story => {
              const expiresAt = new Date(story.expires_at);
              return expiresAt > now;
            });

            setHasStories(activeStories.length > 0);
          }
        }
      } catch (error) {
        console.error('Error checking user stories:', error);
        setHasStories(false);
      } finally {
        setLoading(false);
      }
    }

    checkUserStories();
  }, [userId, userToken]);

  return { hasStories, loading };
}
