import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
  Heart,
  MessageCircle,
  Users,
  UserCheck,
  MoreHorizontal,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
} from "lucide-react";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
  bio?: string;
  location?: string;
  work?: string;
  education?: string;
  birth_date?: string;
  website?: string;
  relationship_status?: string;
  gender?: string;
}

interface UserStats {
  followers_count: number;
  following_count: number;
  posts_count: number;
  friends_count: number;
}

interface PublicProfilePageProps {
  userToken: string;
  currentUserId: number;
}

export function PublicProfilePage({
  userToken,
  currentUserId,
}: PublicProfilePageProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none");
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserStats();
      fetchFriendshipStatus();
      fetchFollowStatus();
      fetchUserPosts();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 404) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${userId}/stats`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchFriendshipStatus = async () => {
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
        setFriendshipStatus(data.status || "none");
      }
    } catch (error) {
      console.error("Error fetching friendship status:", error);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/follow/status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.is_following);
      }
    } catch (error) {
      console.error("Error fetching follow status:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${userId}/posts`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const userPosts = await response.json();
        setPosts(userPosts);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
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
        body: JSON.stringify({ addressee_id: parseInt(userId!) }),
      });

      if (response.ok) {
        setFriendshipStatus("pending");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const removeFriend = async () => {
    try {
      const response = await fetch(`http://localhost:8000/friends/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFriendshipStatus("none");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const toggleFollow = async () => {
    try {
      const response = await fetch(`http://localhost:8000/follow/${userId}`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        // Update stats
        if (userStats) {
          setUserStats({
            ...userStats,
            followers_count: userStats.followers_count + (isFollowing ? -1 : 1),
          });
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const getFriendshipButton = () => {
    switch (friendshipStatus) {
      case "accepted":
        return (
          <button
            onClick={removeFriend}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>Amigos</span>
          </button>
        );
      case "pending":
        return (
          <button
            disabled
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg cursor-not-allowed"
          >
            <Users className="w-4 h-4" />
            <span>Solicitação enviada</span>
          </button>
        );
      default:
        return (
          <button
            onClick={sendFriendRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar amigo</span>
          </button>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <p className="text-gray-500">Usuário não encontrado</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Perfil de {user.first_name}</h1>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-400 to-purple-500">
          {user.cover_photo && (
            <img
              src={
                user.cover_photo.startsWith("http")
                  ? user.cover_photo
                  : `http://localhost:8000${user.cover_photo}`
              }
              alt="Capa"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
            <div className="relative self-center sm:self-start">
              <img
                src={
                  user.avatar?.startsWith("http")
                    ? user.avatar
                    : user.avatar
                      ? `http://localhost:8000${user.avatar}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          `${user.first_name} ${user.last_name}`,
                        )}&background=3B82F6&color=fff`
                }
                alt={`${user.first_name} ${user.last_name}`}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
              {getFriendshipButton()}
              <button
                onClick={toggleFollow}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isFollowing
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>{isFollowing ? "Deixar de seguir" : "Seguir"}</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Mensagem</span>
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="text-center sm:text-left mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {user.first_name} {user.last_name}
              {user.username && (
                <span className="text-lg text-gray-500 font-normal ml-2">
                  @{user.username}
                </span>
              )}
            </h1>

            {user.bio && (
              <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
            )}

            {/* Stats */}
            {userStats && (
              <div className="flex justify-center sm:justify-start space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {userStats.posts_count}
                  </div>
                  <div className="text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {userStats.followers_count}
                  </div>
                  <div className="text-gray-500">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {userStats.following_count}
                  </div>
                  <div className="text-gray-500">Seguindo</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {userStats.friends_count}
                  </div>
                  <div className="text-gray-500">Amigos</div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-sm text-gray-600">
              {user.work && (
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{user.work}</span>
                </div>
              )}
              {user.education && (
                <div className="flex items-center space-x-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{user.education}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">
          Posts de {user.first_name}
        </h2>

        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Ainda não há posts públicos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-100 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={
                      user.avatar?.startsWith("http")
                        ? user.avatar
                        : user.avatar
                          ? `http://localhost:8000${user.avatar}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              `${user.first_name} ${user.last_name}`,
                            )}&background=3B82F6&color=fff`
                    }
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>

                <p className="text-gray-900 whitespace-pre-wrap mb-3">
                  {post.content}
                </p>

                {post.media_url && (
                  <div className="mb-3">
                    {post.media_type === "photo" && (
                      <img
                        src={
                          post.media_url.startsWith("http")
                            ? post.media_url
                            : `http://localhost:8000${post.media_url}`
                        }
                        alt="Post media"
                        className="w-full rounded-lg max-h-96 object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{post.reactions_count} reações</span>
                  <span>{post.comments_count} comentários</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
