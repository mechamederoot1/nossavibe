import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowLeft,
  Filter,
  MapPin,
  Calendar,
  Users,
  Hash,
  Image,
  Video,
  FileText,
  Clock,
  TrendingUp,
  X,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserSearch } from "../components/social/UserSearch";

interface SearchPageProps {
  userToken: string;
  currentUserId?: number;
}

export function SearchPage({ userToken, currentUserId = 0 }: SearchPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("filter") || "all";
  });
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filters = [
    { id: "all", label: "Tudo", icon: Search },
    { id: "people", label: "Pessoas", icon: Users },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "hashtags", label: "Hashtags", icon: Hash },
    { id: "photos", label: "Fotos", icon: Image },
    { id: "videos", label: "Vídeos", icon: Video },
  ];

  // Advanced filters
  const [dateRange, setDateRange] = useState("all");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // Mock trending topics
    setTrendingTopics([
      "#NovoAno",
      "#TechNews",
      "#ViralBrasil",
      "#Memes2025",
      "#TravelBrasil",
      "#Futebol",
      "#Música",
      "#Arte",
    ]);

    // Focus search input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      10,
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const removeRecentSearch = (query: string) => {
    const updated = recentSearches.filter((s) => s !== query);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setLoading(true);
    saveRecentSearch(searchTerm);

    try {
      // Build search URL with filters
      const params = new URLSearchParams({
        q: searchTerm,
        type: activeFilter,
        date_range: dateRange,
        location: location,
        sort: sortBy,
      });

      const response = await fetch(`http://localhost:8000/search?${params}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error("Erro na pesquisa:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSearchResults = () => {
    // Show UserSearch component when people filter is active
    if (activeFilter === "people") {
      return <UserSearch userToken={userToken} currentUserId={currentUserId} />;
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (results.length === 0 && searchQuery) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-600">Tente ajustar sua pesquisa ou filtros</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            {result.type === "user" && (
              <div className="flex items-center space-x-4">
                <img
                  src={
                    result.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name)}&background=3B82F6&color=fff`
                  }
                  alt={result.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{result.name}</h3>
                  <p className="text-gray-600">@{result.username}</p>
                  {result.bio && (
                    <p className="text-sm text-gray-500 mt-1">{result.bio}</p>
                  )}
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Seguir
                </button>
              </div>
            )}

            {result.type === "post" && (
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={
                      result.author?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(result.author?.name || "User")}&background=3B82F6&color=fff`
                    }
                    alt={result.author?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {result.author?.name}
                    </h4>
                    <p className="text-sm text-gray-500">{result.created_at}</p>
                  </div>
                </div>
                <p className="text-gray-900 mb-3">{result.content}</p>
                {result.media_url && (
                  <img
                    src={result.media_url}
                    alt="Post media"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            )}

            {result.type === "hashtag" && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Hash className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {result.tag}
                  </h3>
                </div>
                <p className="text-gray-600">{result.post_count} posts</p>
                <p className="text-sm text-gray-500 mt-2">
                  {result.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="space-y-8">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Pesquisas Recentes
          </h3>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch(search);
                  }}
                  className="flex-1 text-left"
                >
                  <span className="text-gray-900">{search}</span>
                </button>
                <button
                  onClick={() => removeRecentSearch(search)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Topics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Trending
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trendingTopics.map((topic, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(topic);
                handleSearch(topic);
              }}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Explorar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveFilter("people")}
            className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all text-left"
          >
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">
              Encontrar Pessoas
            </h4>
            <p className="text-sm text-gray-600">
              Descubra novos amigos e conexões
            </p>
          </button>
          <button
            onClick={() => setActiveFilter("hashtags")}
            className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all text-left"
          >
            <Hash className="w-8 h-8 text-green-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">
              Hashtags Populares
            </h4>
            <p className="text-sm text-gray-600">Explore tópicos em alta</p>
          </button>
          <button
            onClick={() => setActiveFilter("photos")}
            className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all text-left"
          >
            <Image className="w-8 h-8 text-purple-600 mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Fotos e Mídia</h4>
            <p className="text-sm text-gray-600">
              Navegue pelo conteúdo visual
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 h-16">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Pesquisar pessoas, posts, hashtags..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-colors ${
                showFilters
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 pb-4 overflow-x-auto">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                    activeFilter === filter.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pb-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Período
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Qualquer período</option>
                    <option value="today">Hoje</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mês</option>
                    <option value="year">Este ano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Localização
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Cidade, estado..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ChevronDown className="w-4 h-4 inline mr-1" />
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="recent">Mais recente</option>
                    <option value="popular">Mais popular</option>
                    <option value="alphabetical">Alfabética</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeFilter === "people" ? (
          <UserSearch userToken={userToken} currentUserId={currentUserId} />
        ) : searchQuery || results.length > 0 ? (
          renderSearchResults()
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
}
