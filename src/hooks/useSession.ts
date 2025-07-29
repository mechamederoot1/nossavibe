import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCall } from '../config/api';
import { mockAuthService } from '../services/MockAuthService';

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
  onboarding_completed?: boolean;
  token: string;
}

interface SessionState {
  user: User | null;
  loading: boolean;
  lastActivity: number;
  sessionExpired: boolean;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minuto
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutos antes de expirar

export const useSession = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    user: null,
    loading: true,
    lastActivity: Date.now(),
    sessionExpired: false
  });

  const activityTimer = useRef<NodeJS.Timeout | null>(null);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  // Atualizar última atividade
  const updateActivity = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      lastActivity: Date.now(),
      sessionExpired: false
    }));
  }, []);

  // Verificar se a sessão expirou
  const checkSessionExpiry = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - sessionState.lastActivity;
    
    if (timeSinceActivity > SESSION_TIMEOUT && sessionState.user) {
      setSessionState(prev => ({
        ...prev,
        sessionExpired: true,
        user: null
      }));
      localStorage.removeItem('token');
      return true;
    }
    return false;
  }, [sessionState.lastActivity, sessionState.user]);

  // Buscar dados do usuário com cache
  const fetchUserData = useCallback(async (token: string, useCache = true) => {
    const cacheKey = `user_data_${token.slice(-8)}`;
    const cacheExpiry = 5 * 60 * 1000; // 5 minutos

    // Verificar cache primeiro
    if (useCache) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheExpiry) {
          setSessionState(prev => ({
            ...prev,
            user: { ...data, token },
            loading: false
          }));
          return data;
        }
      }
    }

    try {
      // Se for token mock, usar dados mock
      if (token.startsWith('mock_token')) {
        console.log("🎭 Using mock user data");
        const mockUser = mockAuthService.getMockUser();
        const userWithDefaults = {
          id: mockUser.id,
          display_id: mockUser.id.toString(),
          name: mockUser.name,
          email: mockUser.email,
          avatar: mockUser.avatar,
          cover_photo: mockUser.cover_photo,
          bio: mockUser.bio,
          location: mockUser.location,
          joinDate: "Janeiro 2025",
          username: mockUser.username,
          nickname: mockUser.first_name,
          phone: "11999999999",
          website: mockUser.website,
          birth_date: "1990-01-01",
          gender: "Não informado",
          relationship_status: "Solteiro",
          work: mockUser.work,
          education: mockUser.education,
          onboarding_completed: true, // Mock sempre completo
          token,
        };

        setSessionState(prev => ({
          ...prev,
          user: userWithDefaults,
          loading: false
        }));

        return userWithDefaults;
      }

      const response = await apiCall('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const userWithDefaults = {
          id: userData.id,
          display_id: userData.display_id,
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
          avatar: userData.avatar,
          cover_photo: userData.cover_photo,
          bio: userData.bio || "Apaixonado por conexões genuínas e boas vibes! 🌟",
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
          onboarding_completed: userData.onboarding_completed || false,
          token,
        };

        // Cache dos dados
        localStorage.setItem(cacheKey, JSON.stringify({
          data: userWithDefaults,
          timestamp: Date.now()
        }));

        setSessionState(prev => ({
          ...prev,
          user: userWithDefaults,
          loading: false
        }));

        return userWithDefaults;
      } else {
        localStorage.removeItem('token');
        setSessionState(prev => ({
          ...prev,
          user: null,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      localStorage.removeItem('token');
      setSessionState(prev => ({
        ...prev,
        user: null,
        loading: false
      }));
    }
  }, []);

  // Login do usuário
  const login = useCallback((userData: {
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
      onboarding_completed: false, // Apenas para novos usuários
    };
    
    setSessionState(prev => ({
      ...prev,
      user: userWithDefaults,
      lastActivity: Date.now(),
      sessionExpired: false
    }));
    
    localStorage.setItem('token', userData.token);
    updateActivity();
  }, [updateActivity]);

  // Logout do usuário
  const logout = useCallback((expired = false) => {
    localStorage.removeItem('token');
    // Limpar caches relacionados
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user_data_')) {
        localStorage.removeItem(key);
      }
    });
    
    setSessionState({
      user: null,
      loading: false,
      lastActivity: Date.now(),
      sessionExpired: expired
    });

    if (activityTimer.current) {
      clearInterval(activityTimer.current);
    }
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
  }, []);

  // Inicialização da sessão
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    } else {
      setSessionState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchUserData]);

  // Monitorar atividade do usuário
  useEffect(() => {
    if (sessionState.user) {
      // Eventos de atividade
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      const handleActivity = () => updateActivity();
      
      events.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });

      // Timer para verificar expiração
      activityTimer.current = setInterval(() => {
        checkSessionExpiry();
      }, ACTIVITY_CHECK_INTERVAL);

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity, true);
        });
        
        if (activityTimer.current) {
          clearInterval(activityTimer.current);
        }
      };
    }
  }, [sessionState.user, updateActivity, checkSessionExpiry]);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    if (!sessionState.user?.token) return false;

    try {
      const response = await apiCall('/auth/complete-onboarding', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionState.user.token}`,
        },
      });

      if (response.ok) {
        // Atualizar estado local
        setSessionState(prev => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            onboarding_completed: true
          } : null
        }));

        // Limpar localStorage antigo se existir
        if (sessionState.user.id) {
          localStorage.removeItem(`onboarding_completed_${sessionState.user.id}`);
        }

        return true;
      }
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
    }

    return false;
  }, [sessionState.user]);

  return {
    user: sessionState.user,
    loading: sessionState.loading,
    sessionExpired: sessionState.sessionExpired,
    login,
    logout,
    refreshUserData: () => {
      if (sessionState.user?.token) {
        return fetchUserData(sessionState.user.token, false);
      }
    },
    updateActivity,
    completeOnboarding
  };
};
