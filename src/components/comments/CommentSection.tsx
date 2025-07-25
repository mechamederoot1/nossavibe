import React, { useState, useEffect } from "react";
import { Send, Heart, Reply, MoreHorizontal, X } from "lucide-react";

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
  parent_id?: number;
}

interface CommentSectionProps {
  postId: number;
  userToken: string;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  userToken,
  isOpen,
  onClose,
  isMobile = false,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

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

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/comments/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          post_id: parseInt(postId.toString()),
        }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/comments/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyText,
          post_id: parseInt(postId.toString()),
          parent_id: parentId,
        }),
      });

      if (response.ok) {
        setReplyText("");
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  const containerClass = isMobile
    ? "fixed inset-0 bg-white z-50 flex flex-col"
    : "fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center";

  const modalClass = isMobile
    ? "w-full h-full"
    : "bg-white w-full max-w-2xl max-h-[80vh] rounded-t-xl md:rounded-xl overflow-hidden";

  return (
    <div className={containerClass}>
      <div className={modalClass}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <h3 className="text-lg font-semibold">Comentários</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Main Comment */}
              <div className="flex space-x-3">
                <img
                  src={
                    comment.author.avatar ||
                    `https://ui-avatars.com/api/?name=${comment.author.first_name}+${comment.author.last_name}&background=3B82F6&color=fff`
                  }
                  alt={`${comment.author.first_name} ${comment.author.last_name}`}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="font-medium text-sm">
                      {comment.author.first_name} {comment.author.last_name}
                    </p>
                    <p className="text-gray-900">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{formatTimeAgo(comment.created_at)}</span>
                    <button className="hover:text-red-600 flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{comment.reactions_count}</span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="hover:text-blue-600 flex items-center space-x-1"
                    >
                      <Reply className="w-4 h-4" />
                      <span>Responder</span>
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <form
                      onSubmit={(e) => handleSubmitReply(e, comment.id)}
                      className="mt-2 flex space-x-2"
                    >
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escreva uma resposta..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={loading || !replyText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-6 mt-3 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex space-x-3">
                          <img
                            src={
                              reply.author.avatar ||
                              `https://ui-avatars.com/api/?name=${reply.author.first_name}+${reply.author.last_name}&background=3B82F6&color=fff`
                            }
                            alt={`${reply.author.first_name} ${reply.author.last_name}`}
                            className="w-6 h-6 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-2">
                              <p className="font-medium text-xs">
                                {reply.author.first_name}{" "}
                                {reply.author.last_name}
                              </p>
                              <p className="text-gray-900 text-sm">
                                {reply.content}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                              <span>{formatTimeAgo(reply.created_at)}</span>
                              <button className="hover:text-red-600 flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{reply.reactions_count}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmitComment} className="flex space-x-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};