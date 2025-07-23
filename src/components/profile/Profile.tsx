import React, { useState, useEffect } from "react";
import { MessageCircle, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PostCard } from "../posts/PostCard";
import { EnhancedProfileHeader } from "./EnhancedProfileHeader";

// Global function type declaration
declare global {
  interface Window {
    refreshProfilePosts?: () => void;
  }
}

interface ProfileProps {
  user: {
    id?: number;
    name: string;
    email: string;
    bio?: string;
    location?: string;
    joinDate?: string;
    avatar?: string;
    cover_photo?: string;
    username?: string;
    token: string;
  };
  onUserDataRefresh?: () => void;
  onPostsRefresh?: () => void; // Callback to refresh posts from parent
}

interface Post {
  id: number;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  content: string;
  post_type: "post" | "testimonial";
  created_at: string;
  reactions_count: number;
  comments_count: number;
  shares_count: number;
}

interface UserStats {
  friends_count: number;
  posts_count: number;
}

export function Profile({
  user: initialUser,
  onUserDataRefresh,
  onPostsRefresh,
}: ProfileProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posts" | "testimonials">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [testimonials, setTestimonials] = useState<Post[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    friends_count: 0,
    posts_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(initialUser);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchUserPosts();
    fetchUserTestimonials();
    fetchUserStats();
  }, []);

  // Add effect to refresh posts when requested from parent
  useEffect(() => {
    // Always set up the refresh function when on profile page
    window.refreshProfilePosts = async () => {
      console.log("🔄 Refreshing profile posts from external call...");
      console.log("📍 Current user ID:", user.id);

      try {
        await fetchUserPosts();
        await fetchUserTestimonials();
        await fetchUserStats();
        console.log("✅ Profile posts refreshed successfully");
      } catch (error) {
        console.error("❌ Error refreshing profile posts:", error);
      }
    };

    return () => {
      // Cleanup
      if (window.refreshProfilePosts) {
        delete window.refreshProfilePosts;
      }
    };
  }, [user.id]); // Depend on user.id to re-setup when user changes

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${user.id}/posts`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.filter((post: Post) => post.post_type === "post"));
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  };

  const fetchUserTestimonials = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${user.id}/testimonials`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setTestimonials(
          data.filter((post: Post) => post.post_type === "testimonial"),
        );
      }
    } catch (error) {
      console.error("Erro ao carregar depoimentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch user profile to get stats
      const response = await fetch(
        `http://localhost:8000/users/${user.id}/profile`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const profileData = await response.json();
        setUserStats({
          friends_count: profileData.friends_count || 0,
          posts_count: profileData.posts_count || 0,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas do usuário:", error);
    }
  };

  const handlePostDeleted = () => {
    fetchUserPosts();
    fetchUserTestimonials();
    fetchUserStats();
  };

  const handleProfileUpdate = async () => {
    // Refresh user data after profile update
    console.log("🔄 Refreshing profile data...");

    try {
      // Fetch updated user data
      const response = await fetch("http://localhost:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("✅ Fresh user data received:", userData);

        // Update local user state with ALL fresh data
        const updatedUser = {
          ...user,
          name: `${userData.first_name} ${userData.last_name}`,
          bio: userData.bio,
          location: userData.location,
          avatar: userData.avatar,
          cover_photo: userData.cover_photo, // This is the key field for cover photo
          username: userData.username,
          nickname: userData.nickname,
          email: userData.email,
          phone: userData.phone,
          website: userData.website,
          birth_date: userData.birth_date,
          gender: userData.gender,
          relationship_status: userData.relationship_status,
          work: userData.work,
          education: userData.education,
        };

        console.log("📝 Setting updated user state:", updatedUser);
        setUser(updatedUser);

        // Also refresh the app-level user data
        if (onUserDataRefresh) {
          console.log("🔄 Calling parent refresh callback...");
          await onUserDataRefresh();
        }

        console.log("✅ Profile data refreshed successfully");
      } else {
        console.error("❌ Failed to fetch updated user data:", response.status);
      }
    } catch (error) {
      console.error("❌ Error refreshing profile data:", error);
    }

    // Also refresh stats
    await fetchUserStats();

    // Force re-render with updated key
    setRefreshKey((prev) => {
      console.log("🔄 Forcing re-render, new key:", prev + 1);
      return prev + 1;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Modern Profile Header */}
      <EnhancedProfileHeader
        key={`profile-header-${refreshKey}`}
        user={user}
        isOwnProfile={true}
        userToken={user.token}
        onEditProfile={() => navigate("/edit-profile")}
        onProfileUpdate={handleProfileUpdate}
        currentUserId={user.id}
      />

      {/* Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "posts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "testimonials"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Depoimentos ({testimonials.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === "posts" && (
                <>
                  {posts.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum post ainda
                      </h3>
                      <p className="text-gray-500">
                        Compartilhe algo interessante com seus amigos!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          userToken={user.token}
                          currentUserId={user.id}
                          onPostDeleted={handlePostDeleted}
                          showAuthor={false}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "testimonials" && (
                <>
                  {testimonials.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum depoimento ainda
                      </h3>
                      <p className="text-gray-500">
                        Depoimentos aparecerão aqui quando criados.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="relative">
                          {/* Badge do depoimento */}
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                              💜 Depoimento
                            </span>
                          </div>

                          {/* PostCard com estilo especial para depoimento */}
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-10"></div>
                            <div className="relative border-l-4 border-purple-500">
                              <PostCard
                                post={testimonial}
                                userToken={user.token}
                                currentUserId={user.id}
                                onPostDeleted={handlePostDeleted}
                                showAuthor={false}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
