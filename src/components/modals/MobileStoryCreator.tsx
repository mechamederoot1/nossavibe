import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Music,
  Type,
  AtSign,
  Palette,
  Download,
  Hash,
  Users,
} from "lucide-react";

interface MobileStoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storyData: StoryData) => void;
  userToken: string;
}

interface StoryData {
  content: string;
  backgroundColor: string;
  textStyle: TextStyle;
  mentions: string[];
  hashtags: string[];
  fontSize: number;
  fontFamily: string;
  textColor: string;
  position: { x: number; y: number };
}

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: string;
  textShadow?: string;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

const BACKGROUND_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
];

const FONT_FAMILIES = [
  { name: "Inter", value: "Inter, sans-serif", preview: "Abc" },
  { name: "Poppins", value: "Poppins, sans-serif", preview: "Abc" },
  { name: "Roboto", value: "Roboto, sans-serif", preview: "Abc" },
  { name: "Playfair", value: "Playfair Display, serif", preview: "Abc" },
  { name: "Dancing", value: "Dancing Script, cursive", preview: "Abc" },
  { name: "Monoton", value: "Monoton, cursive", preview: "Abc" },
];

const TEXT_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
];

export function MobileStoryCreator({
  isOpen,
  onClose,
  onSubmit,
  userToken,
}: MobileStoryCreatorProps) {
  const [content, setContent] = useState("");
  const [currentStep, setCurrentStep] = useState<
    "main" | "text" | "font" | "color" | "background" | "mentions"
  >("main");
  const [backgroundColor, setBackgroundColor] = useState(
    BACKGROUND_GRADIENTS[0],
  );
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontFamily: "Inter, sans-serif",
    fontSize: 24,
    color: "#FFFFFF",
    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
  });
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mentions, setMentions] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const storyPreviewRef = useRef<HTMLDivElement>(null);
  const textElementRef = useRef<HTMLDivElement>(null);

  // Search users for mentions
  const searchUsersForMention = async (query: string) => {
    if (query.length < 2) {
      setSearchUsers([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const users = await response.json();
        setSearchUsers(users.slice(0, 5)); // Show max 5 users
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // Handle text input changes for mentions and hashtags
  const handleContentChange = (text: string) => {
    setContent(text);

    // Extract mentions
    const mentionMatches = text.match(/@\w+/g) || [];
    const newMentions = mentionMatches.map((mention) => mention.substring(1));
    setMentions(newMentions);

    // Extract hashtags
    const hashtagMatches = text.match(/#\w+/g) || [];
    const newHashtags = hashtagMatches.map((hashtag) => hashtag.substring(1));
    setHashtags(newHashtags);

    // Search for users if typing @
    const lastAtIndex = text.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const afterAt = text.substring(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(" ");
      const searchTerm =
        spaceIndex === -1 ? afterAt : afterAt.substring(0, spaceIndex);

      if (searchTerm.length > 0) {
        setUserSearch(searchTerm);
        searchUsersForMention(searchTerm);
      }
    } else {
      setSearchUsers([]);
      setUserSearch("");
    }
  };

  // Add user mention
  const addUserMention = (user: User) => {
    const lastAtIndex = content.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const beforeAt = content.substring(0, lastAtIndex);
      const afterAt = content.substring(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(" ");
      const afterMention =
        spaceIndex === -1 ? "" : afterAt.substring(spaceIndex);

      const newContent = `${beforeAt}@${user.username}${afterMention}`;
      setContent(newContent);
      setSearchUsers([]);
      setUserSearch("");
    }
  };

  // Drag handlers for text positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!textElementRef.current || !storyPreviewRef.current) return;
    setIsDragging(true);
    const rect = textElementRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!textElementRef.current || !storyPreviewRef.current) return;
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = textElementRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !storyPreviewRef.current) return;
    const previewRect = storyPreviewRef.current.getBoundingClientRect();
    const newX =
      ((e.clientX - dragOffset.x - previewRect.left) / previewRect.width) * 100;
    const newY =
      ((e.clientY - dragOffset.y - previewRect.top) / previewRect.height) * 100;
    setTextPosition({
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY)),
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !storyPreviewRef.current) return;
    const touch = e.touches[0];
    const previewRect = storyPreviewRef.current.getBoundingClientRect();
    const newX =
      ((touch.clientX - dragOffset.x - previewRect.left) / previewRect.width) *
      100;
    const newY =
      ((touch.clientY - dragOffset.y - previewRect.top) / previewRect.height) *
      100;
    setTextPosition({
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY)),
    });
    e.preventDefault();
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleTouchEnd = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  const handleSubmit = () => {
    const storyData: StoryData = {
      content,
      backgroundColor,
      textStyle,
      mentions,
      hashtags,
      fontSize: textStyle.fontSize,
      fontFamily: textStyle.fontFamily,
      textColor: textStyle.color,
      position: textPosition,
    };

    onSubmit(storyData);
    onClose();
    // Reset form
    setContent("");
    setCurrentStep("main");
    setTextPosition({ x: 50, y: 50 });
    setMentions([]);
    setHashtags([]);
  };

  if (!isOpen) return null;

  const renderMainStep = () => (
    <>
      {/* Story Preview */}
      <div
        ref={storyPreviewRef}
        className="absolute inset-0"
        style={{ backgroundImage: backgroundColor }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-12 left-6 p-2 text-white/90 hover:text-white transition-colors z-10"
        >
          <X className="w-7 h-7" strokeWidth={2} />
        </button>

        {/* Text Content */}
        {content && (
          <div
            ref={textElementRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={`absolute select-none ${isDragging ? "z-50" : ""}`}
            style={{
              left: `${textPosition.x}%`,
              top: `${textPosition.y}%`,
              transform: "translate(-50%, -50%)",
              fontFamily: textStyle.fontFamily,
              fontSize: `${textStyle.fontSize}px`,
              color: textStyle.color,
              textAlign: "center",
              maxWidth: "85%",
              wordWrap: "break-word",
              lineHeight: 1.2,
              textShadow: textStyle.textShadow,
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              touchAction: "none",
              padding: "12px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(0,0,0,0.2)",
              fontWeight: "bold",
            }}
          >
            {content}
          </div>
        )}

        {/* Side Tools */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 space-y-8">
          {/* Text */}
          <div className="flex items-center justify-end">
            <span className="text-white text-lg font-medium mr-4">Texto</span>
            <button
              onClick={() => setCurrentStep("text")}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Type className="w-6 h-6 text-black" strokeWidth={2} />
            </button>
          </div>

          {/* Font */}
          <div className="flex items-center justify-end">
            <span className="text-white text-lg font-medium mr-4">Fonte</span>
            <button
              onClick={() => setCurrentStep("font")}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-black text-xl font-bold">Aa</span>
            </button>
          </div>

          {/* Color */}
          <div className="flex items-center justify-end">
            <span className="text-white text-lg font-medium mr-4">Cor</span>
            <button
              onClick={() => setCurrentStep("color")}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Palette className="w-6 h-6 text-black" strokeWidth={2} />
            </button>
          </div>

          {/* Background */}
          <div className="flex items-center justify-end">
            <span className="text-white text-lg font-medium mr-4">Fundo</span>
            <button
              onClick={() => setCurrentStep("background")}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-400 to-blue-500"></div>
            </button>
          </div>

          {/* Mentions */}
          <div className="flex items-center justify-end">
            <span className="text-white text-lg font-medium mr-4">Marcar</span>
            <button
              onClick={() => setCurrentStep("mentions")}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <AtSign className="w-6 h-6 text-black" strokeWidth={2} />
            </button>
          </div>

          {/* Music */}
          <div className="flex items-center justify-end">
            <span className="text-white text-lg font-medium mr-4">Música</span>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Music className="w-6 h-6 text-black" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <button className="p-3 text-white/80 hover:text-white transition-colors">
              <Download className="w-6 h-6" strokeWidth={2} />
            </button>

            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderTextStep = () => (
    <div className="absolute inset-0 bg-black flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <button
          onClick={() => setCurrentStep("main")}
          className="text-white text-lg"
        >
          Cancelar
        </button>
        <h2 className="text-white text-xl font-semibold">Adicionar Texto</h2>
        <button
          onClick={() => setCurrentStep("main")}
          className="text-blue-400 text-lg font-medium"
        >
          Pronto
        </button>
      </div>

      <div className="flex-1 p-6">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Digite seu texto... Use @ para marcar amigos e # para hashtags"
          className="w-full h-40 p-4 bg-gray-800 text-white rounded-xl resize-none text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={280}
          autoFocus
        />

        <div className="flex items-center justify-between mt-4 text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <AtSign className="w-4 h-4" />
              <span className="text-sm">{mentions.length} marcações</span>
            </div>
            <div className="flex items-center space-x-1">
              <Hash className="w-4 h-4" />
              <span className="text-sm">{hashtags.length} hashtags</span>
            </div>
          </div>
          <span className="text-sm">{content.length}/280</span>
        </div>

        {/* User Search Results */}
        {searchUsers.length > 0 && (
          <div className="mt-4 bg-gray-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-gray-700">
              <span className="text-white text-sm font-medium">
                Marcar usuário
              </span>
            </div>
            {searchUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => addUserMention(user)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-700 transition-colors"
              >
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-left">
                  <div className="text-white text-sm font-medium">
                    @{user.username}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {user.first_name} {user.last_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderFontStep = () => (
    <div className="absolute inset-0 bg-black flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <button
          onClick={() => setCurrentStep("main")}
          className="text-white text-lg"
        >
          Voltar
        </button>
        <h2 className="text-white text-xl font-semibold">Escolher Fonte</h2>
        <div></div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {FONT_FAMILIES.map((font) => (
          <button
            key={font.value}
            onClick={() => {
              setTextStyle({ ...textStyle, fontFamily: font.value });
              setCurrentStep("main");
            }}
            className={`w-full p-4 rounded-xl border-2 transition-colors ${
              textStyle.fontFamily === font.value
                ? "border-blue-500 bg-blue-500/20"
                : "border-gray-700 bg-gray-800 hover:border-gray-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{font.name}</span>
              <span
                className="text-white text-2xl"
                style={{ fontFamily: font.value }}
              >
                {font.preview}
              </span>
            </div>
          </button>
        ))}

        {/* Font Size Slider */}
        <div className="mt-8 p-4 bg-gray-800 rounded-xl">
          <label className="text-white text-sm font-medium mb-3 block">
            Tamanho da Fonte: {textStyle.fontSize}px
          </label>
          <input
            type="range"
            min="16"
            max="48"
            value={textStyle.fontSize}
            onChange={(e) =>
              setTextStyle({ ...textStyle, fontSize: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  );

  const renderColorStep = () => (
    <div className="absolute inset-0 bg-black flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <button
          onClick={() => setCurrentStep("main")}
          className="text-white text-lg"
        >
          Voltar
        </button>
        <h2 className="text-white text-xl font-semibold">Cor do Texto</h2>
        <div></div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-5 gap-4">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                setTextStyle({ ...textStyle, color });
                setCurrentStep("main");
              }}
              className={`w-full aspect-square rounded-xl border-4 transition-all ${
                textStyle.color === color
                  ? "border-white scale-110"
                  : "border-gray-600"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderBackgroundStep = () => (
    <div className="absolute inset-0 bg-black flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <button
          onClick={() => setCurrentStep("main")}
          className="text-white text-lg"
        >
          Voltar
        </button>
        <h2 className="text-white text-xl font-semibold">Plano de Fundo</h2>
        <div></div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 gap-4">
          {BACKGROUND_GRADIENTS.map((gradient, index) => (
            <button
              key={index}
              onClick={() => {
                setBackgroundColor(gradient);
                setCurrentStep("main");
              }}
              className={`w-full aspect-square rounded-xl border-4 transition-all ${
                backgroundColor === gradient
                  ? "border-white scale-105"
                  : "border-gray-600"
              }`}
              style={{ backgroundImage: gradient }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black z-50">
      {currentStep === "main" && renderMainStep()}
      {currentStep === "text" && renderTextStep()}
      {currentStep === "font" && renderFontStep()}
      {currentStep === "color" && renderColorStep()}
      {currentStep === "background" && renderBackgroundStep()}
    </div>
  );
}
