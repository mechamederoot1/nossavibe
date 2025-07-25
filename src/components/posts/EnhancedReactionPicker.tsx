import React, { useState } from "react";
import { CustomReactionEmoji } from "./CustomReactionEmojis";

interface EnhancedReactionPickerProps {
  isOpen: boolean;
  onReaction: (type: string) => void;
  onClose: () => void;
  position?: "top" | "bottom";
}

const reactions = [
  { type: "like", label: "Curtir", color: "text-blue-600" },
  { type: "love", label: "Amei", color: "text-red-500" },
  { type: "haha", label: "Haha", color: "text-yellow-500" },
  { type: "wow", label: "Uau", color: "text-yellow-600" },
  { type: "sad", label: "Triste", color: "text-blue-400" },
  { type: "angry", label: "Raiva", color: "text-red-600" },
  { type: "care", label: "Força", color: "text-yellow-400" },
  { type: "pride", label: "Orgulho", color: "text-purple-500" },
  { type: "grateful", label: "Gratidão", color: "text-green-500" },
  {
    type: "celebrating",
    label: "Celebrando",
    color: "text-pink-500",
  },
];

export function EnhancedReactionPicker({
  isOpen,
  onReaction,
  onClose,
  position = "top",
}: EnhancedReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  if (!isOpen) return null;

  const positionClasses =
    position === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Reaction Picker */}
      <div
        className={`absolute ${positionClasses} left-0 z-40 bg-white rounded-full shadow-xl border border-gray-200 p-2 flex items-center space-x-1 animate-scale-in`}
      >
        {reactions.map((reaction) => (
          <button
            key={reaction.type}
            onClick={() => onReaction(reaction.type)}
            onMouseEnter={() => setHoveredReaction(reaction.type)}
            onMouseLeave={() => setHoveredReaction(null)}
            className="relative group flex flex-col items-center p-2 rounded-full hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
          >
            <CustomReactionEmoji type={reaction.type} size={28} />

            {/* Tooltip */}
            {hoveredReaction === reaction.type && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {reaction.label}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-gray-800"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

// CSS for animation
const styles = `
@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
