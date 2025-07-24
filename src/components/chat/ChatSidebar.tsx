import React, { useState, useEffect } from "react";
import { MessageCircle, Users, Search, MoreHorizontal } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
  avatar?: string;
}

interface OnlineUser {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  is_online: boolean;
  last_seen?: string;
}

interface Conversation {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  last_message?: {
    content: string;
    created_at: string;
    is_read: boolean;
  };
  unread_count: number;
}

interface ChatSidebarProps {
  user: User;
  isVisible: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ user, isVisible }) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadOnlineUsers();
    }
  }, [isVisible, user.token]);

  const loadOnlineUsers = async () => {
    try {
      // Simulated online users for now - replace with real API call
      const mockOnlineUsers: OnlineUser[] = [
        {
          id: 1,
          first_name: "Ana",
          last_name: "Silva",
          avatar: undefined,
          is_online: true,
        },
        {
          id: 2,
          first_name: "Carlos",
          last_name: "Santos",
          avatar: undefined,
          is_online: true,
        },
        {
          id: 3,
          first_name: "Maria",
          last_name: "Costa",
          avatar: undefined,
          is_online: true,
        },
      ];
      setOnlineUsers(mockOnlineUsers);
    } catch (error) {
      console.error("Erro ao carregar usuários online:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  if (!isVisible) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 hidden xl:block">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "chats"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Conversas
            </button>
            <button
              onClick={() => setActiveTab("online")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "online"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              Online
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "chats" && (
            <div className="p-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nenhuma conversa ainda</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => window.location.href = "/messenger"}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={
                              conv.avatar ||
                              `https://ui-avatars.com/api/?name=${conv.first_name}+${conv.last_name}&background=3B82F6&color=fff`
                            }
                            alt={`${conv.first_name} ${conv.last_name}`}
                            className="w-10 h-10 rounded-full"
                          />
                          {conv.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-medium">
                                {conv.unread_count > 9 ? "9+" : conv.unread_count}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conv.first_name} {conv.last_name}
                          </p>
                          {conv.last_message && (
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600 truncate max-w-[120px]">
                                {conv.last_message.content}
                              </p>
                              <span className="text-xs text-gray-400">
                                {formatTime(conv.last_message.created_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {/* Ver todas as conversas */}
                  <button
                    onClick={() => window.location.href = "/messenger"}
                    className="w-full p-3 text-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Ver todas as conversas
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "online" && (
            <div className="p-2">
              {onlineUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nenhum amigo online</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {onlineUsers.map((user) => (
                    <button
                      key={user.id}
                      className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={
                              user.avatar ||
                              `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=3B82F6&color=fff`
                            }
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-green-600">Online</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
