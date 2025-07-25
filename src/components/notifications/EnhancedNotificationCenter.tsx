import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Users,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck,
  Clock,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";

interface NotificationSender {
  id: number;
  first_name: string;
  last_name: string;
  username?: string;
  avatar?: string;
}

interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  is_clicked: boolean;
  created_at: string;
  read_at?: string;
  sender?: NotificationSender;
  data?: any;
}

interface EnhancedNotificationCenterProps {
  userToken: string;
  currentUserId: number;
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: NotificationData) => void;
}

export function EnhancedNotificationCenter({
  userToken,
  currentUserId,
  isOpen,
  onClose,
  onNotificationClick,
}: EnhancedNotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "friend_requests">("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, filter]);

  // Real-time notification listener
  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "notification") {
          const newNotification = data.data;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if supported
          if (Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: newNotification.sender?.avatar || "/default-avatar.png",
              tag: `notification-${newNotification.id}`,
            });
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    // Add event listener for WebSocket messages
    window.addEventListener("message", handleWebSocketMessage);
    
    return () => {
      window.removeEventListener("message", handleWebSocketMessage);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8000/notifications/";
      const params = new URLSearchParams();
      
      if (filter === "unread") {
        params.append("unread_only", "true");
      } else if (filter === "friend_requests") {
        params.append("notification_type", "friend_request");
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("http://localhost:8000/notifications/count", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error("Erro ao carregar contagem:", error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const markAsClicked = async (notificationId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/notifications/${notificationId}/click`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, is_read: true, is_clicked: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("Erro ao marcar como clicada:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/notifications/mark-all-read",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.filter(notif => notif.id !== notificationId)
        );
      }
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    }
  };

  const handleNotificationClick = async (notification: NotificationData) => {
    if (!notification.is_clicked) {
      await markAsClicked(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    // Handle navigation based on notification type
    const { data } = notification;
    if (data?.action_url) {
      window.location.href = data.action_url;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
      case "friend_request_accepted":
        return <UserPlus className="w-5 h-5 text-blue-600" />;
      case "new_follower":
        return <Users className="w-5 h-5 text-green-600" />;
      case "post_reaction":
        return <Heart className="w-5 h-5 text-red-600" />;
      case "post_comment":
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case "post_share":
        return <Share2 className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.is_read;
    if (filter === "friend_requests") return notification.type === "friend_request";
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex space-x-1 mt-3 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === "unread"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Não lidas
            </button>
            <button
              onClick={() => setFilter("friend_requests")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === "friend_requests"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Amizades
            </button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="flex justify-end mt-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Marcar todas como lidas</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "Você não tem notificações não lidas"
                  : filter === "friend_requests"
                  ? "Nenhuma solicitação de amizade"
                  : "Você está em dia com suas notificações"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar or Icon */}
                    <div className="flex-shrink-0">
                      {notification.sender?.avatar ? (
                        <img
                          src={
                            notification.sender.avatar.startsWith("http")
                              ? notification.sender.avatar
                              : `http://localhost:8000${notification.sender.avatar}`
                          }
                          alt={`${notification.sender.first_name} ${notification.sender.last_name}`}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTime(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Marcar como lida"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Deletar notificação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => window.location.href = "/notifications"}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas as notificações
          </button>
        </div>
      </div>
    </div>
  );
}
