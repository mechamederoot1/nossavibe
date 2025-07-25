import React, { useState, useEffect } from "react";
import { ModernCreateStoryModal } from "./ModernCreateStoryModal";
import { MobileCreateStoryModal } from "./MobileCreateStoryModal";
import { MobileStoryCreator } from "./MobileStoryCreator";
import { EnhancedMobileStoryCreator } from "./EnhancedMobileStoryCreator";

interface ResponsiveCreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    mediaData?: any,
    storyDuration?: number,
    backgroundColor?: string,
    privacy?: string,
    overlays?: any[],
  ) => void;
  onSuccess?: () => void;
  userToken: string;
}

export function ResponsiveCreateStoryModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  userToken,
}: ResponsiveCreateStoryModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;

      // Check if it's a mobile device
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent,
        );
      const isSmallScreen = width <= 768;
      const isTouchDevice = "ontouchstart" in window;

      // Consider it mobile if:
      // 1. User agent indicates mobile device
      // 2. Screen width is small (mobile/tablet)
      // 3. Touch device with small screen
      setIsMobile(
        isMobileDevice || (isSmallScreen && isTouchDevice) || width <= 640,
      );
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  // Force mobile experience for very small screens
  const forceMinimalMobile = window.innerWidth <= 480;

  const handleMobileStorySubmit = (storyData: any) => {
    onSubmit(
      storyData.content,
      {
        textStyle: storyData.textStyle,
        mentions: storyData.mentions,
        hashtags: storyData.hashtags,
        position: storyData.position,
      },
      24,
      storyData.backgroundColor,
    );
  };

  if (isMobile || forceMinimalMobile) {
    return (
      <EnhancedMobileStoryCreator
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={() => {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        }}
        userToken={userToken}
      />
    );
  }

  return (
    <ModernCreateStoryModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
