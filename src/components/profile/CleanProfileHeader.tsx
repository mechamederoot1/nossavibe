import React, { useState, useRef } from "react";
import {
  Camera,
  MapPin,
  Calendar,
  Edit3,
  Mail,
  Phone,
  UserPlus,
  MessageCircle,
} from "lucide-react";

interface ProfileHeaderProps {
  user: {
    id?: number;
    name: string;
    email?: string;
    avatar?: string;
    cover_photo?: string;
    location?: string;
    bio?: string;
    username?: string;
    nickname?: string;
    phone?: string;
    website?: string;
    is_verified?: boolean;
    followers_count?: number;
    following_count?: number;
    posts_count?: number;
  };
  isOwnProfile: boolean;
  userToken: string;
  onEditProfile?: () => void;
  onProfileUpdate?: () => void;
  currentUserId?: number;
}

export function CleanProfileHeader({
  user,
  isOwnProfile,
  userToken,
  onEditProfile,
  onProfileUpdate,
  currentUserId,
}: ProfileHeaderProps) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("http://localhost:8000/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Avatar uploaded successfully:", data);

        // Call onProfileUpdate to refresh user data
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        const errorData = await response.json();
        alert(
          `Erro ao enviar foto: ${errorData.detail || "Erro desconhecido"}`,
        );
      }
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      alert("Erro ao enviar foto");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("cover", file);

    try {
      const response = await fetch("http://localhost:8000/profile/cover", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Cover uploaded successfully:", data);

        // Call onProfileUpdate to refresh user data
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        const errorData = await response.json();
        alert(
          `Erro ao enviar capa: ${errorData.detail || "Erro desconhecido"}`,
        );
      }
    } catch (error) {
      console.error("Erro ao fazer upload da capa:", error);
      alert("Erro ao enviar capa");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCoverUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {user.cover_photo && (
          <img
            src={
              user.cover_photo.startsWith("http")
                ? user.cover_photo
                : `http://localhost:8000${user.cover_photo}`
            }
            alt="Capa"
            className="w-full h-full object-cover"
          />
        )}

        {isOwnProfile && (
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-16 mb-4">
          <div className="relative">
            <img
              src={
                user.avatar
                  ? user.avatar.startsWith("http")
                    ? user.avatar
                    : `http://localhost:8000${user.avatar}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=fff&size=128`
              }
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />

            {isOwnProfile && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {isOwnProfile ? (
              <button
                onClick={onEditProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar perfil</span>
              </button>
            ) : (
              <>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  <span>Seguir</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Mensagem</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            {user.is_verified && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          {user.username && (
            <p className="text-gray-500 mb-2">@{user.username}</p>
          )}

          {user.bio && <p className="text-gray-600 mb-3">{user.bio}</p>}

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            {user.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}

            {user.email && isOwnProfile && (
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            )}

            {user.phone && isOwnProfile && (
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Entrou em janeiro de 2025</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {user.posts_count || 0}
              </div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {user.followers_count || 0}
              </div>
              <div className="text-sm text-gray-500">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {user.following_count || 0}
              </div>
              <div className="text-sm text-gray-500">Seguindo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
