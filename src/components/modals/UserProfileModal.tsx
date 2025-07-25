import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Calendar,
  Users,
  Heart,
  MessageCircle,
  UserPlus,
  UserMinus,
  UserCheck,
  Flag,
  Shield,
  Globe,
  Briefcase,
  GraduationCap,
} from "lucide-react";

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
  nickname?: string;
  bio?: string;
  avatar?: string;
  cover_photo?: string;
  location?: string;
  website?: string;
  relationship_status?: string;
  work?: string;
  education?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  is_verified: boolean;
  created_at: string;
  friends_count: number;
  posts_count: number;
  is_own_profile: boolean;
  is_friend: boolean;
}

interface UserProfileModalProps {
  userId: number;
  userToken: string;
  currentUserId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({
  userId,
  userToken,
  currentUserId,
  isOpen,
  onClose,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none");
  const [followStatus, setFollowStatus] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
      fetchFriendshipStatus();
      fetchFollowStatus();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}/profile`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendshipStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/friendships/status/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriendshipStatus(data.status);
      }
    } catch (error) {
      console.error("Erro ao verificar amizade:", error);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/follow/status/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowStatus(data.is_following);
      }
    } catch (error) {
      console.error("Erro ao verificar follow:", error);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const response = await fetch("http://localhost:8000/friendships/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ addressee_id: userId }),
      });

      if (response.ok) {
        setFriendshipStatus("pending");
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  };

  const removeFriend = async () => {
    if (!confirm("Tem certeza que deseja remover este amigo?")) return;

    try {
      const response = await fetch(`http://localhost:8000/friendships/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFriendshipStatus("none");
      }
    } catch (error) {
      console.error("Erro ao remover amigo:", error);
    }
  };

  const toggleFollow = async () => {
    try {
      const response = await fetch(`http://localhost:8000/follow/${userId}`, {
        method: followStatus ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFollowStatus(!followStatus);
      }
    } catch (error) {
      console.error("Erro ao alterar follow:", error);
    }
  };

  const blockUser = async () => {
    if (!confirm("Tem certeza que deseja bloquear este usuário?")) return;

    try {
      const response = await fetch(`http://localhost:8000/reports/block/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        alert("Usuário bloqueado com sucesso!");
        onClose();
      }
    } catch (error) {
      console.error("Erro ao bloquear usuário:", error);
    }
  };

  const ReportModal = ({ onClose }: { onClose: () => void }) => {
    const [reportType, setReportType] = useState("");
    const [description, setDescription] = useState("");

    const reportUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/reports/user/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            report_type: reportType,
            description: description,
          }),
        });

        if (response.ok) {
          alert("Denúncia enviada com sucesso!");
          onClose();
        }
      } catch (error) {
        console.error("Erro ao enviar denúncia:", error);
      }
    };

    const reportTypes = [
      { value: "spam", label: "Spam" },
      { value: "harassment", label: "Assédio" },
      { value: "inappropriate_content", label: "Conteúdo inapropriado" },
      { value: "fake_profile", label: "Perfil falso" },
      { value: "violence", label: "Violência" },
      { value: "hate_speech", label: "Discurso de ódio" },
      { value: "other", label: "Outro" },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Denunciar usuário</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da denúncia
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um motivo</option>
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={reportUser}
                disabled={!reportType}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Enviar denúncia
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : profile ? (
          <>
            {/* Header */}
            <div className="relative">
              {profile.cover_photo ? (
                <img
                  src={
                    profile.cover_photo.startsWith("http")
                      ? profile.cover_photo
                      : `http://localhost:8000${profile.cover_photo}`
                  }
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-t-xl"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-xl"></div>
              )}

              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="absolute -bottom-16 left-6">
                <img
                  src={
                    profile.avatar?.startsWith("http")
                      ? profile.avatar
                      : profile.avatar
                        ? `http://localhost:8000${profile.avatar}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            `${profile.first_name} ${profile.last_name}`
                          )}&background=3B82F6&color=fff&size=128`
                  }
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
              </div>
            </div>

            <div className="pt-20 p-6">
              {/* User Info */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    {profile.is_verified && (
                      <Shield className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  
                  {profile.username && (
                    <p className="text-gray-600 mb-2">@{profile.username}</p>
                  )}
                  
                  {profile.nickname && (
                    <p className="text-gray-600 mb-2">"{profile.nickname}"</p>
                  )}
                  
                  {profile.bio && (
                    <p className="text-gray-700 mb-4">{profile.bio}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{profile.friends_count} amigos</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{profile.posts_count} posts</span>
                    </span>
                  </div>
                </div>

                {!profile.is_own_profile && (
                  <div className="flex flex-col space-y-2">
                    {friendshipStatus === "accepted" ? (
                      <button
                        onClick={removeFriend}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Amigos</span>
                      </button>
                    ) : friendshipStatus === "pending" ? (
                      <button
                        disabled
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg cursor-not-allowed"
                      >
                        <Users className="w-4 h-4" />
                        <span>Pendente</span>
                      </button>
                    ) : (
                      <button
                        onClick={sendFriendRequest}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Adicionar</span>
                      </button>
                    )}

                    <button
                      onClick={toggleFollow}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        followStatus
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{followStatus ? "Seguindo" : "Seguir"}</span>
                    </button>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Denunciar</span>
                      </button>
                      <button
                        onClick={blockUser}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Bloquear</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.location && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.work && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{profile.work}</span>
                  </div>
                )}

                {profile.education && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    <span>{profile.education}</span>
                  </div>
                )}

                {profile.website && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe className="w-4 h-4" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Entrou em {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>

                {profile.birth_date && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Nasceu em {new Date(profile.birth_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {profile.relationship_status && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Heart className="w-4 h-4" />
                    <span>{profile.relationship_status}</span>
                  </div>
                )}

                {profile.email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Erro ao carregar perfil</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              Fechar
            </button>
          </div>
        )}

        {showReportModal && (
          <ReportModal onClose={() => setShowReportModal(false)} />
        )}
      </div>
    </div>
  );
}
