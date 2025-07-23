import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';

interface Post {
  id: number;
  content: string;
  media_url?: string;
  media_type?: string;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
}

export function PostCard({ post, onLike, onComment, onShare, onBookmark }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);

  // Handle case where post.user might be undefined
  if (!post.user) {
    console.error('PostCard: post.user is undefined', post);
    return null;
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3 md:mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.first_name + ' ' + post.user.last_name)}&background=3B82F6&color=fff`}
            alt={`${post.user.first_name} ${post.user.last_name}`}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
              {post.user.first_name} {post.user.last_name}
            </h3>
            <p className="text-xs md:text-sm text-gray-500">{formatTime(post.created_at)}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
          <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-3 md:px-4 pb-3">
          <p className="text-gray-900 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.media_url && (
        <div className="relative">
          {post.media_type === 'image' ? (
            <img
              src={post.media_url}
              alt="Post media"
              className="w-full max-h-64 md:max-h-96 object-cover"
            />
          ) : post.media_type === 'video' ? (
            <video
              src={post.media_url}
              controls
              className="w-full max-h-64 md:max-h-96"
            />
          ) : null}
        </div>
      )}

      {/* Actions */}
      <div className="px-3 md:px-4 py-2 md:py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 md:space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs md:text-sm font-medium">{likesCount}</span>
            </button>

            <button
              onClick={() => onComment?.(post.id)}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">{post.comments_count}</span>
            </button>

            <button
              onClick={() => onShare?.(post.id)}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Share className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden md:inline text-xs md:text-sm font-medium">Compartilhar</span>
            </button>
          </div>

          <button
            onClick={handleBookmark}
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
