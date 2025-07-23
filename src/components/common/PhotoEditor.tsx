import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  Save,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
} from "lucide-react";

interface PhotoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File;
  onSave: (editedFile: File, privacy?: string) => void;
  aspectRatio?: number; // For avatar: 1, for cover: 16/9
  title?: string;
  showPrivacyOptions?: boolean;
}

export function PhotoEditor({
  isOpen,
  onClose,
  imageFile,
  onSave,
  aspectRatio = 1,
  title = "Editar Foto",
  showPrivacyOptions = false,
}: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);

  // Editor state
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 300,
    height: 300,
  });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [showFilters, setShowFilters] = useState(false);

  // Privacy setting
  const [privacy, setPrivacy] = useState("public");

  useEffect(() => {
    if (isOpen && imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [isOpen, imageFile]);

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      setCanvasContext(ctx);

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setupCanvas(img, canvas, ctx);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  useEffect(() => {
    if (canvasContext && imageRef.current) {
      redrawCanvas();
    }
  }, [scale, rotation, position, brightness, contrast, saturation, cropArea]);

  const setupCanvas = (
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D | null,
  ) => {
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = aspectRatio === 1 ? 400 : 225; // 16:9 for cover photos

    // Calculate initial crop area
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = img.width / img.height;

    let cropWidth, cropHeight;
    if (imageAspect > canvasAspect) {
      cropHeight = img.height;
      cropWidth = cropHeight * canvasAspect;
    } else {
      cropWidth = img.width;
      cropHeight = cropWidth / canvasAspect;
    }

    setCropArea({
      x: (img.width - cropWidth) / 2,
      y: (img.height - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    });

    redrawCanvas();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvasContext;
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Center the canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply scale and position
    ctx.scale(scale, scale);
    ctx.translate(position.x, position.y);

    // Draw the cropped image
    ctx.drawImage(
      img,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height,
    );

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setPosition((prev) => ({
      x: prev.x + deltaX / scale,
      y: prev.y + deltaY / scale,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.1));
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleFlipHorizontal = () => {
    setScale((prev) => -prev);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create final canvas with correct dimensions
    const finalCanvas = document.createElement("canvas");
    const finalCtx = finalCanvas.getContext("2d");
    if (!finalCtx) return;

    // Set final dimensions (for avatar: 200x200, for cover: 800x450)
    finalCanvas.width = aspectRatio === 1 ? 200 : 800;
    finalCanvas.height = aspectRatio === 1 ? 200 : 450;

    // Draw the edited image to final canvas
    finalCtx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);

    // Convert to blob and create file
    finalCanvas.toBlob(
      (blob) => {
        if (blob) {
          const editedFile = new File([blob], imageFile.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          onSave(editedFile, privacy);
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Crop className="w-6 h-6 mr-2" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex">
          {/* Canvas Area */}
          <div className="flex-1 p-6 flex items-center justify-center bg-gray-50">
            <div className="relative">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`border border-gray-300 cursor-move bg-white shadow-lg ${
                  aspectRatio === 1 ? "rounded-full" : "rounded-lg"
                }`}
                style={{
                  maxWidth: "400px",
                  maxHeight: aspectRatio === 1 ? "400px" : "225px",
                }}
              />

              {/* Crop overlay */}
              <div
                className={`absolute inset-0 border-2 border-dashed border-blue-500 pointer-events-none ${
                  aspectRatio === 1 ? "rounded-full" : "rounded-lg"
                }`}
              />
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-80 p-6 border-l border-gray-200 bg-white">
            <div className="space-y-6">
              {/* Transform Controls */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Move className="w-4 h-4 mr-2" />
                  Transformar
                </h3>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={handleZoomIn}
                    className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ZoomIn className="w-4 h-4 mr-1" />
                    Zoom +
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ZoomOut className="w-4 h-4 mr-1" />
                    Zoom -
                  </button>
                  <button
                    onClick={handleRotateLeft}
                    className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Girar
                  </button>
                  <button
                    onClick={handleRotateRight}
                    className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    Girar
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">
                      Zoom: {scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      Rotação: {rotation}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-sm font-medium text-gray-900 mb-3 flex items-center w-full"
                >
                  <Sliders className="w-4 h-4 mr-2" />
                  Filtros
                  <span className="ml-auto">{showFilters ? "−" : "+"}</span>
                </button>

                {showFilters && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">
                        Brilho: {brightness}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={brightness}
                        onChange={(e) =>
                          setBrightness(parseInt(e.target.value))
                        }
                        className="w-full mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">
                        Contraste: {contrast}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">
                        Saturação: {saturation}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={saturation}
                        onChange={(e) =>
                          setSaturation(parseInt(e.target.value))
                        }
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy Options */}
              {showPrivacyOptions && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacidade da Foto
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">🌍 Público</option>
                    <option value="friends">👥 Amigos</option>
                    <option value="private">🔒 Privado</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Resetar
                </button>

                <button
                  onClick={handleSave}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </button>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
