import React, { createContext, useContext, useState } from "react";
import { ProfilePreview } from "../components/profile/ProfilePreview";

interface ProfilePreviewContextType {
  showProfilePreview: (userId: number, position: { x: number; y: number }) => void;
  hideProfilePreview: () => void;
  isVisible: boolean;
}

const ProfilePreviewContext = createContext<ProfilePreviewContextType | undefined>(undefined);

interface ProfilePreviewProviderProps {
  children: React.ReactNode;
  userToken: string;
  currentUserId: number;
}

export function ProfilePreviewProvider({ children, userToken, currentUserId }: ProfilePreviewProviderProps) {
  const [previewState, setPreviewState] = useState({
    isVisible: false,
    userId: 0,
    position: { x: 0, y: 0 },
  });

  const showProfilePreview = (userId: number, position: { x: number; y: number }) => {
    setPreviewState({
      isVisible: true,
      userId,
      position,
    });
  };

  const hideProfilePreview = () => {
    setPreviewState(prev => ({ ...prev, isVisible: false }));
  };

  const handleViewFullProfile = (userId: number) => {
    hideProfilePreview();
    window.location.href = `/profile/${userId}`;
  };

  return (
    <ProfilePreviewContext.Provider value={{ showProfilePreview, hideProfilePreview, isVisible: previewState.isVisible }}>
      {children}
      
      {previewState.isVisible && (
        <ProfilePreview
          userId={previewState.userId}
          userToken={userToken}
          currentUserId={currentUserId}
          isOpen={previewState.isVisible}
          onClose={hideProfilePreview}
          onViewFullProfile={handleViewFullProfile}
          position={previewState.position}
        />
      )}
    </ProfilePreviewContext.Provider>
  );
}

export function useProfilePreview() {
  const context = useContext(ProfilePreviewContext);
  if (!context) {
    throw new Error("useProfilePreview must be used within a ProfilePreviewProvider");
  }
  return context;
}
