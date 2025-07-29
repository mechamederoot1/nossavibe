import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// Importar interceptor de mock para desenvolvimento
import './services/MockInterceptor';
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { SimpleAuth } from "./components/auth/SimpleAuth";
import { MultiStepAuth } from "./components/auth/MultiStepAuth";
import { SessionManager } from "./components/auth/SessionManager";
import { WelcomeModal } from "./components/onboarding/WelcomeModal";
import { Feed } from "./components/Feed";
import { Profile } from "./components/profile/Profile";
import { ProfileRoute } from "./components/routing/ProfileRoute";
import { SimpleSettingsPage } from "./pages/SimpleSettingsPage";
import { SearchPage } from "./pages/SearchPage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { FriendsPage } from "./pages/FriendsPage";
import { UserInfoPage } from "./pages/UserInfoPage";
import { PostPage } from "./pages/PostPage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { MessengerPage } from "./pages/MessengerPage";
import { TermsOfService } from "./pages/TermsOfService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { notificationService } from "./services/NotificationService";
import { useSession } from "./hooks/useSession";



function App() {
  const { user, loading, sessionExpired, login, logout, refreshUserData, completeOnboarding } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(false);

  // Verificar se deve mostrar onboarding baseado no backend
  useEffect(() => {
    if (user && user.id) {
      // Verificar se já mostrou onboarding para este usuário
      const onboardingKey = `onboarding_shown_${user.id}`;
      const onboardingShown = localStorage.getItem(onboardingKey);

      // Mostrar apenas se:
      // 1. Backend indica que não completou onboarding OU
      // 2. Nunca mostrou onboarding para este usuário (localStorage)
      const shouldShowOnboarding = !user.onboarding_completed && !onboardingShown;
      setShowOnboarding(shouldShowOnboarding);

      // Limpar localStorage antigo se existir
      const oldKey = `onboarding_completed_${user.id}`;
      if (localStorage.getItem(oldKey)) {
        localStorage.removeItem(oldKey);
      }
    }
  }, [user]);

  // Verificar se a sessão expirou
  useEffect(() => {
    if (sessionExpired) {
      setSessionExpiredMessage(true);
      // Limpar mensagem após 5 segundos
      setTimeout(() => setSessionExpiredMessage(false), 5000);
    }
  }, [sessionExpired]);

  useEffect(() => {
    if (user?.id) {
      notificationService.connect(user.id, user.token);

      return () => {
        notificationService.disconnect();
      };
    }
  }, [user]);

  // Completar onboarding via backend
  const handleCompleteOnboarding = async () => {
    if (completeOnboarding && user?.id) {
      const success = await completeOnboarding();
      if (success) {
        // Marcar como mostrado no localStorage
        const onboardingKey = `onboarding_shown_${user.id}`;
        localStorage.setItem(onboardingKey, 'true');
        setShowOnboarding(false);
      }
    }
  };

  const handleLogin = (userData: {
    name: string;
    email: string;
    token: string;
    id: number;
  }) => {
    login(userData);
  };

  const handleLogout = (expired = false) => {
    notificationService.disconnect();
    logout(expired);
  };

  const handleRefreshUserData = async () => {
    if (refreshUserData) {
      await refreshUserData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Router>
          <div className="relative">
            {/* Mensagem de sessão expirada */}
            {sessionExpiredMessage && (
              <div className="fixed top-4 left-4 bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Sessão Expirada</p>
                    <p className="text-sm">Sua sessão expirou por inatividade. Faça login novamente para continuar.</p>
                  </div>
                </div>
              </div>
            )}

            <Routes>
              <Route path="/" element={<SimpleAuth onLogin={handleLogin} />} />
              <Route
                path="/cadastro"
                element={<MultiStepAuth onLogin={handleLogin} />}
              />
              <Route path="/termos-de-uso" element={<TermsOfService />} />
              <Route
                path="/politica-de-privacidade"
                element={<PrivacyPolicy />}
              />
              <Route
                path="/verify-email"
                element={<EmailVerificationPage />}
              />
              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />
              <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        {/* Gerenciador de sessão */}
        <SessionManager user={user} onLogout={handleLogout} />

        <Layout user={user} onLogout={handleLogout}>
          {/* Modal de boas-vindas para novos usuários */}
          {showOnboarding && (
            <WelcomeModal user={user} onComplete={handleCompleteOnboarding} />
          )}
          <Routes>
            <Route path="/" element={<Feed user={user} />} />
            <Route path="/messenger" element={<MessengerPage user={user} />} />
            <Route
              path="/profile"
              element={
                <Profile user={user} onUserDataRefresh={handleRefreshUserData} />
              }
            />
            <Route
              path="/settings"
              element={
                <SimpleSettingsPage
                  user={user}
                  onLogout={handleLogout}
                  onUserUpdate={handleRefreshUserData}
                />
              }
            />
            <Route
              path="/search"
              element={
                <SearchPage
                  userToken={user.token}
                  currentUserId={user.id || 0}
                />
              }
            />
            <Route
              path="/edit-profile"
              element={
                <EditProfilePage user={user} onUserUpdate={handleRefreshUserData} />
              }
            />
            <Route path="/friends" element={<FriendsPage user={user} />} />
            <Route
              path="/user-info/:userId?"
              element={
                <UserInfoPage
                  userToken={user.token}
                  currentUserId={user.id || 0}
                />
              }
            />
            <Route
              path="/post/:postId"
              element={
                <PostPage userToken={user.token} currentUserId={user.id || 0} />
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <PublicProfilePage
                  userToken={user.token}
                  currentUserId={user.id || 0}
                />
              }
            />
            <Route
              path="/@:username/id/:userId"
              element={
                <ProfileRoute
                  currentUser={user}
                  onUserDataRefresh={handleRefreshUserData}
                />
              }
            />
            <Route
              path="/@:username"
              element={
                <ProfileRoute
                  currentUser={user}
                  onUserDataRefresh={handleRefreshUserData}
                />
              }
            />
            <Route path="/termos-de-uso" element={<TermsOfService />} />
            <Route
              path="/politica-de-privacidade"
              element={<PrivacyPolicy />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
