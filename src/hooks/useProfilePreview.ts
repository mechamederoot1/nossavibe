import { useState, useCallback, useRef, useEffect } from "react";

interface ProfilePreviewState {
  isOpen: boolean;
  userId: number | null;
  position: { x: number; y: number };
}

export function useProfilePreview() {
  const [previewState, setPreviewState] = useState<ProfilePreviewState>({
    isOpen: false,
    userId: null,
    position: { x: 0, y: 0 },
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  const showPreview = useCallback((userId: number, event: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const position = {
      x: rect.right + 10, // Position to the right of the trigger element
      y: rect.top,
    };

    // If preview would go off screen, position to the left instead
    if (position.x + 320 > window.innerWidth) {
      position.x = rect.left - 330;
    }

    // If preview would go off bottom of screen, adjust vertically
    if (position.y + 400 > window.innerHeight) {
      position.y = window.innerHeight - 400 - 20;
    }

    timeoutRef.current = setTimeout(() => {
      setPreviewState({
        isOpen: true,
        userId,
        position,
      });
    }, 500); // Show preview after 500ms hover
  }, []);

  const hidePreview = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setPreviewState(prev => ({ ...prev, isOpen: false }));
      }
    }, 200); // Hide after 200ms delay
  }, []);

  const closePreview = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setPreviewState({
      isOpen: false,
      userId: null,
      position: { x: 0, y: 0 },
    });
  }, []);

  const handlePreviewMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handlePreviewMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    hidePreview();
  }, [hidePreview]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    previewState,
    showPreview,
    hidePreview,
    closePreview,
    handlePreviewMouseEnter,
    handlePreviewMouseLeave,
  };
}

// Hook specifically for user elements that should trigger profile preview
export function useUserProfilePreview(userId: number) {
  const { showPreview, hidePreview } = useProfilePreview();

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    showPreview(userId, event);
  }, [userId, showPreview]);

  const handleMouseLeave = useCallback(() => {
    hidePreview();
  }, [hidePreview]);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
}
