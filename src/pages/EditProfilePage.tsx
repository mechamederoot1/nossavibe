import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  Save,
  Check,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Briefcase,
  GraduationCap,
  Heart,
  Palette,
  Image,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id?: number;
  display_id?: string;
  name: string;
  email: string;
  avatar?: string;
  cover_photo?: string;
  bio?: string;
  location?: string;
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
}

interface EditProfilePageProps {
  user: User;
  onUserUpdate?: (userData: Partial<User>) => void;
}

export function EditProfilePage({ user, onUserUpdate }: EditProfilePageProps) {
  const navigate = useNavigate();
  const [loading, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Profile data
  const [profileData, setProfileData] = useState({
    first_name: user.name.split(" ")[0] || "",
    last_name: user.name.split(" ").slice(1).join(" ") || "",
    username: user.username || "",
    nickname: user.nickname || "",
    bio: user.bio || "",
    email: user.email || "",
    phone: user.phone || "",
    website: user.website || "",
    location: user.location || "",
    work: user.work || "",
    education: user.education || "",
    birth_date: user.birth_date || "",
    gender: user.gender || "",
    relationship_status: user.relationship_status || "",
  });

  // Photo states
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [coverPreview, setCoverPreview] = useState(user.cover_photo || "");
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string>("");
  const [cropType, setCropType] = useState<"avatar" | "cover">("avatar");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: "basic", label: "Básico", icon: User },
    { id: "contact", label: "Contato", icon: Mail },
    { id: "additional", label: "Adicional", icon: Heart },
    { id: "photos", label: "Fotos", icon: Camera },
  ];

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCropImage(result);
        setCropType(type);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = (croppedImage: string) => {
    if (cropType === "avatar") {
      setAvatarPreview(croppedImage);
    } else {
      setCoverPreview(croppedImage);
    }
    setShowCropModal(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("http://localhost:8000/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...profileData,
          avatar: avatarPreview !== user.avatar ? avatarPreview : undefined,
          cover_photo:
            coverPreview !== user.cover_photo ? coverPreview : undefined,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        if (onUserUpdate) {
          onUserUpdate({
            name: `${profileData.first_name} ${profileData.last_name}`,
            username: profileData.username,
            nickname: profileData.nickname,
            bio: profileData.bio,
            phone: profileData.phone,
            website: profileData.website,
            location: profileData.location,
            work: profileData.work,
            education: profileData.education,
            birth_date: profileData.birth_date,
            gender: profileData.gender,
            relationship_status: profileData.relationship_status,
            avatar: avatarPreview,
            cover_photo: coverPreview,
          });
        }
      } else {
        const errorData = await response.text();
        console.error("Profile save failed:", response.status, errorData);
        alert(`Erro ao salvar perfil: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => (
    <div className="lg:col-span-1">
      <div className="sticky top-24">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Preview do Perfil
        </h3>

        {/* Profile Preview */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Cover Photo */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="flex justify-center -mt-12 mb-4">
              <img
                src={
                  avatarPreview ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(`${profileData.first_name} ${profileData.last_name}`)}&background=3B82F6&color=fff`
                }
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
              />
            </div>

            {/* Name and Username */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {profileData.first_name} {profileData.last_name}
              </h2>
              {profileData.nickname && (
                <p className="text-gray-600 font-medium">
                  "{profileData.nickname}"
                </p>
              )}
              {profileData.username && (
                <p className="text-blue-600">@{profileData.username}</p>
              )}
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div className="mb-4">
                <p className="text-gray-700 text-center">{profileData.bio}</p>
              </div>
            )}

            {/* Info Grid */}
            <div className="space-y-3 text-sm">
              {profileData.location && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
              )}
              {profileData.work && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{profileData.work}</span>
                </div>
              )}
              {profileData.education && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <GraduationCap className="w-4 h-4" />
                  <span>{profileData.education}</span>
                </div>
              )}
              {profileData.website && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <LinkIcon className="w-4 h-4" />
                  <a
                    href={profileData.website}
                    className="text-blue-600 hover:underline"
                  >
                    {profileData.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBasicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome *
          </label>
          <input
            type="text"
            value={profileData.first_name}
            onChange={(e) =>
              setProfileData((prev) => ({
                ...prev,
                first_name: e.target.value,
              }))
            }
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sobrenome *
          </label>
          <input
            type="text"
            value={profileData.last_name}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, last_name: e.target.value }))
            }
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome de usuário *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              @
            </span>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Será usado na URL do seu perfil
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apelido
          </label>
          <input
            type="text"
            value={profileData.nickname}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, nickname: e.target.value }))
            }
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Como seus amigos te chamam?"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={profileData.bio}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, bio: e.target.value }))
          }
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Conte um pouco sobre você..."
          maxLength={160}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Máximo 160 caracteres</span>
          <span>{profileData.bio.length}/160</span>
        </div>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4 inline mr-1" />
          Email *
        </label>
        <input
          type="email"
          value={profileData.email}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4 inline mr-1" />
          Telefone
        </label>
        <input
          type="tel"
          value={profileData.phone}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, phone: e.target.value }))
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <LinkIcon className="w-4 h-4 inline mr-1" />
          Website
        </label>
        <input
          type="url"
          value={profileData.website}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, website: e.target.value }))
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://seusite.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Localização
        </label>
        <input
          type="text"
          value={profileData.location}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, location: e.target.value }))
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="São Paulo, Brasil"
        />
      </div>
    </div>
  );

  const renderAdditionalTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="w-4 h-4 inline mr-1" />
          Trabalho
        </label>
        <input
          type="text"
          value={profileData.work}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, work: e.target.value }))
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Desenvolvedor na Builder.io"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <GraduationCap className="w-4 h-4 inline mr-1" />
          Educação
        </label>
        <input
          type="text"
          value={profileData.education}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, education: e.target.value }))
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Universidade de São Paulo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Data de Nascimento
        </label>
        <input
          type="date"
          value={profileData.birth_date}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, birth_date: e.target.value }))
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gênero
        </label>
        <select
          value={profileData.gender}
          onChange={(e) =>
            setProfileData((prev) => ({ ...prev, gender: e.target.value }))
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="male">Masculino</option>
          <option value="female">Feminino</option>
          <option value="other">Outro</option>
          <option value="prefer_not_to_say">Prefiro não dizer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Heart className="w-4 h-4 inline mr-1" />
          Status de Relacionamento
        </label>
        <select
          value={profileData.relationship_status}
          onChange={(e) =>
            setProfileData((prev) => ({
              ...prev,
              relationship_status: e.target.value,
            }))
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione</option>
          <option value="single">Solteiro(a)</option>
          <option value="in_relationship">Em um relacionamento</option>
          <option value="married">Casado(a)</option>
          <option value="divorced">Divorciado(a)</option>
          <option value="widowed">Viúvo(a)</option>
          <option value="complicated">É complicado</option>
        </select>
      </div>
    </div>
  );

  const renderPhotosTab = () => (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Foto do Perfil</h3>
        <div className="flex items-center space-x-6">
          <img
            src={
              avatarPreview ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(`${profileData.first_name} ${profileData.last_name}`)}&background=3B82F6&color=fff`
            }
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="space-y-2">
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Alterar Foto</span>
            </button>
            <button
              onClick={() => setAvatarPreview("")}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Remover</span>
            </button>
          </div>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoUpload(e, "avatar")}
          className="hidden"
        />
      </div>

      {/* Cover Photo */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Foto de Capa</h3>
        <div className="space-y-4">
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl overflow-hidden">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-90 text-gray-900 rounded-lg hover:bg-opacity-100 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Alterar Capa</span>
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCoverPreview("")}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Remover Capa</span>
            </button>
          </div>
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoUpload(e, "cover")}
          className="hidden"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Editar Perfil
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saved ? (
                <Check className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>
                {saved ? "Salvo!" : loading ? "Salvando..." : "Salvar"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              {activeTab === "basic" && renderBasicTab()}
              {activeTab === "contact" && renderContactTab()}
              {activeTab === "additional" && renderAdditionalTab()}
              {activeTab === "photos" && renderPhotosTab()}
            </div>
          </div>

          {/* Preview */}
          {renderPreview()}
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajustar{" "}
              {cropType === "avatar" ? "Foto do Perfil" : "Foto de Capa"}
            </h3>
            <div className="space-y-4">
              <div className="h-64 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={cropImage}
                  alt="Crop"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleCropSave(cropImage)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
