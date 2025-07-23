import React, { useState, useEffect } from "react";
import {
  Home,
  User,
  MessageCircle,
  Search,
  Settings,
  LogOut,
  Plus,
  Bell,
  UserPlus,
  Moon,
  Sun,
} from "lucide-react";
import { MessagesModal } from "./modals/MessagesModal";
import { ResponsiveCreateStoryModal } from "./modals/ResponsiveCreateStoryModal";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { FriendRequestsModal } from "./modals/FriendRequestsModal";
import { notificationService } from "../services/NotificationService";
import { Logo } from "./ui/Logo";
import { useTheme } from "../contexts/ThemeContext";
import { API_BASE_URL } from "../config/api";

interface LayoutProps {
  children: React.ReactNode;
  user: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    token: string;
  };
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showMessages, setShowMessages] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [realtimeNotifications, setRealtimeNotifications] = useState<any[]>([]);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    fetchFriendRequestsCount();
    if (user?.id) {
      const handleNewNotification = (newNotification: any) => {
        setRealtimeNotifications((prev) => [newNotification, ...prev]);

        // Update friend requests count if it's a friend request
        if (newNotification.type === "friend_request") {
          setFriendRequestsCount((prev) => prev + 1);
        }
      };

      const removeListener = notificationService.addListener(
        handleNewNotification,
      );
      notificationService.connect(user.id, user.token);

      // Check connection status periodically
      const connectionCheck = setInterval(() => {
        setIsConnected(notificationService.isConnected());
      }, 1000);

      return () => {
        removeListener();
        notificationService.disconnect();
        clearInterval(connectionCheck);
        document.removeEventListener("click", handleClickOutside);
        window.removeEventListener("resize", checkIfMobile);
      };
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [user, showUserMenu]);

  const generateProfileUrl = () => {
    if ((user as any).display_id && (user as any).username) {
      const displayId = (user as any).display_id;
      const username = (user as any).username;
      return `/@${username}/id/${displayId}`;
    }
    return "/profile";
  };

  const fetchFriendRequestsCount = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/friendships/pending",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setFriendRequestsCount(data.length);
      }
    } catch (error) {
      console.error("Erro ao buscar solicitações de amizade:", error);
    }
  };

  const clearRealtimeNotifications = () => {
    setRealtimeNotifications([]);
  };

  const handleCreateStory = async (
    content: string,
    mediaData?: any,
    storyDuration?: number,
    backgroundColor?: string,
    privacy?: string,
    overlays?: any[],
  ) => {
    try {
      // Import the proper story creation helper
      const { createStoryWithFile } = await import('./stories/StoryUploadHelper');

      // Extract the actual file from mediaData if present
      const mediaFile = mediaData?.file || null;

      const success = await createStoryWithFile(
        content,
        mediaFile,
        storyDuration || 24,
        backgroundColor || "#3B82F6",
        privacy || "public",
        user.token,
      );

      if (success) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao criar story:", error);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 ${isMobile ? "pb-20" : ""}`}
    >
      {/* Desktop Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <a href="/" className="hover:opacity-80 transition-opacity">
                  <Logo size="md" showText={true} />
                </a>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8">
              <a
                href="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Início</span>
              </a>
              <a
                href={generateProfileUrl()}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Perfil</span>
              </a>
              <button
                onClick={() => setShowMessages(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Mensagens</span>
              </button>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isDarkMode ? "Modo claro" : "Modo escuro"}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Story Button */}
              <button
                onClick={() => setShowCreateStory(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Story</span>
              </button>

              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                  title={isConnected ? "Conectado" : "Desconectado"}
                />
                <span className="text-xs text-gray-500">
                  {isConnected ? "Online" : "Offline"}
                </span>
              </div>

              {/* Notifications */}
              <NotificationCenter
                userToken={user.token}
                realtimeNotifications={realtimeNotifications}
                onClearRealtimeNotifications={clearRealtimeNotifications}
              />

              {/* Friend Requests */}
              <div className="relative">
                <button
                  onClick={() => setShowFriendRequests(true)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <UserPlus className="w-6 h-6" />
                  {friendRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {friendRequestsCount > 99 ? "99+" : friendRequestsCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Search */}
              <a
                href="/search?filter=people"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Procurar pessoas"
              >
                <Search className="w-6 h-6" />
              </a>

              {/* Settings */}
              <a
                href="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Settings className="w-6 h-6" />
              </a>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40 md:hidden">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-2">
              <Logo size="sm" showText={true} />
            </a>

            {/* Search */}
            <a
              href="/search"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isMobile ? "pb-24" : "pb-8"}`}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="flex items-center justify-around py-2">
          {/* Notifications */}
          <NotificationCenter
            userToken={user.token}
            realtimeNotifications={realtimeNotifications}
            onClearRealtimeNotifications={clearRealtimeNotifications}
          />

          {/* Home */}
          <a
            href="/"
            className="p-3 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Home className="w-6 h-6" />
          </a>

          {/* Add Story */}
          <button
            onClick={() => setShowCreateStory(true)}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Messages */}
          <button
            onClick={() => setShowMessages(true)}
            className="p-3 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
              className="p-1"
            >
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff`
                }
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <a
                  href={generateProfileUrl()}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Perfil
                </a>
                <button
                  onClick={() => {
                    setShowFriendRequests(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  Solicitações de amizade
                  {friendRequestsCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {friendRequestsCount}
                    </span>
                  )}
                </button>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Configurações
                </a>
                <hr className="my-1" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MessagesModal
        isOpen={showMessages}
        onClose={() => setShowMessages(false)}
        user={user}
      />

      <ResponsiveCreateStoryModal
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onSubmit={handleCreateStory}
        onSuccess={() => {
          setShowCreateStory(false);
          window.location.reload(); // Refresh to show new story
        }}
        userToken={user.token}
      />

      <FriendRequestsModal
        isOpen={showFriendRequests}
        onClose={() => setShowFriendRequests(false)}
        userToken={user.token}
        onRequestHandled={fetchFriendRequestsCount}
      />
    </div>
  );
};
