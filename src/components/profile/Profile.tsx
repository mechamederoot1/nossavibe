import React from "react";
import { useNavigate } from "react-router-dom";
import { ModernProfile } from "./ModernProfile";

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
}

export const Profile: React.FC<ProfileProps> = ({ user, onUserDataRefresh }) => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleSendMessage = (userId: number) => {
    navigate(`/messenger?user=${userId}`);
  };

  return (
    <ModernProfile
      userId={user.id || 0}
      userToken={user.token}
      currentUserId={user.id || 0}
      onEditProfile={handleEditProfile}
      onSendMessage={handleSendMessage}
    />
  );
};
