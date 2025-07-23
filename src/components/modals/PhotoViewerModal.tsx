import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Flag,
  Shield,
} from "lucide-react";
import { CommentSection } from "../comments/CommentSection";
import { ReactionButton } from "../posts/ReactionButton";
import { ShareModal } from "./ShareModal";
import { PhotoPrivacyModal } from "./PhotoPrivacyModal";

interface Photo {
  id: number;
  url: string;
  caption?: string;
  created_at: string;
  privacy: string;
  type: "profile" | "cover" | "post";
  reactions_count: number;
  comments_count: number;
  shares_count: number;
  user_reacted?: boolean;
  reaction_type?: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  username?: string;
}

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: Photo | null;
  photos?: Photo[]; // For gallery navigation
  currentIndex?: number;
  user: User;
  userToken: string;
  canEdit?: boolean;
}

export function PhotoViewerModal({
  isOpen,
  onClose,
  photo,
  photos = [],
  currentIndex = 0,
  user,
  userToken,
  canEdit = false,
}: PhotoViewerModalProps) {
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(photo);
  const [currentIdx, setCurrentIdx] = useState(currentIndex);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (photo) {
      setCurrentPhoto(photo);
    }
  }, [photo]);

  useEffect(() => {
    if (photos.length > 0 && currentIdx >= 0 && currentIdx < photos.length) {
      setCurrentPhoto(photos[currentIdx]);
    }
  }, [currentIdx, photos]);

  const handlePrevious = () => {
    if (photos.length > 1) {
      setCurrentIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    }
  };

  const handleNext = () => {
    if (photos.length > 1) {
      setCurrentIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!currentPhoto) return;

    try {
      const response = await fetch("http://localhost:8000/photos/react", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          photo_id: currentPhoto.id,
          reaction_type: reactionType,
        }),
      });

      if (response.ok) {
        // Update the current photo's reaction data
        setCurrentPhoto((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            user_reacted: true,
            reaction_type: reactionType,
            reactions_count: prev.user_reacted
              ? prev.reactions_count
              : prev.reactions_count + 1,
          };
        });
      }
    } catch (error) {
      console.error("Erro ao reagir à foto:", error);
    }
  };

  const handleDownload = () => {
    if (currentPhoto) {
      const link = document.createElement("a");
      link.href = currentPhoto.url;
      link.download = `photo-${currentPhoto.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async () => {
    if (!currentPhoto || !canEdit) return;

    if (confirm("Tem certeza que deseja excluir esta foto?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/photos/${currentPhoto.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          },
        );

        if (response.ok) {
          onClose();
        }
      } catch (error) {
        console.error("Erro ao excluir foto:", error);
      }
    }
  };

  const handlePrivacyChange = (newPrivacy: string, photoId?: number) => {
    if (currentPhoto && photoId === currentPhoto.id) {
      setCurrentPhoto((prev) =>
        prev ? { ...prev, privacy: newPrivacy } : prev,
      );
    }
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={(e) => {
      // Only close if clicking on the backdrop, not on the content
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
        <div className="w-full h-full flex flex-col md:flex-row max-w-7xl mx-auto">
          {/* Photo Section */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main Photo */}
            <img
              src={currentPhoto.url}
              alt="Foto"
              className="max-w-full max-h-full object-contain"
            />

            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${user.first_name} ${user.last_name}`,
                    )}&background=3B82F6&color=fff`
                  }
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-white">
                  <p className="font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm opacity-75">
                    {new Date(currentPhoto.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <Download className="w-5 h-5" />
                </button>
                <div className="relative group">
                  <button className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartilhar</span>
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => setShowPrivacyModal(true)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Privacidade</span>
                      </button>
                    )}
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                      <Flag className="w-4 h-4" />
                      <span>Reportar</span>
                    </button>
                    {canEdit && (
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                      >
                        <X className="w-4 h-4" />
                        <span>Excluir</span>
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Comments and Reactions */}
          <div className="w-full md:w-96 bg-white flex flex-col max-h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">
                {currentPhoto.type === "profile"
                  ? "Foto do Perfil"
                  : currentPhoto.type === "cover"
                    ? "Foto de Capa"
                    : "Foto"}
              </h3>
              {currentPhoto.caption && (
                <p className="text-gray-600 mt-2">{currentPhoto.caption}</p>
              )}
            </div>

            {/* Reactions */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ReactionButton
                    postId={currentPhoto.id}
                    userToken={userToken}
                    currentReaction={currentPhoto.reaction_type}
                    onReactionChange={handleReaction}
                  />
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{currentPhoto.comments_count}</span>
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{currentPhoto.shares_count}</span>
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {currentPhoto.reactions_count} curtidas
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto">
              <CommentSection
                postId={currentPhoto.id}
                userToken={userToken}
                onCommentAdded={() => {
                  setCurrentPhoto((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      comments_count: prev.comments_count + 1,
                    };
                  });
                }}
              />
            </div>
          </div>
        </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={`Veja esta foto de ${user.first_name} ${user.last_name}`}
          url={currentPhoto.url}
        />
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && currentPhoto && (
        <PhotoPrivacyModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          photoId={currentPhoto.id}
          currentPrivacy={currentPhoto.privacy}
          onPrivacyChange={handlePrivacyChange}
          userToken={userToken}
        />
      )}
    </div>
  );
}
