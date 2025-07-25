import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Image,
  Video,
  Smile,
  Type,
  Globe,
  Users,
  Lock,
  ArrowLeft,
  Send,
  Upload,
  Trash2,
  Plus,
  Camera,
} from "lucide-react";

interface MobileCreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    type: "post" | "testimonial",
    privacy: string,
    mediaData?: any,
  ) => void;
  userToken: string;
}

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video" | "audio" | "document";
}

export function MobileCreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  userToken,
}: MobileCreatePostModalProps) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"post" | "testimonial">("post");
  const [privacy, setPrivacy] = useState("public");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;

    setUploading(true);
    try {
      let mediaData = null;

      if (mediaFiles.length > 0) {
        const urls: string[] = [];
        const types: string[] = [];

        for (const mediaFile of mediaFiles) {
          urls.push(mediaFile.preview);
          types.push(mediaFile.type);
        }

        mediaData = {
          urls,
          types,
          count: mediaFiles.length,
        };
      }

      await onSubmit(content, postType, privacy, mediaData);

      // Reset form
      setContent("");
      setMediaFiles([]);
      setPostType("post");
      setPrivacy("public");
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        let type: "image" | "video" | "audio" | "document" = "document";

        if (file.type.startsWith("image/")) type = "image";
        else if (file.type.startsWith("video/")) type = "video";
        else if (file.type.startsWith("audio/")) type = "audio";

        setMediaFiles((prev) => [...prev, { file, preview, type }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">
          {postType === "post" ? "Nova Publicação" : "Novo Depoimento"}
        </h1>
        <button
          onClick={handleSubmit}
          disabled={(!content.trim() && mediaFiles.length === 0) || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          {uploading ? "Publicando..." : "Publicar"}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Post Type Toggle */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setPostType("post")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                postType === "post"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              📝 Publicação
            </button>
            <button
              onClick={() => setPostType("testimonial")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                postType === "testimonial"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              💭 Depoimento
            </button>
          </div>
        </div>

        {/* Text Input */}
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`O que você quer ${postType === "post" ? "compartilhar" : "falar sobre alguém"}?`}
            className="w-full min-h-[120px] p-4 text-lg border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">{content.length}/2000</span>
          </div>
        </div>

        {/* Media Files */}
        {mediaFiles.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">
              Arquivos anexados
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {mediaFiles.map((media, index) => (
                <div
                  key={index}
                  className="relative bg-gray-100 rounded-lg overflow-hidden"
                >
                  {media.type === "image" && (
                    <img
                      src={media.preview}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                  )}
                  {media.type === "video" && (
                    <video
                      src={media.preview}
                      className="w-full h-32 object-cover"
                      controls
                    />
                  )}
                  {(media.type === "audio" || media.type === "document") && (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-200">
                      <div className="text-center">
                        <div className="text-2xl mb-2">
                          {media.type === "audio" ? "🎵" : "📄"}
                        </div>
                        <p className="text-xs text-gray-600 truncate px-2">
                          {media.file.name}
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => removeMediaFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowPrivacyOptions(!showPrivacyOptions)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              {privacy === "public" && (
                <Globe className="w-5 h-5 text-blue-500" />
              )}
              {privacy === "friends" && (
                <Users className="w-5 h-5 text-green-500" />
              )}
              {privacy === "private" && (
                <Lock className="w-5 h-5 text-gray-500" />
              )}
              <div className="text-left">
                <p className="font-medium text-gray-900">
                  {privacy === "public" && "Público"}
                  {privacy === "friends" && "Amigos"}
                  {privacy === "private" && "Privado"}
                </p>
                <p className="text-sm text-gray-500">
                  {privacy === "public" && "Qualquer pessoa pode ver"}
                  {privacy === "friends" && "Apenas seus amigos podem ver"}
                  {privacy === "private" && "Apenas você pode ver"}
                </p>
              </div>
            </div>
            <div
              className={`transform transition-transform ${showPrivacyOptions ? "rotate-180" : ""}`}
            >
              ⌄
            </div>
          </button>

          {showPrivacyOptions && (
            <div className="mt-3 space-y-2">
              {[
                {
                  value: "public",
                  icon: Globe,
                  label: "Público",
                  desc: "Qualquer pessoa pode ver",
                  color: "blue",
                },
                {
                  value: "friends",
                  icon: Users,
                  label: "Amigos",
                  desc: "Apenas seus amigos podem ver",
                  color: "green",
                },
                {
                  value: "private",
                  icon: Lock,
                  label: "Privado",
                  desc: "Apenas você pode ver",
                  color: "gray",
                },
              ].map(({ value, icon: Icon, label, desc, color }) => (
                <button
                  key={value}
                  onClick={() => {
                    setPrivacy(value);
                    setShowPrivacyOptions(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    privacy === value
                      ? `bg-${color}-50 border border-${color}-200`
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`w-5 h-5 text-${color}-500`} />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                  {privacy === value && (
                    <div
                      className={`ml-auto w-2 h-2 bg-${color}-500 rounded-full`}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={openCamera}
              className="flex items-center space-x-2 p-3 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors"
            >
              <Camera className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Câmera</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Image className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Galeria</span>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && mediaFiles.length === 0) || uploading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <Send className="w-5 h-5" />
            <span>{uploading ? "Publicando..." : "Publicar"}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
