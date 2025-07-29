import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Image,
  Video,
  Type,
  Palette,
  AtSign,
  Send,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Music,
  Smile,
} from "lucide-react";
import { createStoryWithFile } from "../stories/StoryUploadHelper";
import { BACKGROUND_GRADIENTS, getSafeBackground, getBackgroundStyle } from "../stories/BackgroundUtils";
import { toast } from "../ui/Toast";

interface EnhancedMobileStoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToken: string;
}

interface MediaCapture {
  file: File;
  preview: string;
  type: "image" | "video";
}



export function EnhancedMobileStoryCreator({
  isOpen,
  onClose,
  onSuccess,
  userToken,
}: EnhancedMobileStoryCreatorProps) {
  const [step, setStep] = useState<"capture" | "edit" | "text">("capture");
  const [mediaCapture, setMediaCapture] = useState<MediaCapture | null>(null);
  const [content, setContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_GRADIENTS[0]);
  const [textStyle, setTextStyle] = useState({
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center" as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep("capture");
      setMediaCapture(null);
      setContent("");
      setBackgroundColor(BACKGROUND_GRADIENTS[0]);
    }
  }, [isOpen]);

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const handleVideoCapture = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("Arquivo muito grande! Máximo 50MB permitido.");
      return;
    }

    // For video, check duration (will be handled by backend too)
    if (type === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        if (video.duration > 25) {
          alert("Vídeo muito longo! Máximo 25 segundos permitido.");
          return;
        }
        processFile(file, type);
      };
      video.src = URL.createObjectURL(file);
    } else {
      processFile(file, type);
    }

    // Clear input
    event.target.value = "";
  };

  const processFile = (file: File, type: "image" | "video") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setMediaCapture({
        file,
        preview,
        type,
      });
      setStep("edit");
    };
    reader.readAsDataURL(file);
  };

  const handleTextOnlyStory = () => {
    setStep("text");
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaCapture) {
      toast.warning("Adicione texto ou uma mídia ao seu story!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure background is safe for database storage
      const safeBackground = getSafeBackground(backgroundColor);
      console.log("📝 Creating story with:", {
        hasContent: !!content.trim(),
        hasMedia: !!mediaCapture,
        backgroundType: backgroundColor.startsWith('linear-gradient') ? 'gradient' : 'solid',
        safeBackground
      });

      const success = await createStoryWithFile(
        content,
        mediaCapture?.file || null,
        24, // 24 hours duration
        safeBackground,
        "public",
        userToken
      );

      if (success) {
        onSuccess();
        console.log("✅ Story created successfully!");
        toast.success("🎉 Story criado com sucesso!");
      } else {
        throw new Error("Erro ao criar story. Verifique sua conexão e tente novamente.");
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error(error instanceof Error ? error.message : "❌ Erro ao criar story. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const renderCaptureStep = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="p-2 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-white text-lg font-semibold">Criar Story</h1>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {/* Camera Button */}
        <button
          onClick={handleCameraCapture}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all active:scale-95"
        >
          <Camera className="w-10 h-10 text-black" />
        </button>

        {/* Options */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
          <button
            onClick={handleGallerySelect}
            className="flex flex-col items-center space-y-2 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all"
          >
            <Image className="w-8 h-8 text-white" />
            <span className="text-white text-sm">Galeria</span>
          </button>

          <button
            onClick={handleVideoCapture}
            className="flex flex-col items-center space-y-2 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all"
          >
            <Video className="w-8 h-8 text-white" />
            <span className="text-white text-sm">Vídeo</span>
          </button>

          <button
            onClick={handleTextOnlyStory}
            className="flex flex-col items-center space-y-2 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all"
          >
            <Type className="w-8 h-8 text-white" />
            <span className="text-white text-sm">Texto</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelection(e, "image")}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelection(e, "image")}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={(e) => handleFileSelection(e, "video")}
        className="hidden"
      />
    </div>
  );

  const renderEditStep = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Preview Area */}
      <div
        className="flex-1 relative overflow-hidden"
        style={getBackgroundStyle(backgroundColor)}
      >
        {/* Media Preview */}
        {mediaCapture && (
          <div className="absolute inset-0 flex items-center justify-center">
            {mediaCapture.type === "image" ? (
              <img
                src={mediaCapture.preview}
                alt="Story preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={mediaCapture.preview}
                className="max-w-full max-h-full object-contain"
                controls
                muted
              />
            )}
          </div>
        )}

        {/* Text Overlay */}
        {content && (
          <div
            className="absolute inset-x-4 top-1/2 transform -translate-y-1/2 text-center"
            style={{
              fontSize: `${textStyle.fontSize}px`,
              color: textStyle.color,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              fontWeight: "bold",
            }}
          >
            {content}
          </div>
        )}

        {/* Fallback when no media or content */}
        {!mediaCapture && !content && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/60 text-center">
              <Type className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Adicione texto ou mídia ao seu story</p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => setStep("capture")}
          className="absolute top-4 left-4 p-2 text-white/90 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Tools */}
      <div className="bg-black/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setStep("text")}
            className="p-3 bg-white/20 rounded-full"
          >
            <Type className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {isSubmitting ? "Enviando..." : "Compartilhar"}
          </button>
        </div>

        {/* Background Options */}
        {!mediaCapture && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {BACKGROUND_GRADIENTS.map((gradient, index) => (
              <button
                key={index}
                onClick={() => setBackgroundColor(gradient)}
                className={`w-12 h-12 rounded-full flex-shrink-0 border-2 ${
                  backgroundColor === gradient
                    ? "border-white"
                    : "border-gray-600"
                }`}
                style={{ backgroundImage: gradient }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTextStep = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => setStep(mediaCapture ? "edit" : "capture")}
          className="text-white text-lg"
        >
          Voltar
        </button>
        <h2 className="text-white text-xl font-semibold">Adicionar Texto</h2>
        <button
          onClick={() => setStep(mediaCapture ? "edit" : "capture")}
          className="text-blue-400 text-lg font-medium"
        >
          Pronto
        </button>
      </div>

      <div className="flex-1 p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="O que você quer compartilhar?"
          className="w-full h-40 p-4 bg-gray-800 text-white rounded-xl resize-none text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={280}
          autoFocus
        />

        <div className="flex items-center justify-between mt-4 text-gray-400">
          <span className="text-sm">Use @ para marcar amigos</span>
          <span className="text-sm">{content.length}/280</span>
        </div>

        {/* Text Customization */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Tamanho do Texto
            </label>
            <input
              type="range"
              min="16"
              max="48"
              value={textStyle.fontSize}
              onChange={(e) =>
                setTextStyle({
                  ...textStyle,
                  fontSize: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Cor do Texto
            </label>
            <div className="flex space-x-2">
              {["#FFFFFF", "#000000", "#FF6B6B", "#4ECDC4", "#45B7D1"].map(
                (color) => (
                  <button
                    key={color}
                    onClick={() => setTextStyle({ ...textStyle, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      textStyle.color === color
                        ? "border-white"
                        : "border-gray-600"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === "capture") return renderCaptureStep();
  if (step === "edit") return renderEditStep();
  if (step === "text") return renderTextStep();

  return null;
}
