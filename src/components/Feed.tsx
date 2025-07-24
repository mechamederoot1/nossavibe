import React, { useState, useEffect } from "react";
import { ResponsiveCreatePostModal } from "./modals/ResponsiveCreatePostModal";
import { ResponsiveCreateStoryModal } from "./modals/ResponsiveCreateStoryModal";
import { PostCard } from "./posts/PostCard";
import { StoriesBar } from "./stories/StoriesBar";
import { createStoryWithFile } from "./stories/StoryUploadHelper";
import { apiCall } from "../config/api";
import { toast } from "./ui/Toast";

// Global function type declaration
declare global {
  interface Window {
    refreshProfilePosts?: () => void;
  }
}

interface FeedProps {
  user: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    token: string;
  };
}

interface Post {
  id: number;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  content: string;
  post_type: "post" | "testimonial";
  media_type?: string;
  media_url?: string;
  created_at: string;
  reactions_count: number;
  comments_count: number;
  shares_count: number;
  is_profile_update?: boolean;
  is_cover_update?: boolean;
}

export const Feed: React.FC<FeedProps> = ({ user }) => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storyRefreshTrigger, setStoryRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, [user.token]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall("/posts/", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(
          data.map((post: any) => ({
            ...post,
            user: post.author, // Map author to user for PostCard compatibility
            author: {
              ...post.author,
              name: `${post.author.first_name} ${post.author.last_name}`,
            },
            likes_count: post.reactions_count || 0,
            is_liked: false, // Set default values
            is_bookmarked: false,
          })),
        );
      } else if (response.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else {
        setError("Erro ao carregar posts");
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (
    content: string,
    type: "post" | "testimonial",
    privacy: string,
    mediaData?: any,
  ) => {
    try {
      const payload: any = {
        content,
        post_type: type,
        privacy: privacy,
      };

      // Handle multiple media files
      if (mediaData && mediaData.urls && mediaData.urls.length > 0) {
        if (mediaData.urls.length === 1) {
          // Single media file
          payload.media_type = mediaData.types[0];
          payload.media_url = mediaData.urls[0];
        } else {
          // Multiple media files - store as JSON metadata
          payload.media_type = "multiple";
          payload.media_metadata = JSON.stringify({
            files: mediaData.urls.map((url: string, index: number) => ({
              url,
              type: mediaData.types[index],
            })),
            count: mediaData.count,
          });
        }
      }

      const response = await apiCall("/posts/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const postData = await response.json();
        console.log("✅ Post/Testimonial created successfully:", postData);
        console.log("🔄 Refreshing feeds...");

        fetchPosts();
        setShowCreatePost(false);

        // Refresh profile posts if user is on profile page
        if (
          window.refreshProfilePosts &&
          typeof window.refreshProfilePosts === "function"
        ) {
          console.log("🔄 Calling profile posts refresh...");
          setTimeout(() => {
            window.refreshProfilePosts!();
          }, 500); // Small delay to ensure backend has processed
        } else {
          console.log(
            "ℹ️ Profile refresh function not available (user not on profile page)",
          );
        }

        // Show success message
        if (type === "testimonial") {
          toast.success("🎉 Depoimento criado com sucesso!");
        } else {
          toast.success("🎉 Post criado com sucesso!");
        }
      } else {
        const error = await response.json();
        console.error("Erro ao criar post:", error);
        toast.error("Erro ao criar post: " + (error.detail || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao criar publicação:", error);
      toast.error("Erro ao criar publicação");
    }
  };

  const handleCreateStory = async (
    content: string,
    mediaData?: any,
    storyDuration?: number,
    backgroundColor?: string,
    privacy?: string,
    overlays?: any[],
  ) => {
    console.log("🔥 Feed handleCreateStory called with:", {
      content,
      mediaData,
      storyDuration,
      backgroundColor,
    });

    try {
      // Extract the actual file from mediaData if present
      const mediaFile = mediaData?.file || null;

      const success = await createStoryWithFile(
        content,
        mediaFile,
        storyDuration || 24,
        backgroundColor || "#3B82F6",
        privacy || "public",
        user.token,
      );

      if (success) {
        console.log("✅ Story created successfully!");
        // Trigger immediate refresh of stories
        setStoryRefreshTrigger((prev) => prev + 1);
        setShowCreateStory(false);
        toast.success("🎉 Story criado com sucesso!");
      } else {
        console.error("❌ Failed to create story");
        throw new Error("Erro ao criar story");
      }
    } catch (error) {
      console.error("❌ Error creating story:", error);
      toast.error(error instanceof Error ? error.message : "❌ Erro ao criar story. Tente novamente.");
    }
  };

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
          <p className="text-red-600 text-sm md:text-base">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm md:text-base"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Stories Bar */}
      <StoriesBar
        userToken={user.token}
        onCreateStory={() => setShowCreateStory(true)}
        currentUser={user}
        refreshTrigger={storyRefreshTrigger}
      />

      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex items-center space-x-3 md:space-x-4">
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff`
            }
            alt={user.name}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full"
          />
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left p-3 md:p-4 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors text-sm md:text-base"
          >
            No que você está pensando, {user.name.split(" ")[0]}?
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-3 md:space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 md:py-12">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
            <p className="text-slate-500 text-base md:text-lg">Nenhum post ainda.</p>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Seja o primeiro a compartilhar algo!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={(postId) => console.log('Like post:', postId)}
              onComment={(postId) => console.log('Comment post:', postId)}
              onShare={(postId) => console.log('Share post:', postId)}
              onBookmark={(postId) => console.log('Bookmark post:', postId)}
            />
          ))
        )}
      </div>

      {/* Create Post Modal */}
      <ResponsiveCreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
        userToken={user.token}
      />

      {/* Create Story Modal */}
      <ResponsiveCreateStoryModal
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onSubmit={handleCreateStory}
        onSuccess={() => {
          setStoryRefreshTrigger((prev) => prev + 1);
          setShowCreateStory(false);
        }}
        userToken={user.token}
      />
    </div>
  );
};
