import React, { useState, useEffect } from "react";
import { CreatePostModal } from "./CreatePostModal";
import { MobileCreatePostModal } from "./MobileCreatePostModal";

interface ResponsiveCreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    type: "post" | "testimonial",
    privacy: string,
    mediaData?: any,
  ) => void;
  userToken: string;
}

export function ResponsiveCreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  userToken,
}: ResponsiveCreatePostModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;

      // Check if it's a mobile device
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent,
        );
      const isSmallScreen = width <= 768;
      const isTouchDevice = "ontouchstart" in window;

      // Use mobile version for small screens or actual mobile devices
      setIsMobile(
        isMobileDevice || isSmallScreen || (isTouchDevice && width <= 1024),
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

  if (isMobile) {
    return (
      <MobileCreatePostModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        userToken={userToken}
      />
    );
  }

  return (
    <CreatePostModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      userToken={userToken}
    />
  );
}
