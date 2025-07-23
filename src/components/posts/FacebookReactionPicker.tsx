import React, { useState } from "react";
import { faithfulReactionIcons } from "./FaithfulReactionIcons";

interface Reaction {
  type: string;
  label: string;
  color: string;
}

const reactions: Reaction[] = [
  { type: "like", label: "Curtir", color: "#4F46E5" },
  { type: "love", label: "Amei", color: "#E91E63" },
  { type: "haha", label: "Haha", color: "#FF9800" },
  { type: "wow", label: "Uau", color: "#FF9800" },
  { type: "sad", label: "Triste", color: "#2196F3" },
  { type: "angry", label: "Grr", color: "#D32F2F" },
];

interface FacebookReactionPickerProps {
  onReactionSelect: (reaction: string) => void;
  position?: "top" | "bottom";
  className?: string;
}

export function FacebookReactionPicker({
  onReactionSelect,
  position = "top",
  className = "",
}: FacebookReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  const positionClasses =
    position === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div
      className={`absolute ${positionClasses} left-1/2 transform -translate-x-1/2 z-50 ${className}`}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-50 p-4 flex space-x-3 backdrop-blur-sm bg-white/98">
        {reactions.map((reaction) => {
          const IconComponent =
            faithfulReactionIcons[
              reaction.type as keyof typeof faithfulReactionIcons
            ];
          return (
            <button
              key={reaction.type}
              onClick={() => onReactionSelect(reaction.type)}
              onMouseEnter={() => setHoveredReaction(reaction.type)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={`relative flex flex-col items-center p-3 rounded-2xl transition-all duration-500 hover:bg-gray-50 ${
                hoveredReaction === reaction.type
                  ? "transform scale-150 -translate-y-3 shadow-2xl"
                  : ""
              }`}
              title={reaction.label}
              style={{
                color:
                  hoveredReaction === reaction.type ? reaction.color : "#666",
              }}
            >
              <IconComponent
                className={`w-10 h-10 transition-all duration-500 ${
                  hoveredReaction === reaction.type
                    ? "transform scale-110 filter drop-shadow-lg"
                    : ""
                }`}
                animate={hoveredReaction === reaction.type}
              />

              {/* Tooltip */}
              {hoveredReaction === reaction.type && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
                  <div
                    className="px-4 py-2 text-sm text-white rounded-xl shadow-xl whitespace-nowrap font-semibold backdrop-blur-sm"
                    style={{
                      backgroundColor: reaction.color,
                      boxShadow: `0 8px 25px -5px ${reaction.color}40, 0 8px 10px -6px ${reaction.color}40`,
                    }}
                  >
                    {reaction.label}
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                      style={{
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderTop: `6px solid ${reaction.color}`,
                      }}
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Arrow pointing to button */}
      <div
        className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 ${
          position === "top"
            ? "top-full border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"
            : "bottom-full border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white"
        }`}
      />
    </div>
  );
}
