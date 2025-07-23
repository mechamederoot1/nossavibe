import React, { useState, useEffect } from "react";
import { CustomReactionEmoji } from "./CustomReactionEmojis";

interface ReactionData {
  count: number;
  users: Array<{
    id: number;
    first_name: string;
    last_name: string;
    avatar: string;
    created_at: string;
  }>;
}

interface EnhancedReactionDisplayProps {
  postId: number;
  userToken: string;
  onReactionChange?: () => void;
}

// Removed reactionEmojis object - now using CustomReactionEmoji component

const reactionColors: { [key: string]: string } = {
  like: "text-blue-600",
  love: "text-red-500",
  haha: "text-yellow-500",
  wow: "text-yellow-600",
  sad: "text-blue-400",
  angry: "text-red-600",
  care: "text-yellow-400",
  pride: "text-purple-500",
  grateful: "text-green-500",
  celebrating: "text-pink-500",
};

export function EnhancedReactionDisplay({
  postId,
  userToken,
  onReactionChange,
}: EnhancedReactionDisplayProps) {
  const [reactions, setReactions] = useState<{ [key: string]: ReactionData }>(
    {},
  );
  const [totalReactions, setTotalReactions] = useState(0);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/reactions/post/${postId}/detailed`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions || {});
        setTotalReactions(data.total || 0);
        setUserReaction(data.user_reaction);
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const handleReaction = async (reactionType: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/reactions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          post_id: postId,
          reaction_type: reactionType,
        }),
      });

      if (response.ok) {
        await fetchReactions();
        if (onReactionChange) {
          onReactionChange();
        }
      }
    } catch (error) {
      console.error("Error creating reaction:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get top 3 reactions for display
  const topReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 3);

  if (totalReactions === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Reaction Summary */}
      <div
        className="flex items-center space-x-1 cursor-pointer hover:bg-gray-50 rounded p-1 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Top reaction emojis */}
        <div className="flex -space-x-1">
          {topReactions.map(([type]) => (
            <span
              key={type}
              className="bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              <CustomReactionEmoji type={type} size={20} />
            </span>
          ))}
        </div>

        {/* Count */}
        <span className="text-sm text-gray-600 ml-2">
          {totalReactions} {totalReactions === 1 ? "reação" : "reações"}
        </span>
      </div>

      {/* Detailed Reactions */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          {Object.entries(reactions).map(([type, data]) => (
            <div key={type} className="flex items-start space-x-3">
              <div className="flex items-center space-x-2">
                <CustomReactionEmoji type={type} size={24} />
                <span className={`font-medium ${reactionColors[type]}`}>
                  {data.count}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {data.users.slice(0, 5).map((user) => (
                    <span key={user.id} className="text-sm text-gray-700">
                      {user.first_name} {user.last_name}
                      {data.users.indexOf(user) < data.users.length - 1 &&
                        data.users.indexOf(user) < 4 &&
                        ", "}
                    </span>
                  ))}
                  {data.users.length > 5 && (
                    <span className="text-sm text-gray-500">
                      e mais {data.users.length - 5} pessoas
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
