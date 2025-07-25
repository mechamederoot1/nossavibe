import React, { useState, useEffect } from "react";
import {
  X,
  Globe,
  Users,
  Lock,
  UserCheck,
  Settings,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

interface PrivacySetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  value:
    | "public"
    | "friends"
    | "friends_except"
    | "specific_friends"
    | "only_me";
}

interface PhotoPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoId?: number;
  currentPrivacy: string;
  onPrivacyChange: (privacy: string, photoId?: number) => void;
  userToken: string;
  isDefaultSettings?: boolean; // Se é para configurações padrão ou foto específica
}

export function PhotoPrivacyModal({
  isOpen,
  onClose,
  photoId,
  currentPrivacy,
  onPrivacyChange,
  userToken,
  isDefaultSettings = false,
}: PhotoPrivacyModalProps) {
  const [selectedPrivacy, setSelectedPrivacy] = useState(currentPrivacy);
  const [loading, setLoading] = useState(false);
  const [specificFriends, setSpecificFriends] = useState<string[]>([]);
  const [excludedFriends, setExcludedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  const privacySettings: PrivacySetting[] = [
    {
      id: "public",
      label: "Público",
      description: "Qualquer pessoa pode ver esta foto",
      icon: <Globe className="w-5 h-5" />,
      value: "public",
    },
    {
      id: "friends",
      label: "Amigos",
      description: "Apenas seus amigos podem ver",
      icon: <Users className="w-5 h-5" />,
      value: "friends",
    },
    {
      id: "friends_except",
      label: "Amigos, exceto...",
      description: "Amigos, exceto pessoas específicas",
      icon: <EyeOff className="w-5 h-5" />,
      value: "friends_except",
    },
    {
      id: "specific_friends",
      label: "Amigos específicos",
      description: "Apenas amigos selecionados",
      icon: <UserCheck className="w-5 h-5" />,
      value: "specific_friends",
    },
    {
      id: "only_me",
      label: "Apenas eu",
      description: "Somente você pode ver",
      icon: <Lock className="w-5 h-5" />,
      value: "only_me",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      const response = await fetch("http://localhost:8000/friends", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Erro ao buscar amigos:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const privacyData: any = {
        privacy: selectedPrivacy,
      };

      if (selectedPrivacy === "specific_friends") {
        privacyData.allowed_users = specificFriends;
      } else if (selectedPrivacy === "friends_except") {
        privacyData.excluded_users = excludedFriends;
      }

      let url = "http://localhost:8000/photos/privacy";
      if (photoId && !isDefaultSettings) {
        url += `/${photoId}`;
      } else if (isDefaultSettings) {
        url = "http://localhost:8000/user/photo-privacy-settings";
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(privacyData),
      });

      if (response.ok) {
        onPrivacyChange(selectedPrivacy, photoId);
        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar configurações de privacidade:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendToggle = (
    friendId: string,
    type: "specific" | "exclude",
  ) => {
    if (type === "specific") {
      setSpecificFriends((prev) =>
        prev.includes(friendId)
          ? prev.filter((id) => id !== friendId)
          : [...prev, friendId],
      );
    } else {
      setExcludedFriends((prev) =>
        prev.includes(friendId)
          ? prev.filter((id) => id !== friendId)
          : [...prev, friendId],
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">
                {isDefaultSettings
                  ? "Privacidade Padrão"
                  : "Privacidade da Foto"}
              </h2>
              <p className="text-sm text-gray-600">
                {isDefaultSettings
                  ? "Configure quem pode ver suas fotos por padrão"
                  : "Controle quem pode ver esta foto"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Options */}
        <div className="p-6 space-y-4">
          {privacySettings.map((setting) => (
            <label
              key={setting.id}
              className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedPrivacy === setting.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="privacy"
                value={setting.value}
                checked={selectedPrivacy === setting.value}
                onChange={(e) => setSelectedPrivacy(e.target.value as any)}
                className="sr-only"
              />
              <div
                className={`p-2 rounded-full ${
                  selectedPrivacy === setting.value
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {setting.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{setting.label}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {setting.description}
                </p>
              </div>
              {selectedPrivacy === setting.value && (
                <div className="text-blue-600">
                  <Settings className="w-5 h-5" />
                </div>
              )}
            </label>
          ))}
        </div>

        {/* Friend Selection for Specific Options */}
        {(selectedPrivacy === "specific_friends" ||
          selectedPrivacy === "friends_except") && (
          <div className="px-6 pb-4">
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {selectedPrivacy === "specific_friends"
                  ? "Selecionar amigos que podem ver"
                  : "Selecionar amigos que NÃO podem ver"}
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {friends.map((friend) => (
                  <label
                    key={friend.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedPrivacy === "specific_friends"
                          ? specificFriends.includes(friend.id.toString())
                          : excludedFriends.includes(friend.id.toString())
                      }
                      onChange={() =>
                        handleFriendToggle(
                          friend.id.toString(),
                          selectedPrivacy === "specific_friends"
                            ? "specific"
                            : "exclude",
                        )
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <img
                      src={
                        friend.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          `${friend.first_name} ${friend.last_name}`,
                        )}&background=3B82F6&color=fff`
                      }
                      alt={`${friend.first_name} ${friend.last_name}`}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-gray-900">
                      {friend.first_name} {friend.last_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
