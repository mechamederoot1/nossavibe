import { useState, useEffect, useCallback } from "react";

interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
    username?: string;
    avatar?: string;
  };
  data?: any;
}

interface UseNotificationsProps {
  userToken: string;
  userId: number;
}

export function useNotifications({ userToken, userId }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket connection for real-time notifications
  const connectWebSocket = useCallback(() => {
    if (!userId || !userToken) return;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/${userId}?token=${encodeURIComponent(userToken)}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected for notifications");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "notification") {
          const newNotification = data.data;
          
          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev]);
          
          // Update unread count
          if (!newNotification.is_read) {
            setUnreadCount(prev => prev + 1);
          }
          
          // Show browser notification if permission granted
          if (Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: newNotification.sender?.avatar || "/default-avatar.png",
              tag: `notification-${newNotification.id}`,
            });
          }
          
          // Dispatch custom event for other components
          window.dispatchEvent(new CustomEvent("newNotification", {
            detail: newNotification
          }));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (userId && userToken) {
          connectWebSocket();
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return ws;
  }, [userId, userToken]);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);

  // Request browser notification permission
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async (options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (options?.unreadOnly) params.append("unread_only", "true");
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("skip", options.offset.toString());

      const response = await fetch(
        `http://localhost:8000/notifications/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
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
      console.error("Error fetching unread count:", error);
    }
  }, [userToken]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
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
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
    return false;
  }, [userToken]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
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
        return true;
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
    return false;
  }, [userToken]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
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
        return true;
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
    return false;
  }, [userToken]);

  // Initial data fetch
  useEffect(() => {
    if (userToken && userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userToken, userId, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    isConnected,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: () => {
      fetchNotifications();
      fetchUnreadCount();
    }
  };
}
