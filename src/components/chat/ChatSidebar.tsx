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
    <div className="w-64 bg-white border-l border-gray-200 hidden xl:block">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Online agora</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
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
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={
                        onlineUser.avatar ||
                        `https://ui-avatars.com/api/?name=${onlineUser.first_name}+${onlineUser.last_name}&background=3B82F6&color=fff`
                      }
                      alt={`${onlineUser.first_name} ${onlineUser.last_name}`}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {onlineUser.first_name} {onlineUser.last_name}
                    </p>
                    <p className="text-xs text-green-600">Online</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
