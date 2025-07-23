import React from "react";

// Componente de emoji customizado para reações
export const CustomReactionEmoji: React.FC<{
  type: string;
  size?: number;
  className?: string;
}> = ({ type, size = 20, className = "" }) => {
  const emojiMap: { [key: string]: string } = {
    like: "👍",
    love: "❤️",
    haha: "😂", 
    wow: "😮",
    sad: "😢",
    angry: "😡",
    care: "🤗",
    pride: "🏳️‍🌈",
    grateful: "🙏",
    celebrating: "🎉"
  };

  const emoji = emojiMap[type] || "👍";

  return (
    <span 
      className={`${className} inline-flex items-center justify-center`}
      style={{ fontSize: size }}
    >
      {emoji}
    </span>
  );
};

// Configuração das reações
export const reactionConfig = {
  like: { emoji: "👍", color: "#4F46E5", label: "Curtir" },
  love: { emoji: "❤️", color: "#EF4444", label: "Amei" },
  haha: { emoji: "😂", color: "#F59E0B", label: "Haha" },
  wow: { emoji: "😮", color: "#10B981", label: "Uau" },
  sad: { emoji: "😢", color: "#6B7280", label: "Triste" },
  angry: { emoji: "😡", color: "#EF4444", label: "Grr" },
  care: { emoji: "🤗", color: "#F59E0B", label: "Amei" },
  pride: { emoji: "🏳️‍🌈", color: "#8B5CF6", label: "Orgulho" },
  grateful: { emoji: "🙏", color: "#10B981", label: "Gratidão" },
  celebrating: { emoji: "🎉", color: "#F59E0B", label: "Festa" }
};

export const getReactionEmoji = (type: string): string => {
  return reactionConfig[type as keyof typeof reactionConfig]?.emoji || "👍";
};

export const getReactionColor = (type: string): string => {
  return reactionConfig[type as keyof typeof reactionConfig]?.color || "#4F46E5";
};

export const getReactionLabel = (type: string): string => {
  return reactionConfig[type as keyof typeof reactionConfig]?.label || "Curtir";
};
