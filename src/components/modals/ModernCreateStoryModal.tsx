import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Type,
  Image,
  Video,
  Music,
  Palette,
  Smile,
  AtSign,
  MapPin,
  Hash,
  Upload,
  Camera,
  Mic,
  RotateCcw,
  Download,
  Send,
  Eye,
  Users,
  Lock,
  Sliders,
} from "lucide-react";
import { getSafeBackground, getBackgroundStyle } from "../stories/BackgroundUtils";

interface ModernCreateStoryModalProps {
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
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  textAlign: "left" | "center" | "right";
  textShadow?: string;
}

interface TextPosition {
  x: number; // percentage from left
  y: number; // percentage from top
}

export function ModernCreateStoryModal({
  isOpen,
  onClose,
  onSubmit,
}: ModernCreateStoryModalProps) {
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  });

  // UI State
  const [showTextTools, setShowTextTools] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "preview">("create");
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

  // Predefined gradients
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #ff8a80 0%, #ff80ab 100%)",
    "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  ];

  // Solid colors
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
    "#FF6348",
    "#2F3542",
    "#3742FA",
    "#2F3A4B",
    "#A4B0BE",
  ];

  useEffect(() => {
    if (storyType === "text" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [storyType, showTextTools]);

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
      // Pass the actual file object, not base64
      mediaData = {
        type: storyType,
        file: mediaFile, // This is what the upload helper expects
        fileName: mediaFile.name,
        fileSize: mediaFile.size,
      };
    }

    const finalBackground = useGradient ? gradientBackground : backgroundColor;
    const safeBackground = getSafeBackground(finalBackground);
    console.log("Using safe background:", safeBackground);
    onSubmit(content, mediaData, storyDuration, safeBackground);

    // Reset form
    setContent("");
    setMediaFile(null);
    setMediaPreview(null);
    setStoryType("text");
    setTextPosition({ x: 50, y: 50 }); // Reset text to center
    setIsDragging(false);
    onClose();
  };

  if (!isOpen) return null;

  const renderStoryPreview = () => {
    const finalBackground = useGradient ? gradientBackground : backgroundColor;
    const backgroundStyle = getBackgroundStyle(finalBackground);

    return (
      <div
        ref={storyPreviewRef}
        className="relative w-full h-full rounded-2xl overflow-hidden"
        style={backgroundStyle}
      >
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
                textShadow: textStyle.textShadow,
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
                cursor: isDragging ? "grabbing" : "grab",
                border: isDragging
                  ? "2px dashed rgba(255,255,255,0.8)"
                  : "none",
                userSelect: "none",
                touchAction: "none",
                textAlign: textStyle.textAlign,
              }}
            >
              {content}
            </div>

            {/* Drag Instructions */}
            {content && !isDragging && (
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full inline-block">
                  Clique e arraste para posicionar
                </div>
              </div>
            )}
          </div>
        )}

        {/* Story Duration Indicator */}
        <div className="absolute top-4 left-4 right-4">
          <div className="w-full h-1 bg-white bg-opacity-30 rounded-full">
            <div className="h-full bg-white rounded-full w-1/3"></div>
          </div>
        </div>

        {/* Privacy Indicator */}
        <div className="absolute top-8 right-4">
          <div className="flex items-center space-x-1 bg-black bg-opacity-50 rounded-full px-2 py-1">
            {privacy === "public" && <Eye className="w-3 h-3 text-white" />}
            {privacy === "friends" && <Users className="w-3 h-3 text-white" />}
            {privacy === "private" && <Lock className="w-3 h-3 text-white" />}
            <span className="text-white text-xs">
              {privacy === "public" && "Público"}
              {privacy === "friends" && "Amigos"}
              {privacy === "private" && "Privado"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="w-full max-w-6xl h-full max-h-[90vh] flex bg-black rounded-3xl overflow-hidden">
        {/* Left Panel - Story Preview */}
        <div className="w-80 flex-shrink-0 bg-gray-900 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-bold">Sua Story</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile-like Story Preview */}
          <div className="flex-1 max-w-[200px] mx-auto">
            <div className="relative w-full aspect-[9/16] bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              {renderStoryPreview()}
            </div>
          </div>

          {/* Story Duration */}
          <div className="mt-6 space-y-3">
            <label className="text-white text-sm font-medium">Duração</label>
            <select
              value={storyDuration}
              onChange={(e) => setStoryDuration(parseInt(e.target.value))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value={3}>3 horas</option>
              <option value={6}>6 horas</option>
              <option value={12}>12 horas</option>
              <option value={24}>24 horas</option>
            </select>
          </div>

          {/* Privacy Settings */}
          <div className="mt-4 space-y-3">
            <label className="text-white text-sm font-medium">
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
                  className={`p-2 rounded-lg border transition-all ${
                    privacy === value
                      ? "border-blue-500 bg-blue-500 bg-opacity-20 text-blue-400"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Creation Tools */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Criar Story</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab("create")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "create"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Criar
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "preview"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* Content Type Selector */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              {[
                { type: "text", icon: Type, label: "Texto", color: "blue" },
                { type: "photo", icon: Image, label: "Foto", color: "green" },
                { type: "video", icon: Video, label: "Vídeo", color: "purple" },
                { type: "music", icon: Music, label: "Música", color: "pink" },
              ].map(({ type, icon: Icon, label, color }) => (
                <button
                  key={type}
                  onClick={() => setStoryType(type as any)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    storyType === type
                      ? `border-${color}-500 bg-${color}-50 text-${color}-600`
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Creation Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Text Story Tools */}
            {storyType === "text" && (
              <div className="space-y-6">
                {/* Text Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conte sua história
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="O que você quer compartilhar?"
                    className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    maxLength={280}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {content.length}/280
                    </span>
                    <button
                      onClick={() => setShowTextTools(!showTextTools)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Personalizar texto</span>
                    </button>
                  </div>
                </div>

                {/* Text Customization Tools */}
                {showTextTools && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Estilo do Texto
                    </h4>

                    {/* Font Size */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Tamanho: {textStyle.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="48"
                        value={textStyle.fontSize}
                        onChange={(e) =>
                          setTextStyle((prev) => ({
                            ...prev,
                            fontSize: parseInt(e.target.value),
                          }))
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Text Alignment */}
                    <div>
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
                            className={`px-3 py-1 rounded text-sm ${
                              textStyle.textAlign === align
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {align === "left" && "Esquerda"}
                            {align === "center" && "Centro"}
                            {align === "right" && "Direita"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Color */}
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
                            className={`w-8 h-8 rounded-full border-2 ${
                              textStyle.color === color
                                ? "border-gray-900"
                                : "border-gray-300"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Background Options */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Fundo</h4>
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

                  {/* Solid Colors */}
                  {!useGradient && (
                    <div className="grid grid-cols-5 gap-3">
                      {solidColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          className={`aspect-square rounded-xl border-2 transition-transform hover:scale-110 ${
                            backgroundColor === color
                              ? "border-gray-900 scale-110"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Gradients */}
                  {useGradient && (
                    <div className="grid grid-cols-3 gap-3">
                      {gradients.map((gradient, index) => (
                        <button
                          key={index}
                          onClick={() => setGradientBackground(gradient)}
                          className={`aspect-square rounded-xl border-2 transition-transform hover:scale-110 ${
                            gradientBackground === gradient
                              ? "border-gray-900 scale-110"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundImage: gradient }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Media Upload */}
            {storyType !== "text" && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
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

                  {!mediaPreview ? (
                    <div>
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Adicionar{" "}
                        {storyType === "photo"
                          ? "Foto"
                          : storyType === "video"
                            ? "Vídeo"
                            : "Música"}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Arraste e solte ou clique para selecionar
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Escolher Arquivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative max-w-xs mx-auto">
                        {storyType === "photo" && (
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="w-full rounded-lg"
                          />
                        )}
                        {storyType === "video" && (
                          <video
                            src={mediaPreview}
                            controls
                            className="w-full rounded-lg"
                          />
                        )}
                        {storyType === "music" && (
                          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-lg text-white text-center">
                            <Music className="w-12 h-12 mx-auto mb-2" />
                            <p className="font-medium">{mediaFile?.name}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Trocar arquivo
                      </button>
                    </div>
                  )}
                </div>

                {/* Caption for media */}
                {mediaPreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legenda (opcional)
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Adicione uma legenda..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={280}
                    />
                    <span className="text-sm text-gray-500">
                      {content.length}/280
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Cancelar
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
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                <Send className="w-5 h-5" />
                <span>Publicar Story</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
