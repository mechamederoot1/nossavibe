import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Type,
  Image,
  Video,
  Music,
  ArrowLeft,
  Send,
  Palette,
  Smile,
  AtSign,
  Camera,
  Upload,
  RotateCcw,
  Eye,
  Users,
  Lock,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MobileCreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    mediaData?: any,
    storyDuration?: number,
    backgroundColor?: string,
  ) => void;
}

interface TextStyle {
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

interface TextPosition {
  x: number; // percentage from left
  y: number; // percentage from top
}

export function MobileCreateStoryModal({
  isOpen,
  onClose,
  onSubmit,
}: MobileCreateStoryModalProps) {
  const [step, setStep] = useState<
    "select" | "create" | "customize" | "preview"
  >("select");
  const [storyType, setStoryType] = useState<
    "text" | "photo" | "video" | "music"
  >("text");
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [storyDuration, setStoryDuration] = useState(24);
  const [privacy, setPrivacy] = useState("public");

  // Text story customization
  const [backgroundColor, setBackgroundColor] = useState("#FF6B6B");
  const [gradientBackground, setGradientBackground] = useState(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  );
  const [useGradient, setUseGradient] = useState(true);
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  });
  const [textPosition, setTextPosition] = useState<TextPosition>({
    x: 50, // center horizontally
    y: 50, // center vertically
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const storyPreviewRef = useRef<HTMLDivElement>(null);
  const textElementRef = useRef<HTMLDivElement>(null);

  // Predefined gradients optimized for mobile
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  ];

  const solidColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
    "#5F27CD",
    "#00D2D3",
    "#FF9F43",
  ];

  useEffect(() => {
    if (step === "create" && storyType === "text" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [step, storyType]);

  // Drag handlers for text positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!textElementRef.current || !storyPreviewRef.current) return;

    setIsDragging(true);
    const rect = textElementRef.current.getBoundingClientRect();
    const previewRect = storyPreviewRef.current.getBoundingClientRect();

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

  // Event listeners for drag
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setStep("customize");
    }
  };

  const handleSubmit = async () => {
    if (storyType === "text" && !content.trim()) return;
    if (
      (storyType === "photo" ||
        storyType === "video" ||
        storyType === "music") &&
      !mediaFile
    )
      return;

    let mediaData = null;
    if (mediaFile) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(mediaFile);
      });

      mediaData = {
        type: storyType,
        url: base64,
        file: mediaFile,
        fileName: mediaFile.name,
        fileSize: mediaFile.size,
      };
    }

    const finalBackground = useGradient ? gradientBackground : backgroundColor;
    onSubmit(content, mediaData, storyDuration, finalBackground);

    // Reset form
    setContent("");
    setMediaFile(null);
    setMediaPreview(null);
    setStep("select");
    setStoryType("text");
    setTextPosition({ x: 50, y: 50 }); // Reset text to center
    setIsDragging(false);
    onClose();
  };

  const renderStoryPreview = () => {
    const backgroundStyle = useGradient
      ? { backgroundImage: gradientBackground }
      : { backgroundColor };

    return (
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden"
        style={backgroundStyle}
      >
        {/* Status Bar Simulation */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white bg-opacity-50 rounded-full"></div>
              <div className="w-1 h-1 bg-white bg-opacity-30 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-1">
              {privacy === "public" && <Eye className="w-3 h-3" />}
              {privacy === "friends" && <Users className="w-3 h-3" />}
              {privacy === "private" && <Lock className="w-3 h-3" />}
            </div>
          </div>
        </div>

        {/* Media Content */}
        {storyType !== "text" && mediaPreview && (
          <div className="absolute inset-0">
            {storyType === "photo" && (
              <img
                src={mediaPreview}
                alt="Story content"
                className="w-full h-full object-cover"
              />
            )}
            {storyType === "video" && (
              <video
                src={mediaPreview}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
              />
            )}
          </div>
        )}

        {/* Text Overlay */}
        {content && (
          <div
            ref={storyPreviewRef}
            className="absolute inset-0 p-4"
            style={{ cursor: isDragging ? "grabbing" : "default" }}
          >
            <div
              ref={textElementRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className={`absolute select-none ${isDragging ? "z-50" : ""}`}
              style={{
                left: `${textPosition.x}%`,
                top: `${textPosition.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${textStyle.fontSize}px`,
                fontWeight: textStyle.fontWeight,
                color: textStyle.color,
                textAlign: textStyle.textAlign,
                backgroundColor: textStyle.backgroundColor,
                borderRadius: textStyle.borderRadius
                  ? `${textStyle.borderRadius}px`
                  : undefined,
                padding: textStyle.padding
                  ? `${textStyle.padding}px`
                  : "8px 12px",
                maxWidth: "90%",
                wordWrap: "break-word",
                lineHeight: 1.2,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                cursor: isDragging ? "grabbing" : "grab",
                border: isDragging
                  ? "2px dashed rgba(255,255,255,0.8)"
                  : "none",
                userSelect: "none",
                touchAction: "none",
              }}
            >
              {content}
            </div>

            {/* Drag Instructions */}
            {step === "create" && content && !isDragging && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-black bg-opacity-60 text-white text-xs px-3 py-2 rounded-full inline-block">
                  Toque e arraste para posicionar o texto
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <button
          onClick={step === "select" ? onClose : () => setStep("select")}
          className="p-2"
        >
          {step === "select" ? (
            <X className="w-6 h-6" />
          ) : (
            <ArrowLeft className="w-6 h-6" />
          )}
        </button>
        <h1 className="text-lg font-semibold">
          {step === "select" && "Criar Story"}
          {step === "create" &&
            `${storyType === "text" ? "Texto" : storyType === "photo" ? "Foto" : storyType === "video" ? "Vídeo" : "Música"}`}
          {step === "customize" && "Personalizar"}
          {step === "preview" && "Preview"}
        </h1>
        <div className="w-10" />
      </div>

      {/* Step 1: Select Story Type */}
      {step === "select" && (
        <div className="flex-1 bg-gray-900 p-6">
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {[
              {
                type: "text",
                icon: Type,
                label: "Texto",
                gradient: "from-blue-500 to-purple-600",
              },
              {
                type: "photo",
                icon: Image,
                label: "Foto",
                gradient: "from-green-500 to-teal-600",
              },
              {
                type: "video",
                icon: Video,
                label: "Vídeo",
                gradient: "from-purple-500 to-pink-600",
              },
              {
                type: "music",
                icon: Music,
                label: "Música",
                gradient: "from-pink-500 to-rose-600",
              },
            ].map(({ type, icon: Icon, label, gradient }) => (
              <button
                key={type}
                onClick={() => {
                  setStoryType(type as any);
                  if (type === "text") {
                    setStep("create");
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className={`aspect-square bg-gradient-to-br ${gradient} rounded-3xl p-6 flex flex-col items-center justify-center text-white transform transition-all active:scale-95 hover:scale-105`}
              >
                <Icon className="w-12 h-12 mb-3" />
                <span className="text-lg font-medium">{label}</span>
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={
              storyType === "photo"
                ? "image/*"
                : storyType === "video"
                  ? "video/*"
                  : "audio/*"
            }
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Step 2: Create Content */}
      {step === "create" && storyType === "text" && (
        <div className="flex-1 flex flex-col">
          {/* Story Preview */}
          <div className="flex-1 bg-gray-900 p-4 flex items-center justify-center">
            <div className="w-56 aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl">
              {renderStoryPreview()}
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-white p-4 space-y-4">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full h-24 p-4 border border-gray-300 rounded-2xl resize-none text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={280}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {content.length}/280
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setStep("customize")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium"
                >
                  Personalizar
                </button>
                <button
                  onClick={() => setStep("preview")}
                  disabled={!content.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Avançar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Customize */}
      {step === "customize" && (
        <div className="flex-1 flex flex-col">
          {/* Story Preview */}
          <div className="flex-1 bg-gray-900 p-4 flex items-center justify-center">
            <div className="w-56 aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl">
              {renderStoryPreview()}
            </div>
          </div>

          {/* Customization Panel */}
          <div className="bg-white max-h-80 overflow-y-auto">
            {/* Background Selection */}
            {storyType === "text" && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Fundo</h3>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setUseGradient(false)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        !useGradient ? "bg-white shadow-sm" : "text-gray-600"
                      }`}
                    >
                      Cor
                    </button>
                    <button
                      onClick={() => setUseGradient(true)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        useGradient ? "bg-white shadow-sm" : "text-gray-600"
                      }`}
                    >
                      Gradiente
                    </button>
                  </div>
                </div>

                {/* Colors/Gradients Grid */}
                <div className="grid grid-cols-5 gap-3">
                  {(useGradient ? gradients : solidColors).map(
                    (background, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          useGradient
                            ? setGradientBackground(background)
                            : setBackgroundColor(background)
                        }
                        className="aspect-square rounded-xl border-2 transition-transform active:scale-95"
                        style={{
                          ...(useGradient
                            ? { backgroundImage: background }
                            : { backgroundColor: background }),
                          borderColor: (
                            useGradient
                              ? gradientBackground === background
                              : backgroundColor === background
                          )
                            ? "#000"
                            : "#e5e7eb",
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Text Styling */}
            {storyType === "text" && (
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Texto</h3>

                {/* Font Size */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">
                    Tamanho: {textStyle.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="40"
                    value={textStyle.fontSize}
                    onChange={(e) =>
                      setTextStyle((prev) => ({
                        ...prev,
                        fontSize: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Text Alignment */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">
                    Alinhamento
                  </label>
                  <div className="flex space-x-2">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() =>
                          setTextStyle((prev) => ({
                            ...prev,
                            textAlign: align,
                          }))
                        }
                        className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                          textStyle.textAlign === align
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {align === "left" && "Esquerda"}
                        {align === "center" && "Centro"}
                        {align === "right" && "Direita"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Colors */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Cor do Texto
                  </label>
                  <div className="flex space-x-2">
                    {[
                      "#FFFFFF",
                      "#000000",
                      "#FF6B6B",
                      "#4ECDC4",
                      "#45B7D1",
                      "#FECA57",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setTextStyle((prev) => ({ ...prev, color }))
                        }
                        className={`w-10 h-10 rounded-full border-2 transition-transform active:scale-95 ${
                          textStyle.color === color
                            ? "border-gray-900 scale-110"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Caption for media */}
            {mediaPreview && (
              <div className="p-4 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legenda
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Adicione uma legenda..."
                  className="w-full h-20 p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={280}
                />
                <span className="text-sm text-gray-500">
                  {content.length}/280
                </span>
              </div>
            )}

            {/* Privacy & Duration */}
            <div className="p-4 space-y-4">
              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacidade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "public", icon: Eye, label: "Público" },
                    { value: "friends", icon: Users, label: "Amigos" },
                    { value: "private", icon: Lock, label: "Privado" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setPrivacy(value)}
                      className={`p-3 rounded-xl border transition-all ${
                        privacy === value
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração
                </label>
                <select
                  value={storyDuration}
                  onChange={(e) => setStoryDuration(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={3}>3 horas</option>
                  <option value={6}>6 horas</option>
                  <option value={12}>12 horas</option>
                  <option value={24}>24 horas</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-4 bg-gray-50">
              <button
                onClick={() => setStep("preview")}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium text-lg"
              >
                Ver Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Publish */}
      {step === "preview" && (
        <div className="flex-1 flex flex-col">
          {/* Full Screen Preview */}
          <div className="flex-1 bg-black flex items-center justify-center p-4">
            <div className="w-72 aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl">
              {renderStoryPreview()}
            </div>
          </div>

          {/* Publish Actions */}
          <div className="bg-white p-4 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
              <span>Duração: {storyDuration}h</span>
              <span>•</span>
              <span>
                {privacy === "public" && "Público"}
                {privacy === "friends" && "Amigos"}
                {privacy === "private" && "Privado"}
              </span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep("customize")}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium"
              >
                Editar
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  (storyType === "text" && !content.trim()) ||
                  ((storyType === "photo" ||
                    storyType === "video" ||
                    storyType === "music") &&
                    !mediaFile)
                }
                className="flex-2 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium text-lg disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Publicar Story</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
