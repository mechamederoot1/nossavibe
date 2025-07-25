import React, { useRef, useState } from "react";
import { useProfilePreview } from "../../contexts/ProfilePreviewContext";

interface UserHoverProps {
  userId: number;
  children: React.ReactNode;
  disabled?: boolean;
  delay?: number;
}

export function UserHover({ userId, children, disabled = false, delay = 800 }: UserHoverProps) {
  const { showProfilePreview, hideProfilePreview } = useProfilePreview();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    setIsHovering(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isHovering) {
        const rect = event.currentTarget.getBoundingClientRect();
        const position = {
          x: rect.right + 10,
          y: rect.top,
        };

        // Adjust position if preview would go off screen
        if (position.x + 320 > window.innerWidth) {
          position.x = rect.left - 330;
        }

        if (position.y + 400 > window.innerHeight) {
          position.y = window.innerHeight - 400 - 20;
        }

        showProfilePreview(userId, position);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setTimeout(() => {
      if (!isHovering) {
        hideProfilePreview();
      }
    }, 200);
  };

  const handleClick = (event: React.MouseEvent) => {
    // Allow normal click behavior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    hideProfilePreview();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="inline-block"
    >
      {children}
    </div>
  );
}
