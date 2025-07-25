import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  UserPlus,
  UserCheck,
  Eye,
  X,
  Shield,
  Briefcase,
  GraduationCap,
  Globe,
  Heart,
} from "lucide-react";

interface ProfileData {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
  bio?: string;
  avatar?: string;
  cover_photo?: string;
  location?: string;
  website?: string;
  work?: string;
  education?: string;
  relationship_status?: string;
  is_verified: boolean;
  friends_count: number;
  posts_count: number;
  is_friend: boolean;
  is_own_profile: boolean;
  created_at: string;
}

interface ProfilePreviewProps {
  userId: number;
  userToken: string;
  currentUserId: number;
  isOpen: boolean;
  onClose: () => void;
  onViewFullProfile: (userId: number) => void;
  onSendFriendRequest?: (userId: number) => void;
  onRemoveFriend?: (userId: number) => void;
  position?: { x: number; y: number };
}

export function ProfilePreview({
  userId,
  userToken,
  currentUserId,
  isOpen,
  onClose,
  onViewFullProfile,
  onSendFriendRequest,
  onRemoveFriend,
  position = { x: 0, y: 0 },
}: ProfilePreviewProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none");
  const [followStatus, setFollowStatus] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
      fetchFriendshipStatus();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}/profile`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile data received:", data); // Debug log
        setProfile(data);
      } else {
        console.error("Failed to fetch profile:", response.status, response.statusText);
        // Fallback: try basic user info
        const basicResponse = await fetch(`http://localhost:8000/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (basicResponse.ok) {
          const basicData = await basicResponse.json();
          console.log("Basic user data received:", basicData); // Debug log
          setProfile({
            ...basicData,
            friends_count: 0,
            posts_count: 0,
            is_friend: false,
            is_own_profile: false
          });
        }
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

  const handleSendFriendRequest = async () => {
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
        if (onSendFriendRequest) {
          onSendFriendRequest(userId);
        }
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const response = await fetch(`http://localhost:8000/friendships/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFriendshipStatus("none");
        if (onRemoveFriend) {
          onRemoveFriend(userId);
        }
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

  if (!isOpen || !profile) {
    return null;
  }

  const cardStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y, window.innerHeight - 400),
    zIndex: 1000,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent z-[999]"
        onClick={onClose}
      />
      
      {/* Preview Card */}
      <div
        style={cardStyle}
        className="bg-white rounded-xl shadow-xl border border-gray-200 w-80 overflow-hidden z-[1000]"
      >
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando...</p>
          </div>
        ) : (
          <>
            {/* Header with cover */}
            <div className="relative h-20 bg-gradient-to-r from-blue-400 to-purple-500">
              {profile.cover_photo ? (
                <img
                  src={
                    profile.cover_photo.startsWith("http")
                      ? profile.cover_photo
                      : `http://localhost:8000${profile.cover_photo}`
                  }
                  alt="Cover"
                  className="w-full h-20 object-cover"
                />
              ) : (
                <div className="w-full h-20 bg-gradient-to-r from-blue-400 to-purple-500"></div>
              )}
              
              <button
                onClick={onClose}
                className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1 hover:bg-opacity-100 transition-all"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Profile info */}
            <div className="p-4 -mt-8 relative">
              {/* Avatar */}
              <div className="flex items-start justify-between mb-3">
                <div className="relative">
                  <img
                    src={
                      profile.avatar
                        ? profile.avatar.startsWith("http")
                          ? profile.avatar
                          : `http://localhost:8000${profile.avatar}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            `${profile.first_name} ${profile.last_name}`
                          )}&background=3B82F6&color=fff&size=80`
                    }
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                    onError={(e) => {
                      // Fallback to default avatar if image fails to load
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        `${profile.first_name} ${profile.last_name}`
                      )}&background=3B82F6&color=fff&size=80`;
                    }}
                  />
                </div>
                
                {!profile.is_own_profile && (
                  <div className="flex space-x-1 mt-2">
                    {friendshipStatus === "accepted" ? (
                      <button
                        onClick={handleRemoveFriend}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="Amigos"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    ) : friendshipStatus === "pending" ? (
                      <button
                        disabled
                        className="p-2 bg-yellow-100 text-yellow-600 rounded-lg cursor-not-allowed"
                        title="Solicitação pendente"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSendFriendRequest}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Adicionar amigo"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={toggleFollow}
                      className={`p-2 rounded-lg transition-colors ${
                        followStatus
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-pink-100 text-pink-600 hover:bg-pink-200"
                      }`}
                      title={followStatus ? "Deixar de seguir" : "Seguir"}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Name and verification */}
              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  {profile.is_verified && (
                    <Shield className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                
                {profile.username && (
                  <p className="text-gray-600 text-sm">@{profile.username}</p>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {profile.bio}
                </p>
              )}

              {/* Quick info */}
              <div className="space-y-1 mb-3 text-xs text-gray-600">
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile.work && (
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-3 h-3" />
                    <span>{profile.work}</span>
                  </div>
                )}
                
                {profile.education && (
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>{profile.education}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Entrou em {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-4 mb-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{profile.friends_count}</p>
                  <p className="text-gray-600">Amigos</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{profile.posts_count}</p>
                  <p className="text-gray-600">Posts</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onViewFullProfile(userId)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Perfil</span>
                </button>
                
                {!profile.is_own_profile && (
                  <button
                    onClick={() => {
                      // Navigate to messages
                      window.location.href = `/messenger?user=${userId}`;
                    }}
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Enviar mensagem"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
