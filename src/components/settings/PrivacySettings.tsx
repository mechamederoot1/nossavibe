import React, { useState, useEffect } from "react";
import {
  Shield,
  Eye,
  Users,
  Lock,
  Globe,
  Settings,
  Camera,
  Image,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { PhotoPrivacyModal } from "../modals/PhotoPrivacyModal";

interface PrivacySettingsProps {
  userToken: string;
}

interface PrivacySettings {
  default_photo_privacy: string;
  default_post_privacy: string;
  profile_visibility: string;
  friend_requests: string;
  tagging_permission: string;
  story_privacy: string;
}

export function PrivacySettings({ userToken }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    default_photo_privacy: "friends",
    default_post_privacy: "friends",
    profile_visibility: "friends",
    friend_requests: "everyone",
    tagging_permission: "friends",
    story_privacy: "friends",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPhotoPrivacyModal, setShowPhotoPrivacyModal] = useState(false);

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/user/privacy-settings",
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Erro ao buscar configurações de privacidade:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: string) => {
    setSaving(true);
    try {
      const response = await fetch(
        "http://localhost:8000/user/privacy-settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            [key]: value,
          }),
        },
      );

      if (response.ok) {
        setSettings((prev) => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
    } finally {
      setSaving(false);
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "public":
        return <Globe className="w-4 h-4" />;
      case "friends":
        return <Users className="w-4 h-4" />;
      case "only_me":
        return <Lock className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case "public":
        return "Público";
      case "friends":
        return "Amigos";
      case "only_me":
        return "Apenas eu";
      case "everyone":
        return "Todos";
      case "no_one":
        return "Ninguém";
      default:
        return privacy;
    }
  };

  const handlePhotoPrivacyChange = (newPrivacy: string) => {
    setSettings((prev) => ({ ...prev, default_photo_privacy: newPrivacy }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Configurações de Privacidade
          </h1>
        </div>
        <p className="text-gray-600">
          Controle quem pode ver seu conteúdo e interagir com você
        </p>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-6">
        {/* Photo Privacy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Privacidade das Fotos
                </h3>
                <p className="text-sm text-gray-600">
                  Quem pode ver suas fotos por padrão
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPhotoPrivacyModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Configurar</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {getPrivacyIcon(settings.default_photo_privacy)}
            <span>
              Atual: {getPrivacyLabel(settings.default_photo_privacy)}
            </span>
          </div>
        </div>

        {/* Post Privacy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Privacidade dos Posts
                </h3>
                <p className="text-sm text-gray-600">
                  Quem pode ver seus posts por padrão
                </p>
              </div>
            </div>
            <select
              value={settings.default_post_privacy}
              onChange={(e) =>
                updateSetting("default_post_privacy", e.target.value)
              }
              disabled={saving}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Público</option>
              <option value="friends">Amigos</option>
              <option value="only_me">Apenas eu</option>
            </select>
          </div>
        </div>

        {/* Story Privacy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Image className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Privacidade das Stories
                </h3>
                <p className="text-sm text-gray-600">
                  Quem pode ver suas stories
                </p>
              </div>
            </div>
            <select
              value={settings.story_privacy}
              onChange={(e) => updateSetting("story_privacy", e.target.value)}
              disabled={saving}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Público</option>
              <option value="friends">Amigos</option>
              <option value="only_me">Apenas eu</option>
            </select>
          </div>
        </div>

        {/* Profile Visibility */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Visibilidade do Perfil
                </h3>
                <p className="text-sm text-gray-600">
                  Quem pode ver seu perfil
                </p>
              </div>
            </div>
            <select
              value={settings.profile_visibility}
              onChange={(e) =>
                updateSetting("profile_visibility", e.target.value)
              }
              disabled={saving}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Público</option>
              <option value="friends">Amigos</option>
              <option value="only_me">Apenas eu</option>
            </select>
          </div>
        </div>

        {/* Friend Requests */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Solicitações de Amizade
                </h3>
                <p className="text-sm text-gray-600">
                  Quem pode te enviar solicitações
                </p>
              </div>
            </div>
            <select
              value={settings.friend_requests}
              onChange={(e) => updateSetting("friend_requests", e.target.value)}
              disabled={saving}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="everyone">Todos</option>
              <option value="friends_of_friends">Amigos de amigos</option>
              <option value="no_one">Ninguém</option>
            </select>
          </div>
        </div>

        {/* Tagging Permission */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Marcações</h3>
                <p className="text-sm text-gray-600">
                  Quem pode te marcar em posts e fotos
                </p>
              </div>
            </div>
            <select
              value={settings.tagging_permission}
              onChange={(e) =>
                updateSetting("tagging_permission", e.target.value)
              }
              disabled={saving}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="everyone">Todos</option>
              <option value="friends">Amigos</option>
              <option value="no_one">Ninguém</option>
            </select>
          </div>
        </div>
      </div>

      {/* Photo Privacy Modal */}
      {showPhotoPrivacyModal && (
        <PhotoPrivacyModal
          isOpen={showPhotoPrivacyModal}
          onClose={() => setShowPhotoPrivacyModal(false)}
          currentPrivacy={settings.default_photo_privacy}
          onPrivacyChange={handlePhotoPrivacyChange}
          userToken={userToken}
          isDefaultSettings={true}
        />
      )}
    </div>
  );
}
