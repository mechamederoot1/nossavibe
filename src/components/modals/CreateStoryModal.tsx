import React, { useState } from "react";
import { X, Image, Video, Type, Music, Upload } from "lucide-react";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    mediaData?: any,
    storyDuration?: number,
    backgroundColor?: string,
  ) => void;
}

export function CreateStoryModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateStoryModalProps) {
  const [storyType, setStoryType] = useState<
    "text" | "photo" | "video" | "music"
  >("text");
  const [content, setContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#3B82F6");
  const [storyDuration, setStoryDuration] = useState(24);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  if (!isOpen) return null;

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
      // Convert file to base64 for storage
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

    onSubmit(content, mediaData, storyDuration, backgroundColor);

    // Reset form
    setContent("");
    setBackgroundColor("#3B82F6");
    setStoryDuration(24);
    setMediaFile(null);
    setMediaPreview(null);
    setStoryType("text");
    onClose();
  };

  const backgroundColors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Criar Story
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Tipo de Story */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              O que você quer postar?
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => setStoryType("text")}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  storyType === "text"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Type className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium">Texto</span>
              </button>

              <button
                onClick={() => setStoryType("photo")}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  storyType === "photo"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Image className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-600" />
                <span className="text-xs sm:text-sm font-medium">Foto</span>
              </button>

              <button
                onClick={() => setStoryType("video")}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  storyType === "video"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Video className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium">Vídeo</span>
              </button>

              <button
                onClick={() => setStoryType("music")}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  storyType === "music"
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Music className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-pink-600" />
                <span className="text-xs sm:text-sm font-medium">Música</span>
              </button>
            </div>
          </div>

          {/* Upload de Mídia */}
          {(storyType === "photo" ||
            storyType === "video" ||
            storyType === "music") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {storyType === "photo" && "Selecionar Foto"}
                {storyType === "video" && "Selecionar Vídeo"}
                {storyType === "music" && "Selecionar Música"}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
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
                  id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar{" "}
                    {storyType === "photo"
                      ? "uma foto"
                      : storyType === "video"
                        ? "um vídeo"
                        : "uma música"}
                  </p>
                </label>
              </div>

              {mediaPreview && storyType === "photo" && (
                <div className="mt-4 relative">
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {content && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 text-white p-2 rounded-lg max-w-xs text-center">
                        {content}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mediaPreview && storyType === "video" && (
                <div className="mt-4 relative">
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full h-48 rounded-lg"
                  />
                  {content && (
                    <div className="absolute top-2 left-2 right-2">
                      <div className="bg-black bg-opacity-50 text-white p-2 rounded-lg text-center">
                        {content}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mediaFile && storyType === "music" && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">📁 {mediaFile.name}</p>
                  {content && (
                    <div className="mt-2 p-2 bg-blue-100 rounded text-blue-800 text-sm">
                      {content}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Preview para texto */}
          {storyType === "text" && (
            <div className="relative">
              <div
                className="w-full h-64 rounded-lg flex items-center justify-center text-white text-center p-4"
                style={{ backgroundColor }}
              >
                <div className="text-lg font-medium">
                  {content || "Digite algo para ver o preview..."}
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {storyType === "text"
                ? "Conteúdo do Story"
                : "Legenda (opcional)"}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                storyType === "text"
                  ? "O que você quer compartilhar?"
                  : "Adicione uma legenda..."
              }
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Cor de Fundo (apenas para texto) */}
          {storyType === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Fundo
              </label>
              <div className="grid grid-cols-4 gap-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      backgroundColor === color
                        ? "border-gray-900 scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Duração */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração do Story
            </label>
            <select
              value={storyDuration}
              onChange={(e) => setStoryDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3 horas</option>
              <option value={6}>6 horas</option>
              <option value={12}>12 horas</option>
              <option value={24}>24 horas</option>
            </select>
          </div>
        </div>

        {/* Botões de Ação - Fixed at bottom */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
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
              className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
            >
              Publicar Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
