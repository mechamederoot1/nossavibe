import React, { useState, useRef } from "react";
import {
  X,
  Image,
  Video,
  Smile,
  Type,
  Palette,
  Globe,
  Users,
  Lock,
  Mic,
  FileText,
  Upload,
  Loader,
  Trash2,
} from "lucide-react";

interface CreatePostModalProps {
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

export function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  userToken,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"post" | "testimonial">("post");
  const [privacy, setPrivacy] = useState("public");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [testimonialStyle, setTestimonialStyle] = useState({
    fontSize: "16",
    fontWeight: "normal",
    color: "#000000",
    backgroundColor: "#ffffff",
    textShadow: false,
    fontFamily: "Arial",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (
    files: FileList | null,
    type?: "image" | "video" | "audio",
  ) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;

        // Determine file type
        let fileType: "image" | "video" | "audio" | "document";
        if (type) {
          fileType = type;
        } else if (file.type.startsWith("image/")) {
          fileType = "image";
        } else if (file.type.startsWith("video/")) {
          fileType = "video";
        } else if (file.type.startsWith("audio/")) {
          fileType = "audio";
        } else {
          fileType = "document";
        }

        const mediaFile: MediaFile = {
          file,
          preview,
          type: fileType,
        };

        setMediaFiles((prev) => [...prev, mediaFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadMediaFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const mediaFile of mediaFiles) {
      const formData = new FormData();
      formData.append("file", mediaFile.file);

      try {
        const response = await fetch("http://localhost:8000/upload/media", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: formData,
        });

        if (response.ok) {
          const uploadData = await response.json();
          uploadedUrls.push(uploadData.file_path);
        } else {
          throw new Error(`Falha no upload: ${mediaFile.file.name}`);
        }
      } catch (error) {
        console.error("Erro no upload:", error);
        alert(`Erro ao enviar ${mediaFile.file.name}`);
        return [];
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      alert("Adicione conteúdo ou mídia ao post");
      return;
    }

    setUploading(true);

    try {
      let mediaData: any = null;

      // Upload media files if any
      if (mediaFiles.length > 0) {
        const uploadedUrls = await uploadMediaFiles();
        if (uploadedUrls.length === 0) {
          return; // Upload failed
        }

        mediaData = {
          urls: uploadedUrls,
          types: mediaFiles.map((f) => f.type),
          count: mediaFiles.length,
        };
      }

      let finalContent = content;

      if (postType === "testimonial") {
        const styles = {
          fontSize: testimonialStyle.fontSize + "px",
          fontWeight: testimonialStyle.fontWeight,
          color: testimonialStyle.color,
          backgroundColor: testimonialStyle.backgroundColor,
          fontFamily: testimonialStyle.fontFamily,
          textShadow: testimonialStyle.textShadow
            ? "2px 2px 4px rgba(0,0,0,0.5)"
            : "none",
        };

        finalContent = JSON.stringify({
          content: content,
          styles: styles,
        });
      } else {
        // Para posts normais, limpar HTML/estilos
        finalContent = content.replace(/<[^>]*>/g, "");
      }

      onSubmit(finalContent, postType, privacy, mediaData);

      // Reset form
      setContent("");
      setPostType("post");
      setPrivacy("public");
      setMediaFiles([]);
      onClose();
    } catch (error) {
      console.error("Erro ao criar post:", error);
      alert("Erro ao criar post");
    } finally {
      setUploading(false);
    }
  };

  const getPrivacyIcon = () => {
    switch (privacy) {
      case "public":
        return <Globe className="w-4 h-4" />;
      case "friends":
        return <Users className="w-4 h-4" />;
      case "private":
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getPrivacyLabel = () => {
    switch (privacy) {
      case "public":
        return "Público";
      case "friends":
        return "Amigos";
      case "private":
        return "Privado";
      default:
        return "Público";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {postType === "post" ? "Criar Post" : "Criar Depoimento"}
            </h2>
            <button
              onClick={onClose}
              disabled={uploading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Post Type Toggle */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setPostType("post")}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                postType === "post"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Post Normal</span>
            </button>
            <button
              onClick={() => setPostType("testimonial")}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                postType === "testimonial"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Depoimento</span>
            </button>
          </div>

          {/* Content Input */}
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === "post"
                  ? "No que você está pensando?"
                  : "Escreva seu depoimento..."
              }
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              disabled={uploading}
            />

            {postType === "testimonial" && content && (
              <div className="mt-4 p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-2">
                  Prévia do Depoimento:
                </h4>
                <div
                  style={{
                    fontSize: testimonialStyle.fontSize + "px",
                    fontWeight: testimonialStyle.fontWeight as any,
                    color: testimonialStyle.color,
                    backgroundColor: testimonialStyle.backgroundColor,
                    fontFamily: testimonialStyle.fontFamily,
                    textShadow: testimonialStyle.textShadow
                      ? "2px 2px 4px rgba(0,0,0,0.5)"
                      : "none",
                    padding: "12px",
                    borderRadius: "8px",
                    minHeight: "60px",
                  }}
                >
                  {content}
                </div>
              </div>
            )}
          </div>

          {/* Testimonial Style Controls */}
          {postType === "testimonial" && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Personalizar Estilo</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tamanho da Fonte
                  </label>
                  <select
                    value={testimonialStyle.fontSize}
                    onChange={(e) =>
                      setTestimonialStyle((prev) => ({
                        ...prev,
                        fontSize: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="12">Pequeno (12px)</option>
                    <option value="16">Normal (16px)</option>
                    <option value="20">Grande (20px)</option>
                    <option value="24">Muito Grande (24px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Peso da Fonte
                  </label>
                  <select
                    value={testimonialStyle.fontWeight}
                    onChange={(e) =>
                      setTestimonialStyle((prev) => ({
                        ...prev,
                        fontWeight: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Negrito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cor do Texto
                  </label>
                  <input
                    type="color"
                    value={testimonialStyle.color}
                    onChange={(e) =>
                      setTestimonialStyle((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cor de Fundo
                  </label>
                  <input
                    type="color"
                    value={testimonialStyle.backgroundColor}
                    onChange={(e) =>
                      setTestimonialStyle((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                      }))
                    }
                    className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={testimonialStyle.textShadow}
                    onChange={(e) =>
                      setTestimonialStyle((prev) => ({
                        ...prev,
                        textShadow: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm">Sombra no texto</span>
                </label>
              </div>
            </div>
          )}

          {/* Media Files Display */}
          {mediaFiles.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Arquivos Anexados</h4>
              <div className="grid grid-cols-2 gap-2">
                {mediaFiles.map((mediaFile, index) => (
                  <div key={index} className="relative">
                    {mediaFile.type === "image" ? (
                      <img
                        src={mediaFile.preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : mediaFile.type === "video" ? (
                      <video
                        src={mediaFile.preview}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          {mediaFile.type === "audio" ? (
                            <Mic className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          ) : (
                            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          )}
                          <p className="text-sm text-gray-600 truncate">
                            {mediaFile.file.name}
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => removeMediaFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Upload Buttons */}
          <div className="mb-4">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, "image")}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, "video")}
              className="hidden"
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files, "audio")}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
              >
                <Image className="w-4 h-4" />
                <span>Imagens</span>
              </button>

              <button
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
                <span>Vídeos</span>
              </button>

              <button
                onClick={() => audioInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
              >
                <Mic className="w-4 h-4" />
                <span>Áudios</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>Arquivos</span>
              </button>
            </div>
          </div>

          {/* Privacy Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Privacidade
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              disabled={uploading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">🌍 Público - Todos podem ver</option>
              <option value="friends">
                👥 Amigos - Apenas amigos podem ver
              </option>
              <option value="private">🔒 Privado - Apenas você pode ver</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {getPrivacyIcon()}
              <span>{getPrivacyLabel()}</span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  (!content.trim() && mediaFiles.length === 0) || uploading
                }
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Publicar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
