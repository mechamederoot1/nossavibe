import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal, 
  Edit3, 
  Trash2,
  Flag,
  Link,
  Eye,
  EyeOff
} from 'lucide-react';

interface PostAuthor {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
}

interface Post {
  id: number;
  author: PostAuthor;
  content: string;
  post_type: "post" | "testimonial";
  media_url?: string;
  media_type?: string;
  created_at: string;
  reactions_count: number;
  comments_count: number;
  shares_count: number;
  is_profile_update?: boolean;
  is_cover_update?: boolean;
}

interface PostCardProps {
  post: Post;
  userToken: string;
  currentUserId: number;
  canEdit?: boolean;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number) => void;
}

export function PostCard({ 
  post, 
  userToken,
  currentUserId,
  canEdit = false,
  onLike, 
  onComment, 
  onShare, 
  onBookmark,
  onDelete,
  onEdit
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.reactions_count);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReaction = async (reactionType: string = "like") => {
    try {
      const response = await fetch(`http://localhost:8000/posts/${post.id}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ reaction_type: reactionType }),
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        onLike?.(post.id);
      }
    } catch (error) {
      console.error("Erro ao reagir ao post:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar este post?")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:8000/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        onDelete?.(post.id);
      } else {
        alert("Erro ao deletar post");
      }
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      alert("Erro ao deletar post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async () => {
    // Implementar sistema de denúncia
    alert("Funcionalidade de denúncia será implementada");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getPostTypeLabel = () => {
    if (post.is_profile_update) return "atualizou a foto do perfil";
    if (post.is_cover_update) return "atualizou a foto de capa";
    if (post.post_type === "testimonial") return "escreveu um depoimento";
    return "";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={
                post.author.avatar
                  ? post.author.avatar.startsWith("http")
                    ? post.author.avatar
                    : `http://localhost:8000${post.author.avatar}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${post.author.first_name} ${post.author.last_name}`
                    )}&background=3B82F6&color=fff`
              }
              alt={`${post.author.first_name} ${post.author.last_name}`}
              className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
              onClick={() => window.location.href = `/profile/${post.author.id}`}
            />
            
            <div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.location.href = `/profile/${post.author.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {post.author.first_name} {post.author.last_name}
                </button>
                
                {getPostTypeLabel() && (
                  <span className="text-gray-600 text-sm">{getPostTypeLabel()}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatTimeAgo(post.created_at)}</span>
                {post.post_type === "testimonial" && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                    Depoimento
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showOptions && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {canEdit && (
                  <>
                    <button
                      onClick={() => {
                        onEdit?.(post.id);
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowOptions(false);
                      }}
                      disabled={isDeleting}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeleting ? "Deletando..." : "Deletar"}</span>
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                  </>
                )}
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                    setShowOptions(false);
                    alert("Link copiado!");
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Link className="w-4 h-4" />
                  <span>Copiar link</span>
                </button>
                
                {!canEdit && (
                  <button
                    onClick={() => {
                      handleReport();
                      setShowOptions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Denunciar</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {post.content && (
          <p className="text-gray-900 mb-4 whitespace-pre-wrap">{post.content}</p>
        )}

        {/* Media */}
        {post.media_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            {post.media_type?.startsWith("image/") ? (
              <img
                src={
                  post.media_url.startsWith("http")
                    ? post.media_url
                    : `http://localhost:8000${post.media_url}`
                }
                alt="Mídia do post"
                className="w-full max-h-96 object-cover"
              />
            ) : post.media_type?.startsWith("video/") ? (
              <video
                src={
                  post.media_url.startsWith("http")
                    ? post.media_url
                    : `http://localhost:8000${post.media_url}`
                }
                controls
                className="w-full max-h-96"
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            ) : null}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Reaction counts */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {likesCount > 0 && (
              <span>{likesCount} {likesCount === 1 ? "curtida" : "curtidas"}</span>
            )}
            {post.comments_count > 0 && (
              <span>{post.comments_count} {post.comments_count === 1 ? "comentário" : "comentários"}</span>
            )}
            {post.shares_count > 0 && (
              <span>{post.shares_count} {post.shares_count === 1 ? "compartilhamento" : "compartilhamentos"}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleReaction("like")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? "bg-red-50 text-red-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span>Curtir</span>
            </button>

            <button
              onClick={() => onComment?.(post.id)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Comentar</span>
            </button>

            <button
              onClick={() => onShare?.(post.id)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Share className="w-5 h-5" />
              <span>Compartilhar</span>
            </button>
          </div>

          <button
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              onBookmark?.(post.id);
            }}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
