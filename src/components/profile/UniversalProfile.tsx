import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  UserPlus,
  UserCheck,
  Heart,
  Share2,
  Settings,
  Camera,
  Edit3,
  Briefcase,
  GraduationCap,
  Globe,
  Shield,
  UserMinus,
  Flag,
  MoreHorizontal,
} from "lucide-react";
import { PostCard } from "../posts/PostCard";

interface ProfileUser {
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
  birth_date?: string;
  gender?: string;
  is_verified: boolean;
  friends_count: number;
  posts_count: number;
  followers_count?: number;
  following_count?: number;
  is_friend: boolean;
  is_own_profile: boolean;
  created_at: string;
}

interface Post {
  id: number;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  content: string;
  post_type: "post" | "testimonial";
  media_type?: string;
  media_url?: string;
  created_at: string;
  reactions_count: number;
  comments_count: number;
  shares_count: number;
  is_profile_update?: boolean;
  is_cover_update?: boolean;
}

interface UniversalProfileProps {
  userId: number;
  userToken: string;
  currentUserId: number;
  onEditProfile?: () => void;
  onSendMessage?: (userId: number) => void;
}

export function UniversalProfile({
  userId,
  userToken,
  currentUserId,
  onEditProfile,
  onSendMessage,
}: UniversalProfileProps) {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [testimonials, setTestimonials] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "testimonials">("posts");
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none");
  const [followStatus, setFollowStatus] = useState<boolean>(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
      fetchTestimonials();
      if (userId !== currentUserId) {
        fetchFriendshipStatus();
        fetchFollowStatus();
      }
    }
  }, [userId]);

  const fetchProfile = async () => {
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
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}/posts`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}/testimonials`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error("Erro ao carregar depoimentos:", error);
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
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  };

  const handleRemoveFriend = async () => {
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

  const handleToggleFollow = async () => {
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/users/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, avatar: data.avatar_url } : null);
      }
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/users/me/cover", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, cover_photo: data.cover_photo_url } : null);
      }
    } catch (error) {
      console.error("Erro ao atualizar capa:", error);
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isOwnProfile = profile.is_own_profile;
  const displayedPosts = activeTab === "posts" ? posts : testimonials;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative h-80 bg-gradient-to-r from-blue-400 to-purple-500">
        {profile.cover_photo ? (
          <img
            src={
              profile.cover_photo.startsWith("http")
                ? profile.cover_photo
                : `http://localhost:8000${profile.cover_photo}`
            }
            alt="Capa"
            className="w-full h-80 object-cover"
          />
        ) : (
          <div className="w-full h-80 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        )}
        
        {isOwnProfile && (
          <>
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById('cover-upload')?.click()}
              disabled={uploadingCover}
              className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all disabled:opacity-50"
            >
              {uploadingCover ? (
                <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 pb-8">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <img
                src={
                  profile.avatar
                    ? profile.avatar.startsWith("http")
                      ? profile.avatar
                      : `http://localhost:8000${profile.avatar}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        `${profile.first_name} ${profile.last_name}`
                      )}&background=3B82F6&color=fff&size=160`
                }
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-40 h-40 rounded-full border-4 border-white shadow-lg"
              />
              
              {isOwnProfile && (
                <>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    {profile.is_verified && (
                      <Shield className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  
                  {profile.username && (
                    <p className="text-gray-600 text-lg">@{profile.username}</p>
                  )}

                  {profile.bio && (
                    <p className="text-gray-700 mt-2 max-w-2xl">{profile.bio}</p>
                  )}

                  {/* Profile Details */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    {profile.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    
                    {profile.work && (
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{profile.work}</span>
                      </div>
                    )}
                    
                    {profile.education && (
                      <div className="flex items-center space-x-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{profile.education}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Entrou em {new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex space-x-6 mt-4">
                    <button className="hover:text-blue-600 transition-colors">
                      <span className="font-semibold text-gray-900">{profile.friends_count}</span>
                      <span className="text-gray-600 ml-1">amigos</span>
                    </button>
                    
                    <button className="hover:text-blue-600 transition-colors">
                      <span className="font-semibold text-gray-900">{profile.followers_count || 0}</span>
                      <span className="text-gray-600 ml-1">seguidores</span>
                    </button>
                    
                    <button className="hover:text-blue-600 transition-colors">
                      <span className="font-semibold text-gray-900">{profile.following_count || 0}</span>
                      <span className="text-gray-600 ml-1">seguindo</span>
                    </button>
                    
                    <div>
                      <span className="font-semibold text-gray-900">{profile.posts_count}</span>
                      <span className="text-gray-600 ml-1">posts</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={onEditProfile}
                        className="flex items-center justify-center space-x-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Editar perfil</span>
                      </button>
                      
                      <button className="flex items-center justify-center space-x-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {friendshipStatus === "accepted" ? (
                        <button
                          onClick={handleRemoveFriend}
                          className="flex items-center justify-center space-x-2 px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Amigos</span>
                        </button>
                      ) : friendshipStatus === "pending" ? (
                        <button
                          disabled
                          className="flex items-center justify-center space-x-2 px-6 py-2 bg-yellow-100 text-yellow-700 rounded-lg cursor-not-allowed"
                        >
                          <Users className="w-4 h-4" />
                          <span>Pendente</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleSendFriendRequest}
                          className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Adicionar</span>
                        </button>
                      )}

                      <button
                        onClick={handleToggleFollow}
                        className={`flex items-center justify-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                          followStatus
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        <span>{followStatus ? "Seguindo" : "Seguir"}</span>
                      </button>

                      <button
                        onClick={() => onSendMessage?.(userId)}
                        className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Mensagem</span>
                      </button>

                      <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "posts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Posts ({posts.length})
            </button>
            
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "testimonials"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Depoimentos ({testimonials.length})
            </button>
          </nav>
        </div>

        {/* Posts/Testimonials */}
        <div className="space-y-6 pb-8">
          {displayedPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "posts" ? "Nenhum post ainda" : "Nenhum depoimento ainda"}
              </h3>
              <p className="text-gray-500">
                {isOwnProfile
                  ? `Comece a ${activeTab === "posts" ? "compartilhar" : "escrever depoimentos"}!`
                  : `${profile.first_name} ainda não ${activeTab === "posts" ? "postou" : "tem depoimentos"}.`}
              </p>
            </div>
          ) : (
            displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                userToken={userToken}
                currentUserId={currentUserId}
                canEdit={isOwnProfile}
                onDelete={() => {
                  if (activeTab === "posts") {
                    setPosts(prev => prev.filter(p => p.id !== post.id));
                  } else {
                    setTestimonials(prev => prev.filter(p => p.id !== post.id));
                  }
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
