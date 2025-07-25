import React, { useState } from "react";
import { FacebookReactionPicker } from "./FacebookReactionPicker";
import { faithfulReactionIcons } from "./FaithfulReactionIcons";

interface FacebookReactionButtonProps {
  currentReaction?: string;
  reactionsCount: number;
  onReactionChange: (reaction: string) => void;
  onReactionRemove: () => void;
}

const reactionConfig: {
  [key: string]: { color: string; label: string };
} = {
  like: { color: "#4F46E5", label: "Curtir" },
  love: { color: "#E91E63", label: "Amei" },
  haha: { color: "#FF9800", label: "Haha" },
  wow: { color: "#FF9800", label: "Uau" },
  sad: { color: "#2196F3", label: "Triste" },
  angry: { color: "#D32F2F", label: "Grr" },
};

export function FacebookReactionButton({
  currentReaction,
  reactionsCount,
  onReactionChange,
  onReactionRemove,
}: FacebookReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleReactionSelect = (reaction: string) => {
    if (currentReaction === reaction) {
      onReactionRemove();
    } else {
      onReactionChange(reaction);
    }
    setShowPicker(false);
  };

  const handleButtonClick = () => {
    if (currentReaction) {
      onReactionRemove();
    } else {
      onReactionChange("like");
    }
  };

  const getCurrentReactionConfig = () => {
    if (currentReaction && reactionConfig[currentReaction]) {
      return reactionConfig[currentReaction];
    }
    return { color: "#65676b", label: "Curtir" };
  };

  const reactionConfig_current = getCurrentReactionConfig();
  const CurrentIconComponent = currentReaction
    ? faithfulReactionIcons[
        currentReaction as keyof typeof faithfulReactionIcons
      ]
    : faithfulReactionIcons.like;

  return (
    <div className="relative">
      <button
        onClick={handleButtonClick}
        onMouseEnter={() => {
          setIsHovering(true);
          setTimeout(() => setShowPicker(true), 500); // Show picker after 500ms hover
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          setTimeout(() => {
            if (!isHovering) setShowPicker(false);
          }, 200);
        }}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-md ${
          currentReaction ? "text-current shadow-sm" : "text-gray-600"
        }`}
        style={{
          color: currentReaction ? reactionConfig_current.color : undefined,
        }}
      >
        <CurrentIconComponent
          className={`w-6 h-6 transition-all duration-300 ${
            currentReaction ? "transform scale-110 filter drop-shadow-sm" : ""
          }`}
          animate={showPicker}
        />
        <span className="font-medium text-sm">
          {currentReaction ? reactionConfig_current.label : "Curtir"}
        </span>
        {reactionsCount > 0 && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            {reactionsCount}
          </span>
        )}
      </button>

      {/* Reaction Picker */}
      {showPicker && (
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setTimeout(() => setShowPicker(false), 200);
          }}
        >
          <FacebookReactionPicker
            onReactionSelect={handleReactionSelect}
            position="top"
          />
        </div>
      )}
    </div>
  );
}
