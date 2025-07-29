import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Heart,
  MessageCircle,
  UserPlus,
  UserCheck,
  Edit3,
  Settings,
  Camera,
  Briefcase,
  GraduationCap,
  Globe,
  Phone,
  Mail,
  Verified,
  Grid3X3,
  List,
  Star,
  Share2,
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
  hometown?: string;
  website?: string;
  work?: string;
  education?: string;
  relationship_status?: string;
  birth_date?: string;
  gender?: string;
  phone?: string;
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
}

interface ModernProfileProps {
  userId: number;
  userToken: string;
  currentUserId: number;
  onEditProfile?: () => void;
  onSendMessage?: (userId: number) => void;
}

export function ModernProfile({
  userId,
  userToken,
  currentUserId,
  onEditProfile,
  onSendMessage,
}: ModernProfileProps) {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [testimonials, setTestimonials] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "testimonials">("posts");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none");
  const [followStatus, setFollowStatus] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        headers: { Authorization: `Bearer ${userToken}` },
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
        headers: { Authorization: `Bearer ${userToken}` },
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
        headers: { Authorization: `Bearer ${userToken}` },
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
        headers: { Authorization: `Bearer ${userToken}` },
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
        headers: { Authorization: `Bearer ${userToken}` },
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
      if (response.ok) setFriendshipStatus("pending");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  };

  const handleToggleFollow = async () => {
    try {
      const response = await fetch(`http://localhost:8000/follow/${userId}`, {
        method: followStatus ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.ok) setFollowStatus(!followStatus);
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
        headers: { Authorization: `Bearer ${userToken}` },
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
        headers: { Authorization: `Bearer ${userToken}` },
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isOwnProfile = profile.is_own_profile;
  const displayedPosts = activeTab === "posts" ? posts : testimonials;

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header with Cover */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-56 sm:h-64 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 relative overflow-hidden">
            {profile.cover_photo && (
              <img
                src={profile.cover_photo.startsWith("http") ? profile.cover_photo : `http://localhost:8000${profile.cover_photo}`}
                alt="Capa"
                className="w-full h-full object-cover"
              />
            )}
            {isOwnProfile && (
              <>
                <input type="file" id="mobile-cover-upload" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                <button
                  onClick={() => document.getElementById('mobile-cover-upload')?.click()}
                  className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2.5 rounded-full text-white shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Avatar and Basic Info */}
          <div className="px-4 sm:px-6 pb-4">
            <div className="flex items-end -mt-14 sm:-mt-16 mb-4">
              <div className="relative">
                <img
                  src={
                    profile.avatar
                      ? (profile.avatar.startsWith("http") ? profile.avatar : `http://localhost:8000${profile.avatar}`)
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(`${profile.first_name} ${profile.last_name}`)}&background=3B82F6&color=fff&size=120`
                  }
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl"
                />
                {isOwnProfile && (
                  <>
                    <input type="file" id="mobile-avatar-upload" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    <button
                      onClick={() => document.getElementById('mobile-avatar-upload')?.click()}
                      className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white shadow-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {profile.is_verified && <Verified className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                </div>
                {profile.username && (
                  <p className="text-gray-600 text-sm sm:text-base">@{profile.username}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed px-1">{profile.bio}</p>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-4 sm:mb-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{profile.friends_count}</div>
                <div className="text-xs sm:text-sm text-gray-600">Amigos</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{profile.followers_count || 0}</div>
                <div className="text-xs sm:text-sm text-gray-600">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{profile.following_count || 0}</div>
                <div className="text-xs sm:text-sm text-gray-600">Seguindo</div>
              </div>
              <div className="text-center">
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="space-y-3">
              {isOwnProfile ? (
                <div className="flex space-x-3">
                  <button
                    onClick={onEditProfile}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 sm:py-3.5 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar perfil</span>
                  </button>
                  <button className="px-4 py-3 sm:py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <div className="flex space-x-3 sm:flex-1">
                    {friendshipStatus === "accepted" ? (
                      <button className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-100 text-green-700 rounded-xl font-medium">
                        <UserCheck className="w-4 h-4" />
                        <span>Amigos</span>
                      </button>
                    ) : friendshipStatus === "pending" ? (
                      <button disabled className="flex-1 flex items-center justify-center space-x-2 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-medium cursor-not-allowed">
                        <Users className="w-4 h-4" />
                        <span>Pendente</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSendFriendRequest}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Adicionar</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSendMessage?.(userId)}
                      className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleToggleFollow}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors sm:px-6 ${followStatus ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span className="hidden sm:inline">{followStatus ? 'Seguindo' : 'Seguir'}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 mt-4 sm:mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Informações Pessoais</span>
              </h3>

              <div className="space-y-4">
                {/* Work and Position */}
                {profile.work && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Trabalho</p>
                      <p className="text-sm text-gray-700">{profile.work}</p>
                    </div>
                  </div>
                )}

                {/* Education */}
                {profile.education && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Formação</p>
                      <p className="text-sm text-gray-700">{profile.education}</p>
                    </div>
                  </div>
                )}

                {/* Relationship Status */}
                {profile.relationship_status && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Heart className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Estado Civil</p>
                      <p className="text-sm text-gray-700">{profile.relationship_status}</p>
                    </div>
                  </div>
                )}

                {/* Current Location */}
                {profile.location && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Cidade Atual</p>
                      <p className="text-sm text-gray-700">{profile.location}</p>
                    </div>
                  </div>
                )}

                {/* Hometown */}
                {profile.hometown && (
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Cidade Natal</p>
                      <p className="text-sm text-gray-700">{profile.hometown}</p>
                    </div>
                  </div>
                )}

                {/* Show a message if no personal info is available */}
                {!profile.work && !profile.education && !profile.relationship_status && !profile.location && !profile.hometown && (
                  <div className="text-center py-6">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhuma informação pessoal adicionada ainda</p>
                    {profile.is_own_profile && (
                      <p className="text-gray-400 text-xs mt-1">Edite seu perfil para adicionar informações</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 sm:py-5 text-center font-medium transition-colors ${
                activeTab === "posts"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Posts ({posts.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`flex-1 py-4 sm:py-5 text-center font-medium transition-colors ${
                activeTab === "testimonials"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Depoimentos ({testimonials.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
          {displayedPosts.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-xl shadow-sm">
              {activeTab === "posts" ? (
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              ) : (
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              )}
              <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3">
                {activeTab === "posts" ? "Nenhum post ainda" : "Nenhum depoimento ainda"}
              </h3>
              <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
                {isOwnProfile
                  ? `Comece a ${activeTab === "posts" ? "compartilhar suas ideias" : "escrever depoimentos"}!`
                  : `${profile.first_name} ainda não ${activeTab === "posts" ? "postou nada" : "tem depoimentos"}.`}
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
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Header */}
        <div className="relative bg-white rounded-b-3xl shadow-lg overflow-hidden">
          {/* Cover Photo */}
          <div className="h-80 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 relative">
            {profile.cover_photo && (
              <img
                src={profile.cover_photo.startsWith("http") ? profile.cover_photo : `http://localhost:8000${profile.cover_photo}`}
                alt="Capa"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            
            {isOwnProfile && (
              <>
                <input type="file" id="desktop-cover-upload" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                <button
                  onClick={() => document.getElementById('desktop-cover-upload')?.click()}
                  disabled={uploadingCover}
                  className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all"
                >
                  {uploadingCover ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="px-8 pt-6 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-8 -mt-16">
              {/* Avatar */}
              <div className="relative flex-shrink-0 mb-6 lg:mb-0">
                <img
                  src={
                    profile.avatar
                      ? (profile.avatar.startsWith("http") ? profile.avatar : `http://localhost:8000${profile.avatar}`)
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(`${profile.first_name} ${profile.last_name}`)}&background=3B82F6&color=fff&size=160`
                  }
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-40 h-40 rounded-full border-6 border-white shadow-xl bg-white"
                />
                
                {isOwnProfile && (
                  <>
                    <input type="file" id="desktop-avatar-upload" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    <button
                      onClick={() => document.getElementById('desktop-avatar-upload')?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full text-white shadow-lg hover:bg-blue-700 transition-all"
                    >
                      {uploadingAvatar ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between">
                  <div className="mb-6 xl:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-4xl font-bold text-gray-900" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {profile.first_name} {profile.last_name}
                      </h1>
                      {profile.is_verified && (
                        <Verified className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    
                    {profile.username && (
                      <p className="text-xl text-gray-600 mb-3">@{profile.username}</p>
                    )}

                    {profile.bio && (
                      <p className="text-gray-700 text-lg mb-4 max-w-2xl leading-relaxed">{profile.bio}</p>
                    )}

                    {/* Profile Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {profile.location && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-5 h-5" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      
                      {profile.work && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Briefcase className="w-5 h-5" />
                          <span>{profile.work}</span>
                        </div>
                      )}
                      
                      {profile.education && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <GraduationCap className="w-5 h-5" />
                          <span>{profile.education}</span>
                        </div>
                      )}
                      
                      {profile.website && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Globe className="w-5 h-5" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Site
                          </a>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <span>Entrou em {new Date(profile.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex space-x-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{profile.posts_count}</div>
                        <div className="text-sm text-gray-600">Posts</div>
                      </div>
                      <button className="text-center hover:text-blue-600 transition-colors">
                        <div className="text-2xl font-bold text-gray-900">{profile.friends_count}</div>
                        <div className="text-sm text-gray-600">Amigos</div>
                      </button>
                      <button className="text-center hover:text-blue-600 transition-colors">
                        <div className="text-2xl font-bold text-gray-900">{profile.followers_count || 0}</div>
                        <div className="text-sm text-gray-600">Seguidores</div>
                      </button>
                      <button className="text-center hover:text-blue-600 transition-colors">
                        <div className="text-2xl font-bold text-gray-900">{profile.following_count || 0}</div>
                        <div className="text-sm text-gray-600">Seguindo</div>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-3">
                    {isOwnProfile ? (
                      <>
                        <button
                          onClick={onEditProfile}
                          className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-105"
                        >
                          <Edit3 className="w-5 h-5" />
                          <span className="font-semibold">Editar perfil</span>
                        </button>
                        
                        <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                          <Settings className="w-5 h-5" />
                          <span className="font-medium">Configurações</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex space-x-3">
                        {friendshipStatus === "accepted" ? (
                          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors">
                            <UserCheck className="w-5 h-5" />
                            <span className="font-medium">Amigos</span>
                          </button>
                        ) : friendshipStatus === "pending" ? (
                          <button disabled className="flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl cursor-not-allowed">
                            <Users className="w-5 h-5" />
                            <span className="font-medium">Pendente</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleSendFriendRequest}
                            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                          >
                            <UserPlus className="w-5 h-5" />
                            <span className="font-medium">Adicionar</span>
                          </button>
                        )}

                        <button
                          onClick={handleToggleFollow}
                          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-colors ${
                            followStatus
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          }`}
                        >
                          <Heart className="w-5 h-5" />
                          <span className="font-medium">{followStatus ? "Seguindo" : "Seguir"}</span>
                        </button>

                        <button
                          onClick={() => onSendMessage?.(userId)}
                          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">Mensagem</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Content */}
        <div className="flex gap-8 p-8">
          {/* Sidebar with additional info */}
          <div className="w-80 space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
              <div className="space-y-3">
                {profile.relationship_status && (
                  <div className="flex items-center space-x-3">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{profile.relationship_status}</span>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{profile.phone}</span>
                  </div>
                )}
                
                {profile.gender && (
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{profile.gender}</span>
                  </div>
                )}
                
                {profile.birth_date && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {new Date(profile.birth_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações rápidas</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar perfil</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Star className="w-4 h-4" />
                  <span>Favoritar</span>
                </button>
                {!isOwnProfile && (
                  <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                    <span>Mais opções</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs and View Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`flex items-center space-x-2 pb-4 border-b-2 font-medium transition-colors ${
                      activeTab === "posts"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Posts ({posts.length})</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("testimonials")}
                    className={`flex items-center space-x-2 pb-4 border-b-2 font-medium transition-colors ${
                      activeTab === "testimonials"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>Depoimentos ({testimonials.length})</span>
                  </button>
                </div>

                {/* View Mode Controls */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-600"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Posts/Testimonials Content */}
            {displayedPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {activeTab === "posts" ? "Nenhum post ainda" : "Nenhum depoimento ainda"}
                </h3>
                <p className="text-gray-500">
                  {isOwnProfile
                    ? `Comece a ${activeTab === "posts" ? "compartilhar suas ideias" : "escrever depoimentos"}!`
                    : `${profile.first_name} ainda não ${activeTab === "posts" ? "postou nada" : "tem depoimentos"}.`}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${post.author.first_name} ${post.author.last_name}`)}&background=3B82F6&color=fff&size=40`}
                        alt={`${post.author.first_name} ${post.author.last_name}`}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.author.first_name} {post.author.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{post.content}</p>
                    {post.media_url && (
                      <div className="mt-3 rounded-lg overflow-hidden">
                        <img
                          src={post.media_url.startsWith("http") ? post.media_url : `http://localhost:8000${post.media_url}`}
                          alt="Post media"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{post.reactions_count} reações</span>
                        <span>{post.comments_count} comentários</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {displayedPosts.map((post) => (
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
