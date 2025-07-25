import React, { useState } from "react";
import { FriendsManager } from "../components/social/FriendsManager";
import { UserDiscovery } from "../components/discovery/UserDiscovery";
import { UserSearch } from "../components/social/UserSearch";
import { UserProfileModal } from "../components/modals/UserProfileModal";
import { Users, Search, Compass, MessageCircle } from "lucide-react";

interface FriendsPageProps {
  user: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    token: string;
  };
}

export function FriendsPage({ user }: FriendsPageProps) {
  const [activeTab, setActiveTab] = useState<"friends" | "discover" | "search">("friends");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Amigos</h1>
          <p className="text-gray-600">
            Gerencie seus amigos, descubra novos usuários e conecte-se com pessoas
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "friends"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Meus Amigos</span>
            </button>
            
            <button
              onClick={() => setActiveTab("discover")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "discover"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Descobrir</span>
            </button>
            
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "search"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {activeTab === "friends" && (
              <FriendsManager
                userToken={user.token}
                currentUserId={user.id || 0}
                onUserSelect={handleUserSelect}
              />
            )}
            
            {activeTab === "discover" && (
              <UserDiscovery
                userToken={user.token}
                onUserSelect={handleUserSelect}
              />
            )}
            
            {activeTab === "search" && (
              <UserSearch
                userToken={user.token}
                currentUserId={user.id || 0}
                onClose={() => {}}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Estatísticas
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Amigos</span>
                    <span className="font-semibold text-gray-900">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Seguidores</span>
                    <span className="font-semibold text-gray-900">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Seguindo</span>
                    <span className="font-semibold text-gray-900">-</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab("search")}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar pessoas</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("discover")}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Descobrir usuários</span>
                  </button>
                  
                  <button className="w-full flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>Mensagens</span>
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  💡 Dicas
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Use filtros na busca para encontrar pessoas específicas</li>
                  <li>• Veja sugestões baseadas em amigos em comum</li>
                  <li>• Mantenha seu perfil atualizado para ser encontrado</li>
                  <li>• Seja respeitoso ao interagir com outros usuários</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          userToken={user.token}
          currentUserId={user.id || 0}
          isOpen={true}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
