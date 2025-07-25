import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Users,
  Hash,
  TrendingUp,
  Clock,
  X,
  UserPlus,
  MessageCircle,
} from "lucide-react";

interface SearchPageProps {
  isOpen: boolean;
  onClose: () => void;
  userToken: string;
}

interface SearchResult {
  id: number;
  type: "user" | "post" | "hashtag";
  title: string;
  subtitle?: string;
  avatar?: string;
  verified?: boolean;
  followers_count?: number;
  posts_count?: number;
}

interface TrendingItem {
  id: number;
  hashtag: string;
  posts_count: number;
  category: string;
}

export function SearchPage({ isOpen, onClose, userToken }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "users" | "posts" | "hashtags"
  >("all");

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadTrending();
      loadRecentSearches();
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const delayedSearch = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(delayedSearch);
    } else {
      setResults([]);
    }
  }, [query, activeTab]);

  const loadTrending = async () => {
    try {
      const response = await fetch("http://localhost:8000/search/trending", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrending(data);
      }
    } catch (error) {
      console.error("Error loading trending:", error);
    }
  };

  const loadRecentSearches = () => {
    const recent = localStorage.getItem("recentSearches");
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  };

  const saveToRecentSearches = (searchQuery: string) => {
    const updated = [
      searchQuery,
      ...recentSearches.filter((q) => q !== searchQuery),
    ].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const removeRecentSearch = (searchQuery: string) => {
    const updated = recentSearches.filter((q) => q !== searchQuery);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/search?q=${encodeURIComponent(query)}&type=${activeTab}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        saveToRecentSearches(query);
      }
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "user") {
      // Navigate to user profile
      window.location.href = `/@${result.title}`;
    } else if (result.type === "hashtag") {
      // Search for hashtag
      setQuery(`#${result.title}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pessoas, posts, hashtags..."
            className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Search Filters */}
      {query && (
        <div className="px-4 py-2 border-b border-gray-200 bg-white">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { key: "all", label: "Tudo", icon: Search },
              { key: "users", label: "Pessoas", icon: Users },
              { key: "posts", label: "Posts", icon: Hash },
              { key: "hashtags", label: "Hashtags", icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Results */}
        {query && (
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    {result.type === "user" && (
                      <>
                        <img
                          src={
                            result.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(result.title)}&background=3B82F6&color=fff`
                          }
                          alt={result.title}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {result.title}
                            {result.verified && (
                              <span className="ml-1 text-blue-500">✓</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            @{result.subtitle} • {result.followers_count}{" "}
                            seguidores
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                            <UserPlus className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <MessageCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}

                    {result.type === "hashtag" && (
                      <>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Hash className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900">
                            #{result.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {result.posts_count} posts
                          </p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                      </>
                    )}

                    {result.type === "post" && (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Hash className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-600">
                  Tente buscar por outros termos ou verifique a ortografia
                </p>
              </div>
            )}
          </div>
        )}

        {/* Default Content (No Search) */}
        {!query && (
          <div className="p-4 space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Pesquisas Recentes
                  </h2>
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem("recentSearches");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Limpar tudo
                  </button>
                </div>

                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                      onClick={() => setQuery(search)}
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{search}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(search);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-all"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trending
              </h2>

              <div className="space-y-3">
                {trending.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setQuery(`#${item.hashtag}`)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        #{item.hashtag}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.posts_count} posts • {item.category}
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                ))}
              </div>

              {trending.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum trending disponível no momento</p>
                </div>
              )}
            </div>

            {/* Search Suggestions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sugestões de Busca
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "Desenvolvedores",
                  "Design",
                  "Tecnologia",
                  "Startup",
                  "React",
                  "JavaScript",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
