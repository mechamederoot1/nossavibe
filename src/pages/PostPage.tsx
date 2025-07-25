import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { FacebookReactionButton } from "../components/posts/FacebookReactionButton";

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
}

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  created_at: string;
  reactions_count: number;
  replies?: Comment[];
}

interface PostPageProps {
  userToken: string;
  currentUserId: number;
}

export function PostPage({ userToken, currentUserId }: PostPageProps) {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:8000/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else if (response.status === 404) {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Erro ao carregar post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/posts/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(
        `http://localhost:8000/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ content: newComment }),
        },
      );

      if (response.ok) {
        setNewComment("");
        fetchComments(); // Refresh comments
        fetchPost(); // Refresh post to update comment count
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReactionChange = async (reaction: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/posts/${postId}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ reaction_type: reaction }),
        },
      );

      if (response.ok) {
        setCurrentReaction(reaction);
        fetchPost(); // Refresh to get updated reaction count
      }
    } catch (error) {
      console.error("Erro ao adicionar reação:", error);
    }
  };

  const handleReactionRemove = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/posts/${postId}/reactions`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        setCurrentReaction(null);
        fetchPost(); // Refresh to get updated reaction count
      }
    } catch (error) {
      console.error("Erro ao remover reação:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <p className="text-gray-500">Post não encontrado</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Voltar ao feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      {/* Post */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Post Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={
                  post.author.avatar?.startsWith("http")
                    ? post.author.avatar
                    : post.author.avatar
                      ? `http://localhost:8000${post.author.avatar}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          `${post.author.first_name} ${post.author.last_name}`,
                        )}&background=3B82F6&color=fff`
                }
                alt={`${post.author.first_name} ${post.author.last_name}`}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {post.author.first_name} {post.author.last_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatTimeAgo(post.created_at)}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="px-6 py-4">
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>

          {/* Media */}
          {post.media_url && (
            <div className="mt-4">
              {post.media_type === "photo" && (
                <img
                  src={
                    post.media_url.startsWith("http")
                      ? post.media_url
                      : `http://localhost:8000${post.media_url}`
                  }
                  alt="Post media"
                  className="w-full rounded-lg"
                />
              )}
              {post.media_type === "video" && (
                <video
                  src={
                    post.media_url.startsWith("http")
                      ? post.media_url
                      : `http://localhost:8000${post.media_url}`
                  }
                  controls
                  className="w-full rounded-lg"
                />
              )}
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <FacebookReactionButton
                currentReaction={currentReaction}
                reactionsCount={post.reactions_count}
                onReactionChange={handleReactionChange}
                onReactionRemove={handleReactionRemove}
              />

              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Comentar</span>
                {post.comments_count > 0 && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {post.comments_count}
                  </span>
                )}
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <Share className="w-5 h-5" />
                <span className="text-sm font-medium">Compartilhar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            Os comentários foram movidos para o componente PostCard.
            <br />
            Use o botão "Comentar" no post para interagir.
          </p>
        </div>
      </div>
    </div>
  );
}
