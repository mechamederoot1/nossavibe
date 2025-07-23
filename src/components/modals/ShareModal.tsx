import React, { useState } from "react";
import { X, Globe, Users, Lock } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (content: string, privacy: string) => void;
  post: {
    id: number;
    author: {
      id: number;
      first_name: string;
      last_name: string;
      avatar?: string;
    };
    content: string;
    post_type: "post" | "testimonial";
    created_at: string;
  };
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onShare,
  post,
}) => {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("public");

  const privacyOptions = [
    {
      value: "public",
      label: "Público",
      icon: Globe,
      description: "Qualquer pessoa pode ver",
    },
    {
      value: "friends",
      label: "Amigos",
      icon: Users,
      description: "Apenas seus amigos",
    },
    {
      value: "private",
      label: "Privado",
      icon: Lock,
      description: "Apenas você",
    },
  ];

  const handleSubmit = () => {
    onShare(content, privacy);
    setContent("");
    setPrivacy("public");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Compartilhar Post</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Share Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicione um comentário (opcional)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="O que você pensa sobre isso?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quem pode ver?
            </label>
            <div className="space-y-2">
              {privacyOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    privacy === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value={option.value}
                    checked={privacy === option.value}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="sr-only"
                  />
                  <option.icon className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Original Post Preview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={
                  post.author.avatar ||
                  `https://ui-avatars.com/api/?name=${post.author.first_name}+${post.author.last_name}&background=3B82F6&color=fff`
                }
                alt={`${post.author.first_name} ${post.author.last_name}`}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {post.author.first_name} {post.author.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(post.created_at)}
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-sm line-clamp-3">{post.content}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
};
