import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Profile } from "../profile/Profile";
import { UserProfile } from "../UserProfile";

interface User {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
  cover_photo?: string;
  bio?: string;
  location?: string;
  joinDate?: string;
  username?: string;
  token: string;
}

interface ProfileRouteProps {
  currentUser: User;
  onUserDataRefresh?: () => void;
}

export function ProfileRoute({
  currentUser,
  onUserDataRefresh,
}: ProfileRouteProps) {
  const { username, userId } = useParams<{
    username: string;
    userId?: string;
  }>();
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchUserByUsername();
    } else {
      setLoading(false);
    }
  }, [username, userId]);

  const fetchUserByUsername = async () => {
    try {
      // Fetch user by username
      const response = await fetch(
        `http://localhost:8000/users/username/${username}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );

      if (response.ok) {
        const userData = await response.json();
        setTargetUser(userData);
      } else {
        setError("Profile not found");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Perfil não encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            O usuário que você está procurando não existe ou foi removido.
          </p>
          <a
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar ao Feed
          </a>
        </div>
      </div>
    );
  }

  // If it's the current user's profile, show their own profile
  if (targetUser && targetUser.id === currentUser.id) {
    return <Profile user={currentUser} onUserDataRefresh={onUserDataRefresh} />;
  }

  // If it's another user's profile, show the user profile modal/page
  if (targetUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <UserProfile
          userId={targetUser.id}
          userToken={currentUser.token}
          onClose={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Carregando perfil...
        </h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
