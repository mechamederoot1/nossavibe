import { useState, useEffect, useRef } from 'react';

interface OnlineStatus {
  [userId: number]: boolean;
}

export function useOnlineStatus(userToken: string, userId: number) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineStatus>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userToken || !userId) return;

    // Connect to WebSocket for real-time status updates
    const connectWebSocket = () => {
      const wsUrl = `ws://localhost:8000/ws/${userId}?token=${userToken}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for online status');
        // Send initial online status
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: "user_status",
            status: "online"
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "user_status") {
            setOnlineUsers(prev => ({
              ...prev,
              [data.user_id]: data.status === "online"
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        // Send offline status before disconnecting
        wsRef.current.send(JSON.stringify({
          type: "user_status",
          status: "offline"
        }));
        wsRef.current.close();
      }
    };
  }, [userToken, userId]);

  // Send heartbeat every 30 seconds to maintain connection
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const isUserOnline = (targetUserId: number): boolean => {
    return onlineUsers[targetUserId] || false;
  };

  const setUserOnlineStatus = (targetUserId: number, isOnline: boolean) => {
    setOnlineUsers(prev => ({
      ...prev,
      [targetUserId]: isOnline
    }));
  };

  return {
    isUserOnline,
    onlineUsers,
    setUserOnlineStatus
  };
}
