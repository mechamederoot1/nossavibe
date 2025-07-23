import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Shield,
  Bell,
  Key,
  UserX,
  Trash2,
  LogOut,
  Camera,
  Image,
  Save,
  Loader,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
}

interface ProfileData {
  first_name: string;
  last_name: string;
  username: string;
  nickname: string;
  bio: string;
  location: string;
  website: string;
  relationship_status: string;
  work: string;
  education: string;
  phone: string;
}

interface PrivacySettings {
  profile_visibility: string;
  friend_request_privacy: string;
  post_visibility: string;
  story_visibility: string;
  email_visibility: string;
  phone_visibility: string;
  birth_date_visibility: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  friend_request_notifications: boolean;
  comment_notifications: boolean;
  reaction_notifications: boolean;
  message_notifications: boolean;
  story_notifications: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  user,
  onLogout,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    username: "",
    nickname: "",
    bio: "",
    location: "",
    website: "",
    relationship_status: "single",
    work: "",
    education: "",
    phone: "",
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profile_visibility: "public",
    friend_request_privacy: "everyone",
    post_visibility: "public",
    story_visibility: "public",
    email_visibility: "private",
    phone_visibility: "private",
    birth_date_visibility: "friends",
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      email_notifications: true,
      push_notifications: true,
      friend_request_notifications: true,
      comment_notifications: true,
      reaction_notifications: true,
      message_notifications: true,
      story_notifications: true,
    });

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUserData();
      loadPrivacySettings();
      loadNotificationSettings();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    try {
      const response = await fetch("http://localhost:8000/auth/me", {
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
          location: userData.location || "",
          website: userData.website || "",
          relationship_status: userData.relationship_status || "single",
          work: userData.work || "",
          education: userData.education || "",
          phone: userData.phone || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const loadPrivacySettings = async () => {
    try {
      const response = await fetch("http://localhost:8000/settings/privacy", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const settings = await response.json();
        setPrivacySettings(settings);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de privacidade:", error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/settings/notifications",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const settings = await response.json();
        setNotificationSettings(settings);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de notificação:", error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        alert("Perfil atualizado com sucesso!");
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/settings/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(privacySettings),
      });

      if (response.ok) {
        alert("Configurações de privacidade atualizadas!");
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar privacidade:", error);
      alert("Erro ao atualizar configurações de privacidade");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/settings/notifications",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(notificationSettings),
        },
      );

      if (response.ok) {
        alert("Configurações de notificação atualizadas!");
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar notificações:", error);
      alert("Erro ao atualizar configurações de notificação");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      alert("As senhas não coincidem");
      return;
    }

    if (passwords.new_password.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/settings/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        }),
      });

      if (response.ok) {
        alert("Senha alterada com sucesso!");
        setPasswords({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

      const response = await fetch("http://localhost:8000/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Avatar atualizado com sucesso!");
        setAvatarFile(null);
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error("Erro ao enviar avatar:", error);
      alert("Erro ao enviar avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async () => {
    if (!coverFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", coverFile);

      const response = await fetch("http://localhost:8000/profile/cover", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Foto de capa atualizada com sucesso!");
        setCoverFile(null);
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error("Erro ao enviar foto de capa:", error);
      alert("Erro ao enviar foto de capa");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (
      confirm(
        "Tem certeza que deseja desativar sua conta? Isso pode ser revertido.",
      )
    ) {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:8000/account/deactivate",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          },
        );

        if (response.ok) {
          alert("Conta desativada com sucesso!");
          onLogout();
        } else {
          const error = await response.json();
          alert(`Erro: ${error.detail}`);
        }
      } catch (error) {
        console.error("Erro ao desativar conta:", error);
        alert("Erro ao desativar conta");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "ATENÇÃO: Tem certeza que deseja DELETAR permanentemente sua conta? Esta ação NÃO pode ser desfeita!",
      )
    ) {
      if (
        confirm(
          "Esta é sua última chance. Clique OK para deletar permanentemente sua conta.",
        )
      ) {
        setLoading(true);
        try {
          const response = await fetch("http://localhost:8000/account/delete", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });

          if (response.ok) {
            alert("Conta deletada permanentemente!");
            onLogout();
          } else {
            const error = await response.json();
            alert(`Erro: ${error.detail}`);
          }
        } catch (error) {
          console.error("Erro ao deletar conta:", error);
          alert("Erro ao deletar conta");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Configurações
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === "profile"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <User className="w-5 h-5" />
              <span>Perfil</span>
            </button>

            <button
              onClick={() => setActiveTab("photos")}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === "photos"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>Fotos</span>
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === "privacy"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Privacidade</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === "notifications"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span>Notificações</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === "security"
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <Key className="w-5 h-5" />
              <span>Senha</span>
            </button>

            <button
              onClick={() => setActiveTab("account")}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === "account"
                  ? "bg-red-50 text-red-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <UserX className="w-5 h-5" />
              <span>Conta</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Informações do Perfil</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome
                    </label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome de usuário
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="@seuusername"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apelido
                    </label>
                    <input
                      type="text"
                      value={profileData.nickname}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          nickname: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        setProfileData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status de relacionamento
                    </label>
                    <select
                      value={profileData.relationship_status}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          relationship_status: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="single">Solteiro(a)</option>
                      <option value="in_relationship">
                        Em um relacionamento
                      </option>
                      <option value="married">Casado(a)</option>
                      <option value="complicated">É complicado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trabalho
                    </label>
                    <input
                      type="text"
                      value={profileData.work}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          work: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        setProfileData((prev) => ({
                          ...prev,
                          education: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? "Salvando..." : "Salvar Alterações"}</span>
                </button>
              </div>
            )}

            {activeTab === "photos" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Fotos do Perfil</h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Avatar</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setAvatarFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Clique para escolher avatar
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Máximo 5MB</p>
                      </label>
                      {avatarFile && (
                        <div className="mt-4">
                          <p className="text-sm text-green-600">
                            {avatarFile.name}
                          </p>
                          <button
                            onClick={handleAvatarUpload}
                            disabled={loading}
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? "Enviando..." : "Enviar Avatar"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Foto de Capa</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCoverFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="cover-upload"
                      />
                      <label htmlFor="cover-upload" className="cursor-pointer">
                        <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Clique para escolher capa
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Máximo 10MB
                        </p>
                      </label>
                      {coverFile && (
                        <div className="mt-4">
                          <p className="text-sm text-green-600">
                            {coverFile.name}
                          </p>
                          <button
                            onClick={handleCoverUpload}
                            disabled={loading}
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading ? "Enviando..." : "Enviar Capa"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  Configurações de Privacidade
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibilidade do perfil
                    </label>
                    <select
                      value={privacySettings.profile_visibility}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          profile_visibility: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Público</option>
                      <option value="friends">Apenas amigos</option>
                      <option value="private">Privado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quem pode enviar solicitações de amizade
                    </label>
                    <select
                      value={privacySettings.friend_request_privacy}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          friend_request_privacy: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="everyone">Todos</option>
                      <option value="friends_of_friends">
                        Amigos de amigos
                      </option>
                      <option value="none">Ninguém</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibilidade dos posts
                    </label>
                    <select
                      value={privacySettings.post_visibility}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          post_visibility: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Público</option>
                      <option value="friends">Apenas amigos</option>
                      <option value="private">Privado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibilidade dos stories
                    </label>
                    <select
                      value={privacySettings.story_visibility}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          story_visibility: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Público</option>
                      <option value="friends">Apenas amigos</option>
                      <option value="private">Privado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibilidade do email
                    </label>
                    <select
                      value={privacySettings.email_visibility}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          email_visibility: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Público</option>
                      <option value="friends">Apenas amigos</option>
                      <option value="private">Privado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibilidade da data de nascimento
                    </label>
                    <select
                      value={privacySettings.birth_date_visibility}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          birth_date_visibility: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Público</option>
                      <option value="friends">Apenas amigos</option>
                      <option value="private">Privado</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handlePrivacyUpdate}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {loading ? "Salvando..." : "Salvar Configurações"}
                  </span>
                </button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">
                  Configurações de Notificação
                </h3>

                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">
                          {key === "email_notifications" &&
                            "Notificações por email"}
                          {key === "push_notifications" && "Notificações push"}
                          {key === "friend_request_notifications" &&
                            "Solicitações de amizade"}
                          {key === "comment_notifications" && "Comentários"}
                          {key === "reaction_notifications" && "Reações"}
                          {key === "message_notifications" && "Mensagens"}
                          {key === "story_notifications" && "Stories"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {key === "email_notifications" &&
                            "Receber notificações por email"}
                          {key === "push_notifications" &&
                            "Receber notificações no navegador"}
                          {key === "friend_request_notifications" &&
                            "Notificar sobre solicitações de amizade"}
                          {key === "comment_notifications" &&
                            "Notificar sobre comentários nos seus posts"}
                          {key === "reaction_notifications" &&
                            "Notificar sobre reações nos seus posts"}
                          {key === "message_notifications" &&
                            "Notificar sobre novas mensagens"}
                          {key === "story_notifications" &&
                            "Notificar quando alguém visualizar seu story"}
                        </p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? "bg-blue-600" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleNotificationUpdate}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {loading ? "Salvando..." : "Salvar Configurações"}
                  </span>
                </button>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Alterar Senha</h3>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha atual
                    </label>
                    <input
                      type="password"
                      value={passwords.current_password}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          current_password: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova senha
                    </label>
                    <input
                      type="password"
                      value={passwords.new_password}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          new_password: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar nova senha
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm_password}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          confirm_password: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={
                      loading ||
                      !passwords.current_password ||
                      !passwords.new_password ||
                      !passwords.confirm_password
                    }
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    <span>{loading ? "Alterando..." : "Alterar Senha"}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-red-600">
                  Zona de Perigo
                </h3>

                <div className="space-y-4">
                  <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Desativar Conta
                    </h4>
                    <p className="text-sm text-yellow-700 mb-4">
                      Sua conta será temporariamente desativada. Você pode
                      reativá-la fazendo login novamente.
                    </p>
                    <button
                      onClick={handleDeactivateAccount}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                      <span>
                        {loading ? "Desativando..." : "Desativar Conta"}
                      </span>
                    </button>
                  </div>

                  <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">
                      Deletar Conta Permanentemente
                    </h4>
                    <p className="text-sm text-red-700 mb-4">
                      ATENÇÃO: Esta ação é irreversível! Todos os seus dados
                      serão permanentemente removidos.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>
                        {loading ? "Deletando..." : "Deletar Permanentemente"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
