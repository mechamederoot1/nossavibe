import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { UniversalProfile } from "../components/profile/UniversalProfile";

interface PublicProfilePageProps {
  userToken: string;
  currentUserId: number;
}

export function PublicProfilePage({
  userToken,
  currentUserId,
}: PublicProfilePageProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const handleSendMessage = (targetUserId: number) => {
    // Navegar para a página de mensagens com o usuário específico
    navigate(`/messenger?user=${targetUserId}`);
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuário não encontrado</h2>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Feed</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">Perfil</h1>
            
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <UniversalProfile
        userId={parseInt(userId)}
        userToken={userToken}
        currentUserId={currentUserId}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
