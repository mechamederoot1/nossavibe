import React, { useEffect, useState, useRef } from "react";
import { CustomReactionEmoji } from "./CustomReactionEmojis";

interface ReactionPickerProps {
  isVisible: boolean;
  currentReaction?: string;
  onReaction: (type: string) => void;
  onClose: () => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  isVisible,
  currentReaction,
  onReaction,
  onClose,
}) => {
  const [animatedReactions, setAnimatedReactions] = useState<string[]>([]);

  // Reações que aparecem ao segurar o like
  const reactions = [
    {
      type: "like",
      label: "Curtir",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      animation: "animate-thumbs-up",
    },
    {
      type: "amei",
      label: "Amei",
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600",
      animation: "animate-heart-beat",
    },
    {
      type: "uau",
      label: "Uau",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      animation: "animate-wow-bounce",
    },
    {
      type: "triste",
      label: "Triste",
      color: "bg-blue-400",
      hoverColor: "hover:bg-blue-500",
      animation: "animate-sad-drop",
    },
    {
      type: "grr",
      label: "Grr",
      color: "bg-red-600",
      hoverColor: "hover:bg-red-700",
      animation: "animate-angry-shake",
    },
    {
      type: "nojinho",
      label: "Nojinho",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      animation: "animate-disgust-wiggle",
    },
    {
      type: "apaixonado",
      label: "Apaixonado",
      color: "bg-pink-500",
      hoverColor: "hover:bg-pink-600",
      animation: "animate-love-float",
    },
  ];

  useEffect(() => {
    if (isVisible) {
      setAnimatedReactions([]);
      // Animate reactions appearing one by one
      reactions.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedReactions((prev) => [...prev, reactions[index].type]);
        }, index * 80);
      });
    } else {
      setAnimatedReactions([]);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000); // Auto close after 6 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <style jsx>{`
        @keyframes heart-beat {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
        }

        @keyframes thumbs-up {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(-10deg);
          }
        }

        @keyframes wow-bounce {
          0%,
          100% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.4) translateY(-10px);
          }
        }

        @keyframes sad-drop {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(8px) scale(0.9);
          }
        }

        @keyframes angry-shake {
          0%,
          100% {
            transform: translateX(0) scale(1);
          }
          25% {
            transform: translateX(-4px) scale(1.1);
          }
          75% {
            transform: translateX(4px) scale(1.1);
          }
        }

        @keyframes disgust-wiggle {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-15deg) scale(1.1);
          }
          75% {
            transform: rotate(15deg) scale(1.1);
          }
        }

        @keyframes love-float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-12px) scale(1.2);
          }
        }

        .animate-heart-beat {
          animation: heart-beat 1s ease-in-out infinite;
        }

        .animate-thumbs-up {
          animation: thumbs-up 0.8s ease-in-out infinite;
        }

        .animate-wow-bounce {
          animation: wow-bounce 1s ease-in-out infinite;
        }

        .animate-sad-drop {
          animation: sad-drop 1.2s ease-in-out infinite;
        }

        .animate-angry-shake {
          animation: angry-shake 0.4s ease-in-out infinite;
        }

        .animate-disgust-wiggle {
          animation: disgust-wiggle 0.6s ease-in-out infinite;
        }

        .animate-love-float {
          animation: love-float 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-2xl border border-gray-200 px-4 py-3 flex space-x-2 z-50 backdrop-blur-sm">
        {reactions.map((reaction, index) => (
          <button
            key={reaction.type}
            onClick={() => onReaction(reaction.type)}
            className={`relative transition-all duration-300 hover:scale-125 rounded-full p-2 group ${
              animatedReactions.includes(reaction.type)
                ? "opacity-100 transform scale-100"
                : "opacity-0 transform scale-50"
            } ${
              currentReaction === reaction.type
                ? `${reaction.color} shadow-lg`
                : "hover:bg-gray-100"
            }`}
            style={{
              transitionDelay: `${index * 80}ms`,
            }}
          >
            <div
              className={`transition-transform duration-300 ${
                animatedReactions.includes(reaction.type)
                  ? reaction.animation
                  : ""
              }`}
            >
              <CustomReactionEmoji type={reaction.type} size={28} />
            </div>

            {/* Tooltip com o nome da reação */}
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {reaction.label}
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default ReactionPicker;
