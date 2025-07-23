import React, { useState, useRef, useEffect } from "react";
import { X, Music, Circle, ChevronDown, Settings } from "lucide-react";

interface InstagramStyleStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    mediaData?: any,
    storyDuration?: number,
    backgroundColor?: string,
  ) => void;
}

interface TextPosition {
  x: number;
  y: number;
}

export function InstagramStyleStoryModal({
  isOpen,
  onClose,
  onSubmit,
}: InstagramStyleStoryModalProps) {
  const [content, setContent] = useState("");
  const [backgroundColor] = useState(
    "linear-gradient(135deg, #4285f4 0%, #1e3a8a 100%)",
  );
  const [textPosition, setTextPosition] = useState<TextPosition>({
    x: 50,
    y: 50,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showTextInput, setShowTextInput] = useState(false);
  const [activeOption, setActiveOption] = useState<string | null>(null);

  const storyPreviewRef = useRef<HTMLDivElement>(null);
  const textElementRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Drag handlers
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

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

  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextInput]);

  const handleSubmit = () => {
    onSubmit(content, null, 24, backgroundColor);
    setContent("");
    setTextPosition({ x: 50, y: 50 });
    setShowTextInput(false);
    setActiveOption(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Main Story Area */}
      <div className="relative w-full h-full">
        {/* Story Background */}
        <div
          ref={storyPreviewRef}
          className="absolute inset-0"
          style={{
            backgroundImage: backgroundColor,
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-12 left-6 p-2 text-white/90 hover:text-white transition-colors z-10"
          >
            <X className="w-7 h-7" strokeWidth={2} />
          </button>

          {/* Side Options */}
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 space-y-10">
            {/* Figurinhas */}
            <div className="flex items-center justify-end">
              <span className="text-white text-lg font-medium mr-5">
                Figurinhas
              </span>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 text-black flex items-center justify-center">
                  {/* Theater mask icon */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12,2C17,2 21,6 21,11C21,16 17,20 12,20C7,20 3,16 3,11C3,6 7,2 12,2M12,4C8.1,4 5,7.1 5,11C5,14.9 8.1,18 12,18C15.9,18 19,14.9 19,11C19,7.1 15.9,4 12,4M8,10.5C8.8,10.5 9.5,9.8 9.5,9S8.8,7.5 8,7.5 6.5,8.2 6.5,9 7.2,10.5 8,10.5M16,10.5C16.8,10.5 17.5,9.8 17.5,9S16.8,7.5 16,7.5 14.5,8.2 14.5,9 15.2,10.5 16,10.5M12,17C14.5,17 16.5,15 16.5,12.5H7.5C7.5,15 9.5,17 12,17Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Música */}
            <div className="flex items-center justify-end">
              <span className="text-white text-lg font-medium mr-5">
                Música
              </span>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-black" strokeWidth={2} />
              </div>
            </div>

            {/* Planos de fundo */}
            <div className="flex items-center justify-end">
              <span className="text-white text-lg font-medium mr-5">
                Planos de fundo
              </span>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Circle className="w-6 h-6 text-black" strokeWidth={2.5} />
              </div>
            </div>

            {/* Texto */}
            <div className="flex items-center justify-end">
              <span className="text-white text-lg font-medium mr-5">Texto</span>
              <button
                onClick={() => setShowTextInput(true)}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center"
              >
                <span className="text-black text-xl font-bold">Aa</span>
              </button>
            </div>

            {/* Ver mais */}
            <div className="flex items-center justify-end">
              <span className="text-white text-lg font-medium mr-5">
                Ver mais
              </span>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <ChevronDown className="w-6 h-6 text-black" strokeWidth={2} />
              </div>
            </div>
          </div>

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
                fontSize: "28px",
                fontWeight: "bold",
                color: "#FFFFFF",
                textAlign: "center",
                maxWidth: "85%",
                wordWrap: "break-word",
                lineHeight: 1.2,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                cursor: isDragging ? "grabbing" : "grab",
                border: isDragging
                  ? "2px dashed rgba(255,255,255,0.8)"
                  : "none",
                userSelect: "none",
                touchAction: "none",
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: "rgba(0,0,0,0.2)",
              }}
            >
              {content}
            </div>
          )}
        </div>

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Adicionar texto</h3>
              <textarea
                ref={textInputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite seu texto..."
                className="w-full h-32 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={280}
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-500 text-sm">
                  {content.length}/280
                </span>
                <div className="space-x-3">
                  <button
                    onClick={() => setShowTextInput(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setShowTextInput(false)}
                    disabled={!content.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Settings */}
            <button className="p-3 text-white/80 hover:text-white transition-colors">
              <Settings className="w-6 h-6" strokeWidth={2} />
            </button>

            {/* Share Button */}
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Compartilhar
            </button>
          </div>

          {/* Mobile Navigation Bar */}
          <div className="flex justify-center mt-4 space-x-16">
            <div className="w-1 h-6 bg-white/30 rounded-full" />
            <div className="w-8 h-1 bg-white/60 rounded-full self-center" />
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-white/60 self-center rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
}
