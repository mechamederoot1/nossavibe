import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Heart,
  Link,
  Phone,
  Loader,
  Globe,
  BookOpen,
  Check,
} from "lucide-react";
<<<<<<< HEAD
import { NotificationModal } from "../modals/NotificationModal";
import { API_BASE_URL } from "../../config/api";
=======
>>>>>>> 9765b1b75ce40044bdfd03e22cb81063dca5ca92

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
}

interface ProfileData {
  first_name: string;
  last_name: string;
  username: string;
  nickname: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  gender: string;
  relationship_status: string;
  work: string;
  education: string;
}

interface EditProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdated?: () => void;
}

export function EditProfilePage({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: EditProfilePageProps) {
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    username: "",
    nickname: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    gender: "",
    relationship_status: "single",
    work: "",
    education: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState("");
<<<<<<< HEAD
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });
=======
>>>>>>> 9765b1b75ce40044bdfd03e22cb81063dca5ca92

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (profileData.username && profileData.username.length > 3) {
      checkUsernameAvailability();
    }
  }, [profileData.username]);

  const loadUserData = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
=======
      const response = await fetch("http://localhost:8000/auth/me", {
>>>>>>> 9765b1b75ce40044bdfd03e22cb81063dca5ca92
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const nameParts = user.name.split(" ");

        setProfileData({
          first_name: userData.first_name || nameParts[0] || "",
          last_name: userData.last_name || nameParts.slice(1).join(" ") || "",
          username: userData.username || "",
          nickname: userData.nickname || "",
          bio: userData.bio || "",
          email: userData.email || user.email,
          phone: userData.phone || "",
          location: userData.location || "",
          website: userData.website || "",
          gender: userData.gender || "",
          relationship_status: userData.relationship_status || "single",
          work: userData.work || "",
          education: userData.education || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async () => {
    setUsernameChecking(true);
    try {
      const response = await fetch(
<<<<<<< HEAD
        `${API_BASE_URL}/auth/check-username?username=${profileData.username}`,
=======
        `http://localhost:8000/auth/check-username?username=${profileData.username}`,
>>>>>>> 9765b1b75ce40044bdfd03e22cb81063dca5ca92
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUsernameAvailable(!data.exists);
      }
    } catch (error) {
      console.error("Erro ao verificar username:", error);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setSuccessMessage(""); // Clear success message when editing

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Generate username from first and last name
    if (field === "first_name" || field === "last_name") {
      const firstName = field === "first_name" ? value : profileData.first_name;
      const lastName = field === "last_name" ? value : profileData.last_name;

      if (firstName && lastName && !profileData.username) {
        const generatedUsername =
          `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(
            /[^a-z0-9]/g,
            "",
          );
        setProfileData((prev) => ({ ...prev, username: generatedUsername }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profileData.first_name.trim()) {
      newErrors.first_name = "Nome é obrigatório";
    }

    if (!profileData.last_name.trim()) {
      newErrors.last_name = "Sobrenome é obrigatório";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Email inválido";
    }

    if (profileData.username && profileData.username.length < 3) {
      newErrors.username = "Username deve ter pelo menos 3 caracteres";
    }

    if (profileData.username && !/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      newErrors.username =
        "Username pode conter apenas letras, números e underscore";
    }

    if (profileData.website && !profileData.website.startsWith("http")) {
      newErrors.website = "Website deve começar com http:// ou https://";
    }

    if (profileData.phone && !/^\+?[\d\s\-\(\)]+$/.test(profileData.phone)) {
      newErrors.phone = "Formato de telefone inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (profileData.username && usernameAvailable === false) {
      setErrors((prev) => ({ ...prev, username: "Username não disponível" }));
      return;
    }

    setSaving(true);
    try {
      // Prepare data for backend - COMPLETELY REMOVE birth_date to avoid SQLite issues
      const dataToSend = { ...profileData };

      // Remove empty strings to avoid backend issues
      Object.keys(dataToSend).forEach((key) => {
        if (dataToSend[key as keyof typeof dataToSend] === "") {
          delete dataToSend[key as keyof typeof dataToSend];
        }
      });

      console.log("Sending profile data:", dataToSend);

<<<<<<< HEAD
      const response = await fetch(`${API_BASE_URL}/profile/`, {
=======
      const response = await fetch("http://localhost:8000/profile/", {
>>>>>>> 9765b1b75ce40044bdfd03e22cb81063dca5ca92
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Profile updated successfully:", result);

        setSuccessMessage("Perfil atualizado com sucesso!");

<<<<<<< HEAD
        // Show success modal
        setNotificationData({
          type: "success",
          title: "Sucesso!",
          message: "Seu perfil foi atualizado com sucesso.",
        });
        setShowNotificationModal(true);

=======
>>>>>>> 9765b1b75ce40044bdfd03e22cb81063dca5ca92
        // Force refresh of parent component MULTIPLE times
        if (onProfileUpdated) {
          await onProfileUpdated();
          // Force another update after 100ms to ensure state propagation
          setTimeout(() => {
            onProfileUpdated();
          }, 100);
          // And another after 500ms to be absolutely sure
          setTimeout(() => {
            onProfileUpdated();
          }, 500);
        }
      } else {
        const error = await response.json();
        console.error("Error from backend:", error);

        // Handle specific SQLite date error
        if (error.detail && error.detail.includes("Date type only accepts")) {
          setErrors({
            birth_date:
              "Formato de data inválido. Verifique a data de nascimento.",
          });
        } else {
          setErrors({ general: error.detail || "Erro ao salvar perfil" });
<<<<<<< HEAD

          // Show error modal
          setNotificationData({
            type: "error",
            title: "Erro!",
            message: error.detail || "Erro ao salvar perfil. Tente novamente.",
          });
          setShowNotificationModal(true);
=======
>>>>>>> 9765b1b75ce40044bdfd03e22cb81063dca5ca92
        }
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setErrors({ general: "Erro ao salvar perfil" });
<<<<<<< HEAD

      // Show error modal
      setNotificationData({
        type: "error",
        title: "Erro!",
        message:
          "Erro ao salvar perfil. Verifique sua conexão e tente novamente.",
      });
      setShowNotificationModal(true);
=======
>>>>>>> 9765b1b75ce40044bdfd03e22cb81063dca5ca92
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Editar Perfil</h1>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "Salvando..." : "Salvar"}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            {/* Error Messages */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.first_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Seu nome"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.last_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Seu sobrenome"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.last_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      @
                    </span>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        handleInputChange(
                          "username",
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, ""),
                        )
                      }
                      className={`w-full pl-8 pr-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.username
                          ? "border-red-500"
                          : usernameAvailable === false
                            ? "border-red-500"
                            : usernameAvailable === true
                              ? "border-green-500"
                              : "border-gray-300"
                      }`}
                      placeholder="seuusername"
                    />
                    {usernameChecking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                    {!usernameChecking && usernameAvailable === true && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        ✓
                      </div>
                    )}
                    {!usernameChecking && usernameAvailable === false && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        ✗
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username}
                    </p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-red-500 text-sm mt-1">
                      Username não disponível
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apelido
                  </label>
                  <input
                    type="text"
                    value={profileData.nickname}
                    onChange={(e) =>
                      handleInputChange("nickname", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Como gosta de ser chamado"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Conte um pouco sobre você..."
                  maxLength={300}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {profileData.bio.length}/300 caracteres
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Contato
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+55 (11) 99999-9999"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cidade, Estado, País"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.website ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="https://seusite.com"
                  />
                  {errors.website && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.website}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Informações Pessoais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero
                  </label>
                  <select
                    value={profileData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                    <option value="prefer_not_to_say">Prefiro não dizer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status de Relacionamento
                  </label>
                  <select
                    value={profileData.relationship_status}
                    onChange={(e) =>
                      handleInputChange("relationship_status", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Solteiro(a)</option>
                    <option value="in_relationship">
                      Em um relacionamento
                    </option>
                    <option value="married">Casado(a)</option>
                    <option value="divorced">Divorciado(a)</option>
                    <option value="widowed">Viúvo(a)</option>
                    <option value="complicated">É complicado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Informações Profissionais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trabalho
                  </label>
                  <input
                    type="text"
                    value={profileData.work}
                    onChange={(e) => handleInputChange("work", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cargo na Empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Educação
                  </label>
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={(e) =>
                      handleInputChange("education", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Instituição de Ensino"
                  />
                </div>
              </div>
            </div>

            {/* Save Button (Mobile) */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:hidden">
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {saving ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{saving ? "Salvando..." : "Salvar Alterações"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
<<<<<<< HEAD

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
      />
=======
>>>>>>> 9765b1b75ce40044bdfd03e22cb81063dca5ca92
    </div>
  );
}
