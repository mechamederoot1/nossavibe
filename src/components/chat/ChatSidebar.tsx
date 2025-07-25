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

interface RecentActivity {
  id: number;
  type: "reaction" | "profile_update" | "post_pin" | "user_joined";
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  target_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<"recent" | "online">("recent");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadOnlineUsers();
      loadRecentActivities();
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

  const loadRecentActivities = async () => {
    try {
      // Simulated activities for now - replace with real API call
      const mockActivities: RecentActivity[] = [
        {
          id: 1,
          type: "reaction",
          user: {
            id: 1,
            first_name: "Ana",
            last_name: "Silva",
            avatar: undefined,
          },
          target_user: {
            id: 2,
            first_name: "Carlos",
            last_name: "Santos",
          },
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: "profile_update",
          user: {
            id: 3,
            first_name: "Maria",
            last_name: "Costa",
            avatar: undefined,
          },
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: "user_joined",
          user: {
            id: 4,
            first_name: "João",
            last_name: "Oliveira",
            avatar: undefined,
          },
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: 4,
          type: "post_pin",
          user: {
            id: 5,
            first_name: "Lucia",
            last_name: "Ferreira",
            avatar: undefined,
          },
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
      ];
      setRecentActivities(mockActivities);
    } catch (error) {
      console.error("Erro ao carregar atividades recentes:", error);
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

  const getActivityText = (activity: RecentActivity) => {
    const userName = `${activity.user.first_name} ${activity.user.last_name}`;

    switch (activity.type) {
      case "reaction":
        const targetName = activity.target_user
          ? `${activity.target_user.first_name} ${activity.target_user.last_name}`
          : "alguém";
        return `${userName} reagiu ao post de ${targetName}`;
      case "profile_update":
        return `${userName} atualizou a foto do perfil`;
      case "post_pin":
        return `${userName} fixou uma publicação no perfil`;
      case "user_joined":
        return `${userName} acabou de entrar`;
      default:
        return `${userName} fez uma atividade`;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-64 bg-white border-l border-gray-200 hidden xl:block transition-all duration-300 ease-in-out">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("recent")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "recent"
                  ? "bg-white text-gray-900 shadow-sm scale-105"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Recentes
            </button>
            <button
              onClick={() => setActiveTab("online")}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "online"
                  ? "bg-white text-gray-900 shadow-sm scale-105"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Online
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {activeTab === "recent" && (
            <div>
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nenhuma atividade recente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm"
                    >
                      <img
                        src={
                          activity.user.avatar ||
                          `https://ui-avatars.com/api/?name=${activity.user.first_name}+${activity.user.last_name}&background=3B82F6&color=fff`
                        }
                        alt={`${activity.user.first_name} ${activity.user.last_name}`}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {getActivityText(activity)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "online" && (
            <div>
              {onlineUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Nenhum amigo online</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {onlineUsers.map((onlineUser) => (
                    <div
                      key={onlineUser.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm"
                    >
                      <div className="relative">
                        <img
                          src={
                            onlineUser.avatar ||
                            `https://ui-avatars.com/api/?name=${onlineUser.first_name}+${onlineUser.last_name}&background=3B82F6&color=fff`
                          }
                          alt={`${onlineUser.first_name} ${onlineUser.last_name}`}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {onlineUser.first_name} {onlineUser.last_name}
                        </p>
                        <p className="text-xs text-green-600 font-medium">● Online</p>
                      </div>
                    </div>
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
