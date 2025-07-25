import React, { useState, useEffect } from "react";
import { Users, UserPlus, UserMinus, UserCheck, MessageCircle, Flag, X, AlertTriangle } from "lucide-react";

interface Friend {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  is_verified: boolean;
  friendship_date: string;
}

interface FriendRequest {
  id: number;
  requester: {
    id: number;
    first_name: string;
    last_name: string;
    username?: string;
    avatar?: string;
  };
  created_at: string;
}

interface FriendsManagerProps {
  userToken: string;
  currentUserId: number;
  onUserSelect?: (userId: number) => void;
}

export function FriendsManager({ userToken, currentUserId, onUserSelect }: FriendsManagerProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState<number | null>(null);

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch("http://localhost:8000/friendships/", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error("Erro ao carregar amigos:", error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch("http://localhost:8000/friendships/requests", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data);
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId: number) => {
    if (!confirm("Tem certeza que deseja remover este amigo?")) return;

    try {
      const response = await fetch(`http://localhost:8000/friendships/${friendId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFriends(prev => prev.filter(friend => friend.id !== friendId));
      }
    } catch (error) {
      console.error("Erro ao remover amigo:", error);
    }
  };

  const acceptFriendRequest = async (requestId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/friendships/requests/${requestId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        await fetchFriends(); // Recarregar lista de amigos
      }
    } catch (error) {
      console.error("Erro ao aceitar solicitação:", error);
    }
  };

  const rejectFriendRequest = async (requestId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/friendships/requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error);
    }
  };

  const reportUser = async (userId: number, reportType: string, description: string) => {
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
        setShowReportModal(null);
        alert("Denúncia enviada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
    }
  };

  const blockUser = async (userId: number) => {
    if (!confirm("Tem certeza que deseja bloquear este usuário? Isso também removerá a amizade.")) return;

    try {
      const response = await fetch(`http://localhost:8000/reports/block/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setFriends(prev => prev.filter(friend => friend.id !== userId));
        alert("Usuário bloqueado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao bloquear usuário:", error);
    }
  };

  const ReportModal = ({ userId, onClose }: { userId: number; onClose: () => void }) => {
    const [reportType, setReportType] = useState("");
    const [description, setDescription] = useState("");

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                onClick={() => reportUser(userId, reportType, description)}
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Meus Amigos</h2>
            <p className="text-sm text-gray-600">Gerencie seus amigos e solicitações</p>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "friends"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Amigos ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "requests"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Solicitações ({friendRequests.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === "friends" ? (
          friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum amigo ainda
              </h3>
              <p className="text-gray-500">Comece a descobrir pessoas para adicionar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={
                      friend.avatar?.startsWith("http")
                        ? friend.avatar
                        : friend.avatar
                          ? `http://localhost:8000${friend.avatar}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              `${friend.first_name} ${friend.last_name}`
                            )}&background=3B82F6&color=fff`
                    }
                    alt={`${friend.first_name} ${friend.last_name}`}
                    className="w-12 h-12 rounded-full"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => onUserSelect?.(friend.id)}
                      >
                        {friend.first_name} {friend.last_name}
                      </h3>
                      {friend.is_verified && (
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    
                    {friend.username && (
                      <p className="text-sm text-gray-500">@{friend.username}</p>
                    )}
                    
                    {friend.bio && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{friend.bio}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUserSelect?.(friend.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Perfil</span>
                    </button>
                    
                    <button
                      onClick={() => setShowReportModal(friend.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                      <span className="text-sm">Denunciar</span>
                    </button>
                    
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span className="text-sm">Remover</span>
                    </button>

                    <button
                      onClick={() => blockUser(friend.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Bloquear</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          friendRequests.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma solicitação pendente
              </h3>
              <p className="text-gray-500">Você não tem solicitações de amizade no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={
                      request.requester.avatar?.startsWith("http")
                        ? request.requester.avatar
                        : request.requester.avatar
                          ? `http://localhost:8000${request.requester.avatar}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              `${request.requester.first_name} ${request.requester.last_name}`
                            )}&background=3B82F6&color=fff`
                    }
                    alt={`${request.requester.first_name} ${request.requester.last_name}`}
                    className="w-12 h-12 rounded-full"
                  />

                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onUserSelect?.(request.requester.id)}
                    >
                      {request.requester.first_name} {request.requester.last_name}
                    </h3>
                    {request.requester.username && (
                      <p className="text-sm text-gray-500">@{request.requester.username}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Enviado em {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => acceptFriendRequest(request.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm">Aceitar</span>
                    </button>
                    
                    <button
                      onClick={() => rejectFriendRequest(request.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm">Rejeitar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {showReportModal && (
        <ReportModal
          userId={showReportModal}
          onClose={() => setShowReportModal(null)}
        />
      )}
    </div>
  );
}
