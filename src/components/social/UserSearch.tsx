import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserPlus,
  UserMinus,
  Users,
  Heart,
  MessageCircle,
  UserCheck,
} from "lucide-react";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
  avatar?: string;
  email?: string;
}

interface UserSearchProps {
  userToken: string;
  currentUserId: number;
  onClose?: () => void;
}

export function UserSearch({
  userToken,
  currentUserId,
  onClose,
}: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendshipStatuses, setFriendshipStatuses] = useState<{
    [key: number]: string;
  }>({});
  const [followStatuses, setFollowStatuses] = useState<{
    [key: number]: boolean;
  }>({});
  const navigate = useNavigate();

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/users/?search=${encodeURIComponent(query)}&limit=15`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const users = await response.json();
        setSearchResults(
          users.filter((user: User) => user.id !== currentUserId),
        );

        // Get friendship and follow statuses for each user
        for (const user of users) {
          if (user.id !== currentUserId) {
            await Promise.all([
              getFriendshipStatus(user.id),
              getFollowStatus(user.id),
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFriendshipStatus = async (userId: number) => {
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
        setFriendshipStatuses((prev) => ({
          ...prev,
          [userId]: data.status || "none",
        }));
      }
    } catch (error) {
      console.error("Error getting friendship status:", error);
    }
  };

  const getFollowStatus = async (userId: number) => {
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
        setFollowStatuses((prev) => ({
          ...prev,
          [userId]: data.is_following,
        }));
      }
    } catch (error) {
      console.error("Error getting follow status:", error);
    }
  };

  const sendFriendRequest = async (userId: number) => {
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
        setFriendshipStatuses((prev) => ({
          ...prev,
          [userId]: "pending",
        }));
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const toggleFollow = async (userId: number) => {
    const isFollowing = followStatuses[userId];

    try {
      const response = await fetch(`http://localhost:8000/follow/${userId}`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFollowStatuses((prev) => ({
          ...prev,
          [userId]: !isFollowing,
        }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const removeFriend = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/friendships/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFriendshipStatuses((prev) => ({
          ...prev,
          [userId]: "none",
        }));
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const visitProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
    if (onClose) onClose();
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const getFriendshipButton = (user: User) => {
    const status = friendshipStatuses[user.id];

    switch (status) {
      case "accepted":
        return (
          <button
            onClick={() => removeFriend(user.id)}
            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span className="text-sm">Amigos</span>
          </button>
        );
      case "pending":
        return (
          <button
            disabled
            className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg cursor-not-allowed"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm">Pendente</span>
          </button>
        );
      default:
        return (
          <button
            onClick={() => sendFriendRequest(user.id)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm">Adicionar</span>
          </button>
        );
    }
  };

  const getFollowButton = (user: User) => {
    const isFollowing = followStatuses[user.id];

    return (
      <button
        onClick={() => toggleFollow(user.id)}
        className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
          isFollowing
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-pink-100 text-pink-700 hover:bg-pink-200"
        }`}
      >
        <Heart className="w-4 h-4" />
        <span className="text-sm">{isFollowing ? "Seguindo" : "Seguir"}</span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Procurar pessoas
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Procurar por nome, email ou username..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Procurando...</p>
          </div>
        )}

        {!loading && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        )}

        {searchResults.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div
              className="flex items-center space-x-3 cursor-pointer flex-1"
              onClick={() => visitProfile(user.id)}
            >
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
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user.first_name} {user.last_name}
                </h3>
                {user.username && (
                  <p className="text-sm text-gray-500">@{user.username}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {getFriendshipButton(user)}
              {getFollowButton(user)}
              <button
                onClick={() => visitProfile(user.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Perfil</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
