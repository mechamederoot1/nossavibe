import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Briefcase,
  Heart,
  Users,
  MessageCircle,
  UserPlus,
  Mail,
  X,
} from "lucide-react";
import { EnhancedProfileHeader } from "./profile/EnhancedProfileHeader";

interface UserProfileProps {
  userId: number;
  userToken: string;
  onClose: () => void;
}

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
  location?: string;
  avatar?: string;
  cover_photo?: string;
  birth_date?: string;
  relationship_status?: string;
  work?: string;
  education?: string;
  username?: string;
  created_at: string;
  friends_count?: number;
  posts_count?: number;
  is_own_profile?: boolean;
  is_friend?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  userToken,
  onClose,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<
    "none" | "pending" | "accepted"
  >("none");

  useEffect(() => {
    fetchUserData();
    checkFriendshipStatus();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${userId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendshipStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/friendships/status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setFriendshipStatus(data.status);
      }
    } catch (error) {
      console.error("Erro ao verificar status de amizade:", error);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const response = await fetch("http://localhost:8000/friendships/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressee_id: userId,
        }),
      });

      if (response.ok) {
        setFriendshipStatus("pending");
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação de amizade:", error);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <p>Usuário não encontrado</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Convert user data to match ProfileHeader interface
  const profileUser = {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    bio: user.bio,
    location: user.location,
    avatar: user.avatar,
    cover_photo: user.cover_photo,
    joinDate: new Date(user.created_at).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    }),
    token: userToken,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Perfil de {user.first_name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <EnhancedProfileHeader
            user={profileUser}
            isOwnProfile={user.is_own_profile || false}
            userToken={userToken}
            currentUserId={parseInt(userToken.split(".")[0]) || 0} // Extract from token or pass properly
          />

          {/* Action Buttons for Non-Own Profile */}
          {!user.is_own_profile && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex space-x-4 justify-center">
                {friendshipStatus === "none" && (
                  <button
                    onClick={handleSendFriendRequest}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg transform hover:scale-105"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Adicionar aos amigos</span>
                  </button>
                )}
                {friendshipStatus === "pending" && (
                  <button
                    disabled
                    className="px-8 py-3 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
                  >
                    Solicitação enviada
                  </button>
                )}
                {friendshipStatus === "accepted" && (
                  <button className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium shadow-lg">
                    ✓ Amigos
                  </button>
                )}
                <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-lg transform hover:scale-105">
                  <Mail className="w-5 h-5" />
                  <span>Enviar mensagem</span>
                </button>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.username && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Nome de usuário
                  </h4>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
              )}

              {user.birth_date && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Idade</h4>
                  <p className="text-gray-600">
                    {calculateAge(user.birth_date)} anos
                  </p>
                </div>
              )}

              {user.relationship_status && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Estado Civil
                  </h4>
                  <p className="text-gray-600">{user.relationship_status}</p>
                </div>
              )}

              {user.work && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Trabalho</h4>
                  <p className="text-gray-600">{user.work}</p>
                </div>
              )}

              {user.education && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Educação</h4>
                  <p className="text-gray-600">{user.education}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Membro desde</h4>
                <p className="text-gray-600">
                  {new Date(user.created_at).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
