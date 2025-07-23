import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { SimpleAuth } from "./components/auth/SimpleAuth";
import { MultiStepAuth } from "./components/auth/MultiStepAuth";
import { Feed } from "./components/Feed";
import { Profile } from "./components/profile/Profile"; // Atualizado
import { ProfileRoute } from "./components/routing/ProfileRoute";
import { SimpleSettingsPage } from "./pages/SimpleSettingsPage";
import { SearchPage } from "./pages/SearchPage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { UserInfoPage } from "./pages/UserInfoPage";
import { PostPage } from "./pages/PostPage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { TermsOfService } from "./pages/TermsOfService";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { notificationService } from "./services/NotificationService";
import { apiCall } from "./config/api";

interface User {
  id?: number;
  display_id?: string;
  name: string;
  email: string;
  avatar?: string;
  cover_photo?: string;
  bio?: string;
  location?: string;
  joinDate?: string;
  username?: string;
  nickname?: string;
  phone?: string;
  website?: string;
  birth_date?: string;
  gender?: string;
  relationship_status?: string;
  work?: string;
  education?: string;
  token: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      notificationService.connect(user.id, user.token);

      return () => {
        notificationService.disconnect();
      };
    }
  }, [user]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await apiCall("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.id,
          display_id: userData.display_id,
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
          avatar: userData.avatar,
          cover_photo: userData.cover_photo,
          bio:
            userData.bio || "Apaixonado por conexões genuínas e boas vibes! 🌟",
          location: userData.location || "São Paulo, Brasil",
          joinDate: "Janeiro 2025",
          username: userData.username,
          nickname: userData.nickname,
          phone: userData.phone,
          website: userData.website,
          birth_date: userData.birth_date,
          gender: userData.gender,
          relationship_status: userData.relationship_status,
          work: userData.work,
          education: userData.education,
          token,
        });
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: {
    name: string;
    email: string;
    token: string;
    id: number;
  }) => {
    const userWithDefaults = {
      ...userData,
      id: userData.id,
      bio: "Apaixonado por conexões genuínas e boas vibes! 🌟",
      location: "São Paulo, Brasil",
      joinDate: "Janeiro 2025",
    };
    setUser(userWithDefaults);
    localStorage.setItem("token", userData.token);
  };

  const handleLogout = () => {
    notificationService.disconnect();
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUserData = async () => {
    if (user?.token) {
      await fetchUserData(user.token);
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
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Feed user={user} />} />
            <Route
              path="/profile"
              element={
                <Profile user={user} onUserDataRefresh={refreshUserData} />
              }
            />
            <Route
              path="/settings"
              element={
                <SimpleSettingsPage
                  user={user}
                  onLogout={handleLogout}
                  onUserUpdate={refreshUserData}
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
                <EditProfilePage user={user} onUserUpdate={refreshUserData} />
              }
            />
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
                  onUserDataRefresh={refreshUserData}
                />
              }
            />
            <Route
              path="/@:username"
              element={
                <ProfileRoute
                  currentUser={user}
                  onUserDataRefresh={refreshUserData}
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
