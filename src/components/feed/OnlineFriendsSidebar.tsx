import React, { useState, useEffect } from 'react';
import { MessageCircle, Circle, Search } from 'lucide-react';

interface Friend {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  is_online: boolean;
  last_seen?: string;
}

interface OnlineFriendsSidebarProps {
  userToken: string;
  onStartChat: (friendId: number) => void;
}

export function OnlineFriendsSidebar({ userToken, onStartChat }: OnlineFriendsSidebarProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOnlineFriends();
    // Refresh online status every 30 seconds
    const interval = setInterval(fetchOnlineFriends, 30000);
    return () => clearInterval(interval);
  }, [userToken]);

  const fetchOnlineFriends = async () => {
    try {
      const response = await fetch("http://localhost:8000/friendships/", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter and map friends data
        const friendsList = data
          .filter((friendship: any) => friendship.status === "accepted")
          .map((friendship: any) => {
            const friend = friendship.requester.id !== parseInt(userToken.split('.')[1]) 
              ? friendship.requester 
              : friendship.addressee;
            
            return {
              id: friend.id,
              first_name: friend.first_name,
              last_name: friend.last_name,
              avatar: friend.avatar,
              is_online: Math.random() > 0.3, // Mock online status for now
              last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString()
            };
          });

        setFriends(friendsList);
      }
    } catch (error) {
      console.error("Erro ao carregar amigos online:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Online agora";
    if (diffInMinutes < 60) return `Visto ${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `Visto ${Math.floor(diffInMinutes / 60)}h atrás`;
    return `Visto ${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const filteredFriends = friends.filter(friend =>
    `${friend.first_name} ${friend.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter(friend => friend.is_online);
  const offlineFriends = filteredFriends.filter(friend => !friend.is_online);

  if (loading) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Amigos</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar amigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        {/* Online Friends */}
        {onlineFriends.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Circle className="w-2 h-2 text-green-500 fill-current mr-2" />
              Online ({onlineFriends.length})
            </h3>
            <div className="space-y-2">
              {onlineFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                  onClick={() => onStartChat(friend.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={
                          friend.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.first_name + " " + friend.last_name)}&background=3B82F6&color=fff`
                        }
                        alt={`${friend.first_name} ${friend.last_name}`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {friend.first_name} {friend.last_name}
                      </p>
                      <p className="text-xs text-green-600">Online</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartChat(friend.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline Friends */}
        {offlineFriends.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Circle className="w-2 h-2 text-gray-400 fill-current mr-2" />
              Offline ({offlineFriends.length})
            </h3>
            <div className="space-y-2">
              {offlineFriends.slice(0, 10).map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                  onClick={() => onStartChat(friend.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={
                          friend.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.first_name + " " + friend.last_name)}&background=3B82F6&color=fff`
                        }
                        alt={`${friend.first_name} ${friend.last_name}`}
                        className="w-10 h-10 rounded-full opacity-75"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {friend.first_name} {friend.last_name}
                      </p>
                      {friend.last_seen && (
                        <p className="text-xs text-gray-500">
                          {formatLastSeen(friend.last_seen)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartChat(friend.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Friends */}
        {filteredFriends.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum amigo encontrado</p>
            {searchTerm && (
              <p className="text-sm mt-1">Tente uma busca diferente</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
