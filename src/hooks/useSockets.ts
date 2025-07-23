import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  userId?: number;
  token: string;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  sender: {
    name: string;
  };
  data?: any;
  created_at: string;
}

export const useSocket = ({ userId, token }: UseSocketProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Create socket connection
    const socket = io('http://localhost:8000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Authenticate with the server
      socket.emit('authenticate', { user_id: userId, token });
    });

    socket.on('authenticated', (data) => {
      console.log('Authentication status:', data);
    });

    socket.on('notification', (notification: Notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, token]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    isConnected,
    clearNotifications,
  };
};