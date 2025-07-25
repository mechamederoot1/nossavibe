import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Check,
  X,
  Users,
  Clock,
  Eye,
  Bell,
} from "lucide-react";

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

interface FriendRequestNotificationsProps {
  userToken: string;
  currentUserId: number;
  onRequestHandled?: () => void;
  onUserProfileClick?: (userId: number) => void;
  showAsDropdown?: boolean;
  maxVisible?: number;
}

export function FriendRequestNotifications({
  userToken,
  currentUserId,
  onRequestHandled,
  onUserProfileClick,
  showAsDropdown = false,
  maxVisible = 5,
}: FriendRequestNotificationsProps) {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    setLoading(true);
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

  const handleFriendRequest = async (requestId: number, action: "accept" | "reject") => {
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      const response = await fetch(
        `http://localhost:8000/friendships/requests/${requestId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        
        if (onRequestHandled) {
          onRequestHandled();
        }

        // Show success feedback
        const requester = friendRequests.find(req => req.id === requestId)?.requester;
        if (requester) {
          const message = action === "accept" 
            ? `Você aceitou a solicitação de ${requester.first_name}` 
            : `Você rejeitou a solicitação de ${requester.first_name}`;
          
          // Could dispatch a toast notification here
          console.log(message);
        }
      }
    } catch (error) {
      console.error(`Erro ao ${action} solicitação:`, error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const displayedRequests = showAsDropdown 
    ? friendRequests.slice(0, maxVisible)
    : friendRequests;

  if (loading && friendRequests.length === 0) {
    return (
      <div className={`${showAsDropdown ? 'p-4' : 'p-6'} text-center`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2 text-sm">Carregando solicitações...</p>
      </div>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <div className={`${showAsDropdown ? 'p-4' : 'p-6'} text-center`}>
        <UserPlus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          Nenhuma solicitação
        </h3>
        <p className="text-xs text-gray-500">
          Você não tem solicitações de amizade pendentes
        </p>
      </div>
    );
  }

  return (
    <div className={showAsDropdown ? "max-h-96 overflow-y-auto" : ""}>
      {!showAsDropdown && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Solicitações de Amizade
            </h2>
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {friendRequests.length}
            </span>
          </div>
        </div>
      )}

      <div className={`${showAsDropdown ? 'divide-y divide-gray-100' : 'space-y-1'}`}>
        {displayedRequests.map((request) => (
          <div
            key={request.id}
            className={`${
              showAsDropdown 
                ? 'p-3 hover:bg-gray-50' 
                : 'p-4 border border-gray-200 rounded-lg hover:bg-gray-50'
            } transition-colors`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
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
                  className={`${showAsDropdown ? 'w-10 h-10' : 'w-12 h-12'} rounded-full cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all`}
                  onClick={() => onUserProfileClick?.(request.requester.id)}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`${showAsDropdown ? 'text-sm' : 'text-base'} font-medium text-gray-900`}>
                      <span
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => onUserProfileClick?.(request.requester.id)}
                      >
                        {request.requester.first_name} {request.requester.last_name}
                      </span>
                    </p>
                    
                    {request.requester.username && (
                      <p className="text-xs text-gray-500">
                        @{request.requester.username}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(request.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-1 ml-2">
                    {processingRequests.has(request.id) ? (
                      <div className="flex items-center space-x-1">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleFriendRequest(request.id, "accept")}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Aceitar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleFriendRequest(request.id, "reject")}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Rejeitar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {onUserProfileClick && (
                          <button
                            onClick={() => onUserProfileClick(request.requester.id)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Ver perfil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more link for dropdown */}
      {showAsDropdown && friendRequests.length > maxVisible && (
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => window.location.href = "/friends"}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas as {friendRequests.length} solicitações
          </button>
        </div>
      )}
    </div>
  );
}
