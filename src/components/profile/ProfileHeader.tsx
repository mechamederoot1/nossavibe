import React, { useState, useRef } from "react";
import {
  Camera,
  Edit3,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Heart,
  MessageCircle,
  Settings,
  Plus,
  Mail,
  Phone,
  Globe,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PhotoEditor } from "../common/PhotoEditor";
import { PhotoViewerModal } from "../modals/PhotoViewerModal";
import { PhotoManagementModal } from "../modals/PhotoManagementModal";
import { NotificationModal } from "../modals/NotificationModal";
import { API_BASE_URL } from "../../config/api";

interface ProfileHeaderProps {
  user: {
    id?: number;
    name: string;
    email: string;
    bio?: string;
    location?: string;
    joinDate?: string;
    avatar?: string;
    cover_photo?: string;
    username?: string;
    nickname?: string;
    phone?: string;
    website?: string;
    birth_date?: string;
    gender?: string;
    relationship_status?: string;
    work?: string;
    education?: string;
    token: string;
  };
  isOwnProfile?: boolean;
  friendsCount?: number;
  postsCount?: number;
  onProfileUpdate?: () => void;
}

export function ProfileHeader({
  user,
  isOwnProfile = true,
  friendsCount = 342,
  postsCount = 0,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const navigate = useNavigate();
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showCoverEditor, setShowCoverEditor] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPrivacy, setPhotoPrivacy] = useState("public");
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showCoverViewer, setShowCoverViewer] = useState(false);
  const [showPhotoManagement, setShowPhotoManagement] = useState(false);
  const [photoManagementTab, setPhotoManagementTab] = useState<
    "profile" | "cover"
  >("profile");

  // Notification modal state
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const createProfilePhotoPost = async (
    photoUrl: string,
    privacy: string = "public",
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          content: "Atualizou a foto do perfil",
          post_type: "post",
          privacy: privacy,
          media_type: "image",
          media_url: photoUrl,
          is_profile_update: true,
        }),
      });

      if (!response.ok) {
        console.error("Erro ao criar post da foto do perfil");
      }
    } catch (error) {
      console.error("Erro ao criar post da foto do perfil:", error);
    }
  };

  const createCoverPhotoPost = async (
    photoUrl: string,
    privacy: string = "public",
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          content: "Atualizou a foto de capa",
          post_type: "post",
          privacy: privacy,
          media_type: "image",
          media_url: photoUrl,
          is_cover_update: true,
        }),
      });

      if (!response.ok) {
        console.error("Erro ao criar post da foto de capa");
      }
    } catch (error) {
      console.error("Erro ao criar post da foto de capa:", error);
    }
  };

  const createProfilePhotoAlbumEntry = async (photoUrl: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/albums/profile-photos/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            photo_url: photoUrl,
            privacy: "public", // Profile photos are usually public
          }),
        },
      );

      if (!response.ok) {
        console.error("Erro ao adicionar foto ao álbum de fotos do perfil");
      }
    } catch (error) {
      console.error(
        "Erro ao adicionar foto ao álbum de fotos do perfil:",
        error,
      );
    }
  };

  const createCoverPhotoAlbumEntry = async (photoUrl: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/albums/cover-photos/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          photo_url: photoUrl,
          privacy: "public", // Cover photos are usually public
        }),
      });

      if (!response.ok) {
        console.error("Erro ao adicionar foto ao ��lbum de fotos de capa");
      }
    } catch (error) {
      console.error("Erro ao adicionar foto ao álbum de fotos de capa:", error);
    }
  };

  const handleAvatarUpload = async (file: File, privacy: string = "public") => {
    if (!file || !isOwnProfile) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // Create album entry for profile photos
        await createProfilePhotoAlbumEntry(data.avatar_url);

        // Create a post about the profile photo update
        await createProfilePhotoPost(data.avatar_url, privacy);

        // Show success modal
        setNotificationData({
          type: "success",
          title: "Sucesso!",
          message: "Sua foto de perfil foi atualizada com sucesso.",
        });
        setShowNotificationModal(true);

        // Trigger a profile refresh
        if (onProfileUpdate) {
          onProfileUpdate();
        }
        // Force refresh without reload - update user data
        setTimeout(() => {
          if (onProfileUpdate) {
            onProfileUpdate();
          }
        }, 500);
      } else {
        const error = await response.json();
        setNotificationData({
          type: "error",
          title: "Erro!",
          message:
            error.detail ||
            "Erro ao atualizar foto de perfil. Tente novamente.",
        });
        setShowNotificationModal(true);
      }
    } catch (error) {
      console.error("Erro ao enviar avatar:", error);
      setNotificationData({
        type: "error",
        title: "Erro!",
        message:
          "Erro de conexão ao enviar foto de perfil. Verifique sua internet e tente novamente.",
      });
      setShowNotificationModal(true);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (file: File, privacy: string = "public") => {
    if (!file || !isOwnProfile) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/profile/cover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // Create album entry for cover photos
        await createCoverPhotoAlbumEntry(data.cover_url);

        // Create a post about the cover photo update
        await createCoverPhotoPost(data.cover_url, privacy);

        // Show success modal
        setNotificationData({
          type: "success",
          title: "Sucesso!",
          message: "Sua foto de capa foi atualizada com sucesso.",
        });
        setShowNotificationModal(true);

        // Trigger a profile refresh
        if (onProfileUpdate) {
          onProfileUpdate();
        }
        // Force refresh without reload - update user data
        setTimeout(() => {
          if (onProfileUpdate) {
            onProfileUpdate();
          }
        }, 500);
      } else {
        const error = await response.json();
        setNotificationData({
          type: "error",
          title: "Erro!",
          message:
            error.detail || "Erro ao atualizar foto de capa. Tente novamente.",
        });
        setShowNotificationModal(true);
      }
    } catch (error) {
      console.error("Erro ao enviar foto de capa:", error);
      setNotificationData({
        type: "error",
        title: "Erro!",
        message:
          "Erro de conexão ao enviar foto de capa. Verifique sua internet e tente novamente.",
      });
      setShowNotificationModal(true);
    } finally {
      setIsUploadingCover(false);
      setShowCoverUpload(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setNotificationData({
          type: "warning",
          title: "Arquivo muito grande!",
          message: "A imagem deve ter no máximo 5MB. Escolha uma imagem menor.",
        });
        setShowNotificationModal(true);
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setNotificationData({
          type: "warning",
          title: "Formato inválido!",
          message:
            "Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.).",
        });
        setShowNotificationModal(true);
        return;
      }
      setSelectedFile(file);
      setShowAvatarEditor(true);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setNotificationData({
          type: "warning",
          title: "Arquivo muito grande!",
          message:
            "A foto de capa deve ter no máximo 10MB. Escolha uma imagem menor.",
        });
        setShowNotificationModal(true);
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setNotificationData({
          type: "warning",
          title: "Formato inválido!",
          message:
            "Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.).",
        });
        setShowNotificationModal(true);
        return;
      }
      setSelectedFile(file);
      setShowCoverEditor(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Cover Photo */}
      <div
        className="relative h-64 group cursor-pointer"
        onMouseEnter={() => setShowCoverUpload(true)}
        onMouseLeave={() => setShowCoverUpload(false)}
        onClick={() => user.cover_photo && setShowCoverViewer(true)}
      >
        {user.cover_photo ? (
          <img
            src={
              user.cover_photo.startsWith("http")
                ? user.cover_photo
                : `http://localhost:8000${user.cover_photo}`
            }
            alt="Foto de capa"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
        )}

        {/* Cover Photo Upload Overlay */}
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center transition-opacity">
            <div className="flex space-x-3 transform scale-0 group-hover:scale-100 transition-transform">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  coverInputRef.current?.click();
                }}
                disabled={isUploadingCover}
                className="flex items-center space-x-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                {isUploadingCover ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>
                      {user.cover_photo ? "Alterar capa" : "Adicionar capa"}
                    </span>
                  </>
                )}
              </button>

              {user.cover_photo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoManagementTab("cover");
                    setShowPhotoManagement(true);
                  }}
                  className="flex items-center space-x-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                  title="Gerenciar fotos de capa"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Gerenciar</span>
                </button>
              )}
            </div>
          </div>
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
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
          {/* Avatar */}
          <div className="relative -mt-20 mb-4 sm:mb-0 group">
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
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (user.avatar) {
                    setShowPhotoViewer(true);
                  }
                }}
              />

              {/* Avatar Upload Button */}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all group-hover:bg-opacity-40">
                  <div className="flex space-x-2 transform scale-0 group-hover:scale-100 transition-transform">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        avatarInputRef.current?.click();
                      }}
                      disabled={isUploadingAvatar}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-colors"
                      title="Alterar foto"
                    >
                      {isUploadingAvatar ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                      ) : (
                        <Camera className="w-4 h-4 text-gray-800" />
                      )}
                    </button>
                    {user.avatar && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoManagementTab("profile");
                          setShowPhotoManagement(true);
                        }}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-colors"
                        title="Gerenciar fotos do perfil"
                      >
                        <Edit3 className="w-4 h-4 text-gray-800" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              {user.username && (
                <span className="text-gray-500 text-lg">@{user.username}</span>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Edit3 className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>

            {user.bio ? (
              <p className="text-gray-600 mb-3 text-lg">{user.bio}</p>
            ) : isOwnProfile ? (
              <p className="text-gray-400 mb-3 italic">
                Adicione uma bio ao seu perfil
              </p>
            ) : null}

            {/* Basic Info Row */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-3">
              {user.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.work && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{user.work}</span>
                </div>
              )}
              {user.joinDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Entrou em {user.joinDate}</span>
                </div>
              )}
            </div>

            {/* Additional Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
              {user.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              )}
              {user.education && (
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{user.education}</span>
                </div>
              )}
              {user.relationship_status && (
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>
                    {user.relationship_status === "single" && "Solteiro(a)"}
                    {user.relationship_status === "in_relationship" &&
                      "Em um relacionamento"}
                    {user.relationship_status === "married" && "Casado(a)"}
                    {user.relationship_status === "divorced" && "Divorciado(a)"}
                    {user.relationship_status === "widowed" && "Viúvo(a)"}
                    {user.relationship_status === "complicated" &&
                      "É complicado"}
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{friendsCount}</span>
                <span className="text-gray-500">amigos</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold">{postsCount}</span>
                <span className="text-gray-500">posts</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Heart className="w-4 h-4" />
                <span className="font-semibold">1.2k</span>
                <span className="text-gray-500">curtidas</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-4 sm:mt-0">
            {isOwnProfile ? (
              <>
                <a
                  href="/edit-profile"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Editar Perfil
                </a>
                <a
                  href="/settings"
                  className="p-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </a>
              </>
            ) : (
              <>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Mensagem
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Photo Editors */}
      {selectedFile && (
        <>
          <PhotoEditor
            isOpen={showAvatarEditor}
            onClose={() => {
              setShowAvatarEditor(false);
              setSelectedFile(null);
            }}
            imageFile={selectedFile}
            onSave={(editedFile, privacy) => {
              handleAvatarUpload(editedFile, privacy || "public");
              setShowAvatarEditor(false);
              setSelectedFile(null);
            }}
            aspectRatio={1}
            title="Editar Foto do Perfil"
            showPrivacyOptions={true}
          />

          <PhotoEditor
            isOpen={showCoverEditor}
            onClose={() => {
              setShowCoverEditor(false);
              setSelectedFile(null);
            }}
            imageFile={selectedFile}
            onSave={(editedFile, privacy) => {
              handleCoverUpload(editedFile, privacy || "public");
              setShowCoverEditor(false);
              setSelectedFile(null);
            }}
            aspectRatio={16 / 9}
            title="Editar Foto de Capa"
            showPrivacyOptions={true}
          />
        </>
      )}

      {/* Photo Viewers */}
      {user.avatar && (
        <PhotoViewerModal
          isOpen={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
          photo={{
            id: user.id || 0,
            url: user.avatar.startsWith("http")
              ? user.avatar
              : `${API_BASE_URL}${user.avatar}`,
            type: "profile",
            created_at: new Date().toISOString(),
            privacy: "public",
            reactions_count: 0,
            comments_count: 0,
            shares_count: 0,
          }}
          user={{
            id: user.id || 0,
            first_name: user.name.split(" ")[0],
            last_name: user.name.split(" ").slice(1).join(" "),
            avatar: user.avatar,
            username: user.username,
          }}
          userToken={user.token}
          canEdit={isOwnProfile}
        />
      )}

      {user.cover_photo && (
        <PhotoViewerModal
          isOpen={showCoverViewer}
          onClose={() => setShowCoverViewer(false)}
          photo={{
            id: user.id || 0,
            url: user.cover_photo.startsWith("http")
              ? user.cover_photo
              : `${API_BASE_URL}${user.cover_photo}`,
            type: "cover",
            created_at: new Date().toISOString(),
            privacy: "public",
            reactions_count: 0,
            comments_count: 0,
            shares_count: 0,
          }}
          user={{
            id: user.id || 0,
            first_name: user.name.split(" ")[0],
            last_name: user.name.split(" ").slice(1).join(" "),
            avatar: user.avatar,
            username: user.username,
          }}
          userToken={user.token}
          canEdit={isOwnProfile}
        />
      )}

      {/* Photo Management Modal */}
      <PhotoManagementModal
        isOpen={showPhotoManagement}
        onClose={() => setShowPhotoManagement(false)}
        user={{
          id: user.id || 0,
          name: user.name,
          avatar: user.avatar,
          cover_photo: user.cover_photo,
          token: user.token,
        }}
        onPhotoUpdated={onProfileUpdate || (() => {})}
        initialTab={photoManagementTab}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
      />
    </div>
  );
}
