import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Heart, 
  MessageSquare, 
  Calendar,
  FileText,
  UserPlus,
  Settings,
  Bookmark,
  Globe
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
  avatar?: string;
}

interface FeedSidebarProps {
  user: User;
  isVisible: boolean;
}

interface SuggestedFriend {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  mutual_friends?: number;
}

export const FeedSidebar: React.FC<FeedSidebarProps> = ({ user, isVisible }) => {
  const [suggestedFriends, setSuggestedFriends] = useState<SuggestedFriend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadSuggestedFriends();
    }
  }, [isVisible, user.token]);

  const loadSuggestedFriends = async () => {
    try {
      setLoading(true);
      // Simulated data for now - replace with real API call
      const mockSuggestions: SuggestedFriend[] = [
        {
          id: 1,
          first_name: "Ana",
          last_name: "Silva",
          avatar: undefined,
          mutual_friends: 3,
        },
        {
          id: 2,
          first_name: "Carlos",
          last_name: "Santos",
          avatar: undefined,
          mutual_friends: 5,
        },
        {
          id: 3,
          first_name: "Maria",
          last_name: "Costa",
          avatar: undefined,
          mutual_friends: 2,
        },
      ];
      setSuggestedFriends(mockSuggestions);
    } catch (error) {
      console.error("Erro ao carregar sugestões:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-64 hidden lg:block transition-all duration-300 ease-in-out">
      <div className="space-y-4">
        {/* Menu Principal */}
        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu</h3>
          <div className="space-y-2">
            <button
              onClick={() => window.location.href = '/friends'}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Amigos</p>
                <p className="text-xs text-gray-500">Ver todos os amigos</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Criar Comunidade</p>
                <p className="text-xs text-gray-500">Conecte pessoas</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Páginas</p>
                <p className="text-xs text-gray-500">Gerencie suas páginas</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Eventos</p>
                <p className="text-xs text-gray-500">Descobrir eventos</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Salvos</p>
                <p className="text-xs text-gray-500">Itens salvos</p>
              </div>
            </button>
          </div>
        </div>

        {/* Sugestão de Amizades */}
        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sugestão de amizades</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm transition-colors duration-200">Ver todas</button>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : suggestedFriends.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <UserPlus className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma sugestão</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedFriends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
                  <img
                    src={
                      friend.avatar ||
                      `https://ui-avatars.com/api/?name=${friend.first_name}+${friend.last_name}&background=3B82F6&color=fff`
                    }
                    alt={`${friend.first_name} ${friend.last_name}`}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {friend.first_name} {friend.last_name}
                    </p>
                    {friend.mutual_friends && (
                      <p className="text-xs text-gray-500">
                        {friend.mutual_friends} amigos em comum
                      </p>
                    )}
                  </div>
                  <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Criar Página */}
        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Criar</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Criar Página</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">Anunciar</span>
            </button>
          </div>
        </div>

        {/* Atalhos */}
        <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seus atalhos</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-700">Curtidas</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-700">Mensagens antigas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
