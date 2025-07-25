import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Users,
  User,
  Hash,
  ArrowRight,
  X,
  Clock,
  TrendingUp,
} from "lucide-react";

interface SearchResult {
  id: number;
  type: "user" | "page" | "hashtag";
  name: string;
  username?: string;
  avatar?: string;
  verified?: boolean;
  followers?: number;
  description?: string;
}

interface InlineSearchProps {
  userToken: string;
  currentUserId: number;
  isOpen: boolean;
  onClose: () => void;
  onAdvancedSearch: () => void;
  onUserSelect?: (userId: number) => void;
}

export function InlineSearch({
  userToken,
  currentUserId,
  isOpen,
  onClose,
  onAdvancedSearch,
  onUserSelect,
}: InlineSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [trendingSearches] = useState<string[]>([
    "João Silva",
    "Maria Santos",
    "Pedro Costa",
    "Ana Oliveira",
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem("recentSearches");
    if (recent) {
      try {
        setRecentSearches(JSON.parse(recent));
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);

  const searchUsers = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/users/?search=${encodeURIComponent(searchQuery)}&limit=8`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        const users = await response.json();
        const searchResults: SearchResult[] = users.map((user: any) => ({
          id: user.id,
          type: "user" as const,
          name: `${user.first_name} ${user.last_name}`,
          username: user.username,
          avatar: user.avatar,
          verified: user.is_verified,
          description: user.bio,
        }));

        setResults(searchResults);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    const updatedRecent = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

    if (result.type === "user" && onUserSelect) {
      onUserSelect(result.id);
    }

    onClose();
  };

  const handleTrendingClick = (trendingQuery: string) => {
    setQuery(trendingQuery);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4 text-gray-400" />;
      case "page":
        return <Users className="w-4 h-4 text-gray-400" />;
      case "hashtag":
        return <Hash className="w-4 h-4 text-gray-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50">
      <div ref={searchRef} className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar pessoas, páginas..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Content */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim() ? (
            /* Search Results */
            <>
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm">Procurando...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      {result.avatar ? (
                        <img
                          src={
                            result.avatar.startsWith("http")
                              ? result.avatar
                              : `http://localhost:8000${result.avatar}`
                          }
                          alt={result.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 truncate">
                            {result.name}
                          </p>
                          {result.verified && (
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        {result.username && (
                          <p className="text-sm text-gray-500">@{result.username}</p>
                        )}
                        {result.description && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {result.description}
                          </p>
                        )}
                        {result.type === "user" && result.followers !== undefined && (
                          <p className="text-xs text-gray-400">
                            {result.followers} seguidores
                          </p>
                        )}
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">Nenhum resultado encontrado</p>
                </div>
              )}
            </>
          ) : (
            /* Default Content: Recent and Trending */
            <div className="py-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">Buscas recentes</h3>
                    <button
                      onClick={clearRecent}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Limpar
                    </button>
                  </div>
                  {recentSearches.map((recent) => (
                    <button
                      key={`recent-${recent.id}`}
                      onClick={() => handleResultClick(recent)}
                      className="w-full flex items-center space-x-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 truncate">{recent.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              <div className="px-4 py-2">
                <div className="flex items-center space-x-1 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">Tendências</h3>
                </div>
                {trendingSearches.map((trending, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(trending)}
                    className="w-full flex items-center space-x-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{trending}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={onAdvancedSearch}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Busca avançada</span>
          </button>
        </div>
      </div>
    </div>
  );
}
