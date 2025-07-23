import React, { useState, useRef, useCallback } from "react";
import { X, RotateCw, Move, ZoomIn, ZoomOut, Check } from "lucide-react";

interface PhotoCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedFile: File) => void;
  imageFile: File;
  isRound?: boolean; // Para foto de perfil (redonda) ou capa (retangular)
  aspectRatio?: number; // Para capa personalizada
}

export function PhotoCropperModal({
  isOpen,
  onClose,
  onSave,
  imageFile,
  isRound = true,
  aspectRatio = isRound ? 1 : 16 / 9,
}: PhotoCropperModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);

      // Load image to get dimensions and reset position/scale
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

        // Reset position and scale for new image
        setPosition({ x: 0, y: 0 });
        setScale(1);
        setRotation(0);
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleSave = async () => {
    if (!containerRef.current || !imageRef.current) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set high quality output dimensions
      const outputSize = isRound ? 400 : 600;
      canvas.width = outputSize;
      canvas.height = isRound ? outputSize : outputSize / aspectRatio;

      // Create circular clipping path for profile pictures
      if (isRound) {
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      const img = new Image();
      img.onload = () => {
        ctx.save();

        // Get container dimensions
        const containerWidth = isRound ? 350 : 500;
        const containerHeight = isRound ? 350 : 250;

        // Calculate scale factor from container to output
        const scaleToOutput = outputSize / containerWidth;

        // Center the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Apply user transformations (rotation and zoom)
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        // Calculate how to fit the image proportionally
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const containerAspect = containerWidth / containerHeight;

        let fitWidth, fitHeight;
        if (imgAspect > containerAspect) {
          // Image is wider - fit to height
          fitHeight = containerHeight;
          fitWidth = fitHeight * imgAspect;
        } else {
          // Image is taller - fit to width
          fitWidth = containerWidth;
          fitHeight = fitWidth / imgAspect;
        }

        // Scale to output resolution
        fitWidth *= scaleToOutput;
        fitHeight *= scaleToOutput;

        // Apply position offsets (scaled to output size)
        const offsetX = (position.x * scaleToOutput) / scale;
        const offsetY = (position.y * scaleToOutput) / scale;

        // Draw the image centered with offsets
        ctx.drawImage(
          img,
          -fitWidth / 2 + offsetX,
          -fitHeight / 2 + offsetY,
          fitWidth,
          fitHeight,
        );

        ctx.restore();

        // Convert canvas to blob and create file
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File(
                [blob],
                `cropped_${imageFile.name}`,
                { type: "image/jpeg" },
              );
              onSave(croppedFile);
            }
          },
          "image/jpeg",
          0.95,
        );
      };

      img.src = imageUrl;
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold">
            {isRound ? "Ajustar Foto de Perfil" : "Ajustar Foto de Capa"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div
            ref={containerRef}
            className="relative mx-auto bg-gray-100 overflow-hidden mb-6"
            style={{
              width: isRound ? "350px" : "500px",
              height: isRound ? "350px" : "250px",
              borderRadius: isRound ? "50%" : "12px",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageUrl && imageSize.width && imageSize.height && (
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                className="absolute cursor-move select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: "center",
                  left: "50%",
                  top: "50%",
                  marginLeft: `-${Math.min(350, 250 * (imageSize.width / imageSize.height)) / 2}px`,
                  marginTop: `-${Math.min(250, 350 * (imageSize.height / imageSize.width)) / 2}px`,
                  width: isRound
                    ? imageSize.width > imageSize.height
                      ? "350px"
                      : "auto"
                    : imageSize.width > imageSize.height
                      ? "500px"
                      : "auto",
                  height: isRound
                    ? imageSize.height > imageSize.width
                      ? "350px"
                      : "auto"
                    : imageSize.height > imageSize.width
                      ? "250px"
                      : "auto",
                  maxWidth: isRound ? "350px" : "500px",
                  maxHeight: isRound ? "350px" : "250px",
                }}
                draggable={false}
              />
            )}

            {/* Overlay for non-round crops */}
            {!isRound && (
              <div className="absolute inset-0 border-2 border-dashed border-white opacity-50 pointer-events-none" />
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={handleZoomOut}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Diminuir zoom"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <button
              onClick={handleZoomIn}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <button
              onClick={handleRotate}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              title="Girar 90°"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
              <Move className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Arraste para mover</span>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="px-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom: {Math.round(scale * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
