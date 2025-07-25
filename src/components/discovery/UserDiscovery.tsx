import React, { useState, useEffect } from "react";
import { Users, UserPlus, Search, Filter, Loader } from "lucide-react";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  mutual_friends: number;
}

interface UserDiscoveryProps {
  userToken: string;
  onUserSelect?: (userId: number) => void;
}

export function UserDiscovery({ userToken, onUserSelect }: UserDiscoveryProps) {
  const [discoveredUsers, setDiscoveredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "suggested">("all");

  useEffect(() => {
    fetchDiscoveredUsers();
  }, [filter]);

  const fetchDiscoveredUsers = async () => {
    setLoading(true);
    try {
      let endpoint = "http://localhost:8000/users/?limit=20";

      if (filter === "suggested") {
        endpoint = "http://localhost:8000/friendships/suggestions?limit=20";
      } else if (filter === "new") {
        // Buscar usuários mais recentes
        endpoint = "http://localhost:8000/users/?limit=20&sort=created_at&order=desc";
      } else if (filter === "all") {
        endpoint = "http://localhost:8000/users/?limit=20";
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Adicionar propriedade mutual_friends se não existir
        const usersWithMutualFriends = data.map((user: any) => ({
          ...user,
          mutual_friends: user.mutual_friends || 0
        }));
        setDiscoveredUsers(usersWithMutualFriends);
      } else {
        console.error("Erro na resposta:", response.status);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId: number) => {
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
        // Remove user from discovery list after sending request
        setDiscoveredUsers((prev) => prev.filter((user) => user.id !== userId));
      }
    } catch (error) {
      console.error("Erro ao enviar solicitação de amizade:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Descobrir Pessoas
              </h2>
              <p className="text-sm text-gray-600">
                Encontre novos amigos na plataforma
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("suggested")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "suggested"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sugeridos
          </button>
          <button
            onClick={() => setFilter("new")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === "new"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Novos
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : discoveredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-500">
              {filter === "suggested"
                ? "Você não tem sugestões de amizade no momento"
                : "Não há novos usuários para descobrir"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {discoveredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={
                    user.avatar
                      ? user.avatar.startsWith("http")
                        ? user.avatar
                        : `http://localhost:8000${user.avatar}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + " " + user.last_name)}&background=3B82F6&color=fff`
                  }
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.first_name + " " + user.last_name
                    )}&background=3B82F6&color=fff`;
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3
                      className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onUserSelect?.(user.id)}
                    >
                      {user.first_name} {user.last_name}
                    </h3>
                    {user.username && (
                      <span className="text-sm text-gray-500">
                        @{user.username}
                      </span>
                    )}
                  </div>

                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    {user.location && <span>{user.location}</span>}
                    {user.mutual_friends > 0 && (
                      <span className="text-blue-600">
                        {user.mutual_friends} amigos em comum
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleSendFriendRequest(user.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
