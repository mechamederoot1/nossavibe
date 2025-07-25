import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MapPin,
  Calendar,
  Edit3,
  Mail,
  Phone,
  UserPlus,
  MessageCircle,
  Briefcase,
  GraduationCap,
  Heart,
  Globe,
  Info,
  X,
  User,
} from "lucide-react";
import { PhotoCropperModal } from "../modals/PhotoCropperModal";
import { ProfilePhotoModal } from "../modals/ProfilePhotoModal";
import { StoryViewer } from "../stories/StoryViewer";
import { StoryAvatar } from "../ui/StoryAvatar";
import { apiCall } from "../../config/api";

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
    work?: string;
    education?: string;
    birth_date?: string;
    gender?: string;
    relationship_status?: string;
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

export function EnhancedProfileHeader({
  user,
  isOwnProfile,
  userToken,
  onEditProfile,
  onProfileUpdate,
  currentUserId,
}: ProfileHeaderProps) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showFullInfo, setShowFullInfo] = useState(false);
  const [showAvatarCropper, setShowAvatarCropper] = useState(false);
  const [showCoverCropper, setShowCoverCropper] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverImageError, setCoverImageError] = useState(false);
  const [coverImageLoading, setCoverImageLoading] = useState(false);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<any[]>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file); // Backend expects "file" parameter

    try {
      console.log("Uploading avatar photo...", file.name);
      const response = await fetch("http://localhost:8000/users/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Avatar uploaded successfully:", data);
        alert("Foto do perfil atualizada com sucesso!");

        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        const errorData = await response.json();
        console.error("Avatar upload error:", errorData);
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
    formData.append("file", file); // Backend expects "file" parameter

    try {
      console.log("Uploading cover photo...", file.name);
      const response = await fetch("http://localhost:8000/users/me/cover", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Cover uploaded successfully:", data);
        alert("Foto de capa atualizada com sucesso!");

        // Force immediate refresh of profile data
        if (onProfileUpdate) {
          console.log("Triggering profile update callback...");
          await onProfileUpdate();

          // Add a small delay and try again to ensure state propagation
          setTimeout(() => {
            onProfileUpdate();
          }, 500);
        }

        // Force page reload as backup if callback doesn't work
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error("Cover upload error:", errorData);
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
    console.log("Avatar file selected:", file);
    if (file) {
      setSelectedAvatarFile(file);
      setShowAvatarCropper(true);
    }
    // Clear input to allow selecting the same file again
    e.target.value = "";
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("Cover file selected:", file);
    if (file) {
      setSelectedCoverFile(file);
      setShowCoverCropper(true);
    }
    // Clear input to allow selecting the same file again
    e.target.value = "";
  };

  const handleAvatarCropSave = (croppedFile: File) => {
    setShowAvatarCropper(false);
    handleAvatarUpload(croppedFile);
  };

  const handleCoverCropSave = (croppedFile: File) => {
    setShowCoverCropper(false);
    handleCoverUpload(croppedFile);
  };

  const getRelationshipStatusText = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      single: "Solteiro(a)",
      in_relationship: "Em um relacionamento",
      married: "Casado(a)",
      divorced: "Divorciado(a)",
      widowed: "Viúvo(a)",
      complicated: "É complicado",
    };
    return status ? statusMap[status] || status : "";
  };

  const getGenderText = (gender?: string) => {
    const genderMap: { [key: string]: string } = {
      male: "Masculino",
      female: "Feminino",
      other: "Outro",
      prefer_not_to_say: "Prefiro não dizer",
    };
    return gender ? genderMap[gender] || gender : "";
  };

  const handleViewProfilePhoto = () => {
    setShowProfilePhotoModal(true);
  };

  const handleViewStory = async () => {
    try {
      const response = await apiCall(`/stories/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const stories = await response.json();
        if (stories.length > 0) {
          setSelectedStoryGroup(stories);
          setSelectedStoryIndex(0);
        }
      }
    } catch (error) {
      console.error('Error loading user stories:', error);
    }
  };

  const getDefaultAvatar = () => (
    <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
      <User className="w-16 h-16 text-gray-500" />
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-400 to-purple-500">
          {user.cover_photo && !coverImageError && (
            <img
              key={user.cover_photo} // Force re-render when cover photo changes
              src={
                user.cover_photo.startsWith("http")
                  ? user.cover_photo
                  : `http://localhost:8000${user.cover_photo}`
              }
              alt="Capa"
              className="w-full h-full object-cover"
              onLoad={() => {
                setCoverImageError(false);
                setCoverImageLoading(false);
              }}
              onError={() => {
                console.error("Failed to load cover photo:", user.cover_photo);
                setCoverImageError(true);
                setCoverImageLoading(false);
              }}
              onLoadStart={() => setCoverImageLoading(true)}
            />
          )}

          {/* Loading state */}
          {coverImageLoading && (
            <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center">
              <div className="text-gray-500">Carregando...</div>
            </div>
          )}

          {/* Error or no cover photo state */}
          {(coverImageError || !user.cover_photo) && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-lg font-medium">
                  {coverImageError
                    ? "Erro ao carregar foto"
                    : "Adicione uma foto de capa"}
                </div>
              </div>
            </div>
          )}

          {isOwnProfile && (
            <button
              onClick={() => {
                console.log("🔥 CAMERA BUTTON CLICKED!");
                console.log("Input ref exists:", !!coverInputRef.current);
                console.log("Input element:", coverInputRef.current);

                if (coverInputRef.current) {
                  console.log("✅ Clicking input element...");
                  coverInputRef.current.click();
                } else {
                  console.error("❌ Cover input ref is null!");
                }
              }}
              disabled={isUploadingCover}
              className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all shadow-lg border-2 border-white"
              title="Alterar foto de capa"
              style={{
                minWidth: "48px",
                minHeight: "48px",
                zIndex: 10,
              }}
            >
              {isUploadingCover ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
          )}

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="opacity-0 absolute pointer-events-none"
            style={{ position: "absolute", left: "-9999px" }}
          />
        </div>

        {/* Profile Info */}
        <div className="relative px-4 sm:px-6 pb-6">
          {/* Avatar - Centered */}
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="relative">
              <StoryAvatar
                userId={user.id}
                userToken={userToken}
                avatarUrl={user.avatar}
                userName={user.name}
                size="large"
                showIndicator={true}
                showOptionsMenu={true}
                onViewPhoto={handleViewProfilePhoto}
                onViewStory={handleViewStory}
                className="shadow-lg"
              />

              {isOwnProfile && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-lg z-20"
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

            {/* User Name - Directly below avatar */}
            <div className="text-center mt-4 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {user.name}
                  {user.nickname && user.nickname !== user.name && (
                    <span className="text-gray-600 font-normal ml-2">
                      ({user.nickname})
                    </span>
                  )}
                </h1>
                {user.is_verified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>

              {user.username && (
                <p className="text-gray-500 mt-1 text-sm sm:text-base">
                  @{user.username}
                </p>
              )}
            </div>

            {/* Action Buttons - Centered below name */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={onEditProfile}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar perfil</span>
                  </button>
                  <button
                    onClick={() => navigate("/user-info")}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Info className="w-4 h-4" />
                    <span>Mais informações</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    <UserPlus className="w-4 h-4" />
                    <span>Seguir</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
                    <MessageCircle className="w-4 h-4" />
                    <span>Mensagem</span>
                  </button>
                  <button
                    onClick={() => navigate(`/user-info/${user.id}`)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Info className="w-4 h-4" />
                    <span>Ver mais</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Additional User Info */}
          <div className="mt-6">

            {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

            {/* Quick Info Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 text-sm">
              {user.location && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}

              {user.work && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user.work}</span>
                </div>
              )}

              {user.education && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <GraduationCap className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user.education}</span>
                </div>
              )}

              {user.relationship_status && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Heart className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {getRelationshipStatusText(user.relationship_status)}
                  </span>
                </div>
              )}

              {user.website && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 truncate"
                  >
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}

              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Entrou em janeiro de 2025</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 pt-3 border-t border-gray-100">
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

      {/* Full Info Modal */}
      {showFullInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Informações de {user.name}
                </h2>
                <button
                  onClick={() => setShowFullInfo(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Full Info Content */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Informações Básicas
                  </h3>
                  <div className="space-y-3">
                    {user.email && isOwnProfile && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user.phone && isOwnProfile && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.birth_date && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span>
                          Nascimento:{" "}
                          {new Date(user.birth_date).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    )}
                    {user.gender && (
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <span>Gênero: {getGenderText(user.gender)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Info */}
                {(user.work || user.education) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Carreira e Educação
                    </h3>
                    <div className="space-y-3">
                      {user.work && (
                        <div className="flex items-center space-x-3">
                          <Briefcase className="w-5 h-5 text-gray-500" />
                          <span>{user.work}</span>
                        </div>
                      )}
                      {user.education && (
                        <div className="flex items-center space-x-3">
                          <GraduationCap className="w-5 h-5 text-gray-500" />
                          <span>{user.education}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Personal Info */}
                {(user.relationship_status || user.location) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Informações Pessoais
                    </h3>
                    <div className="space-y-3">
                      {user.relationship_status && (
                        <div className="flex items-center space-x-3">
                          <Heart className="w-5 h-5 text-gray-500" />
                          <span>
                            {getRelationshipStatusText(
                              user.relationship_status,
                            )}
                          </span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <span>{user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Cropper Modal */}
      {selectedAvatarFile && (
        <PhotoCropperModal
          isOpen={showAvatarCropper}
          onClose={() => {
            setShowAvatarCropper(false);
            setSelectedAvatarFile(null);
          }}
          onSave={handleAvatarCropSave}
          imageFile={selectedAvatarFile}
          isRound={true}
        />
      )}

      {/* Cover Cropper Modal */}
      {selectedCoverFile && (
        <PhotoCropperModal
          isOpen={showCoverCropper}
          onClose={() => {
            setShowCoverCropper(false);
            setSelectedCoverFile(null);
          }}
          onSave={handleCoverCropSave}
          imageFile={selectedCoverFile}
          isRound={false}
          aspectRatio={16 / 9}
        />
      )}

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={showProfilePhotoModal}
        onClose={() => setShowProfilePhotoModal(false)}
        photoUrl={user.avatar}
        userName={user.name}
        isOwnProfile={isOwnProfile}
        onChangePhoto={() => {
          setShowProfilePhotoModal(false);
          avatarInputRef.current?.click();
        }}
      />

      {/* Story Viewer */}
      {selectedStoryGroup && (
        <StoryViewer
          stories={selectedStoryGroup.map((story) => ({
            ...story,
            id: story.id.toString(),
          }))}
          currentIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryGroup(null)}
          userToken={userToken}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
