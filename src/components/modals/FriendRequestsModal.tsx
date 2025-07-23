import React, { useState, useEffect } from 'react';
import { X, Check, UserX } from 'lucide-react';

interface FriendRequest {
  id: number;
  requester: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
    bio?: string;
  };
  created_at: string;
}

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToken: string;
  onRequestHandled: () => void;
}

export const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({
  isOpen,
  onClose,
  userToken,
  onRequestHandled
}) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFriendRequests();
    }
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [isOpen]);

  const fetchFriendRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/friendships/pending', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/friendships/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        onRequestHandled();
      }
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/friendships/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        onRequestHandled();
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isMobile ? '' : 'p-4'}`}>
      <div className={`bg-white ${isMobile ? 'w-full h-full' : 'rounded-xl max-w-md w-full max-h-96'} overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Solicitações de Amizade</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Requests List */}
        <div className={`${isMobile ? 'h-full' : 'max-h-80'} overflow-y-auto`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <UserX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma solicitação pendente</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      request.requester.avatar ||
                      `https://ui-avatars.com/api/?name=${request.requester.first_name} ${request.requester.last_name}&background=3B82F6&color=fff`
                    }
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {request.requester.first_name} {request.requester.last_name}
                    </p>
                    {request.requester.bio && (
                      <p className="text-xs text-gray-500 truncate">
                        {request.requester.bio}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatTimeAgo(request.created_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      title="Aceitar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="p-2 bg-gray-300 text-gray-600 rounded-full hover:bg-gray-400 transition-colors"
                      title="Rejeitar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};