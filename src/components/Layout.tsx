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
import { EnhancedNotificationCenter } from "./notifications/EnhancedNotificationCenter";
import { FriendRequestsModal } from "./modals/FriendRequestsModal";
import { NotificationBadge } from "./ui/NotificationBadge";
import { InlineSearch } from "./search/InlineSearch";
import { useNotifications } from "../hooks/useNotifications";
import { notificationService } from "../services/NotificationService";
import { Logo } from "./ui/Logo";
import { useTheme } from "../contexts/ThemeContext";
import { API_BASE_URL } from "../config/api";
import { ChatSidebar } from "./chat/ChatSidebar";
import { FeedSidebar } from "./feed/FeedSidebar";
import { MockBanner } from "./ui/MockBanner";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInlineSearch, setShowInlineSearch] = useState(false);
  const [realtimeNotifications, setRealtimeNotifications] = useState<any[]>([]);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Enhanced notification system
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    isConnected: notificationConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: refetchNotifications
  } = useNotifications({
    userToken: user.token,
    userId: user.id || 0
  });

  useEffect(() => {
    // Track current path changes
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for navigation changes
    window.addEventListener('popstate', handleLocationChange);
    
    // Also listen for programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleLocationChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleLocationChange();
    };

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
        window.removeEventListener('popstate', handleLocationChange);
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
      };
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", checkIfMobile);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [user, showUserMenu]);

  // Determine if we should show sidebars
  const isOnFeedPage = currentPath === '/';
  const shouldShowSidebars = isOnFeedPage && !isMobile;
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

  const isMockMode = user.token?.startsWith('mock_token') || false;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 ${isMobile ? "pb-20" : ""}`}
    >
      {/* Mock Development Banner */}
      <MockBanner show={isMockMode} />
      {/* Desktop Header */}
      <header className={`bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky z-40 hidden md:block ${isMockMode ? 'top-10' : 'top-0'}`}>
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

            {/* Central Search */}
            <div className="flex-1 max-w-md mx-8 relative">
              <button
                onClick={() => setShowInlineSearch(!showInlineSearch)}
                className="w-full flex items-center space-x-3 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Search className="w-5 h-5" />
                <span>Buscar pessoas, páginas...</span>
              </button>

              <InlineSearch
                userToken={user.token}
                currentUserId={user.id || 0}
                isOpen={showInlineSearch}
                onClose={() => setShowInlineSearch(false)}
                onAdvancedSearch={() => {
                  setShowInlineSearch(false);
                  window.location.href = "/search";
                }}
                onUserSelect={(userId) => {
                  setShowInlineSearch(false);
                  window.location.href = `/profile/${userId}`;
                }}
              />
            </div>

            {/* Right side navigation */}
            <nav className="flex items-center space-x-6">
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

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <NotificationBadge
                count={unreadCount}
                onClick={() => setShowNotifications(true)}
                isActive={showNotifications}
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

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <a
                      href={generateProfileUrl()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Meu Perfil
                    </a>
                    <a
                      href="/friends"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Meus Amigos
                    </a>
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
        </div>
      </header>

      {/* Mobile Header */}
      <header className={`bg-white shadow-sm border-b sticky z-40 md:hidden ${isMockMode ? 'top-10' : 'top-0'}`}>
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

      {/* Main Content with Sidebars */}
      <div className="flex max-w-7xl mx-auto">
        {/* Feed Sidebar - Left */}
        <FeedSidebar user={user} isVisible={shouldShowSidebars} />

        <main
          className={`flex-1 px-4 sm:px-6 lg:px-8 py-8 ${isMobile ? "pb-24" : "pb-8"}`}
        >
          {children}
        </main>

        {/* Chat Sidebar - Right */}
        <ChatSidebar user={user} isVisible={shouldShowSidebars && showChatSidebar} />
      </div>

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

      {showNotifications && (
        <EnhancedNotificationCenter
          userToken={user.token}
          currentUserId={user.id || 0}
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onNotificationClick={(notification) => {
            console.log("Notification clicked:", notification);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
};
