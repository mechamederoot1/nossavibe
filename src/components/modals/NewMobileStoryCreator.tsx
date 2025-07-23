import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Type,
  UserPlus,
  Edit3,
  Send,
  Eye,
  Users,
  Lock,
  Clock,
  Palette,
  Undo,
  Redo,
  Download,
} from "lucide-react";

interface NewMobileStoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    mediaData?: any,
    storyDuration?: number,
    backgroundColor?: string,
    privacy?: string,
    overlays?: any[],
  ) => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: string;
  backgroundColor?: string;
}

interface UserTag {
  id: string;
  username: string;
  x: number;
  y: number;
}

interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  thickness: number;
}

export function NewMobileStoryCreator({
  isOpen,
  onClose,
  onSubmit,
}: NewMobileStoryCreatorProps) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<
    "view" | "draw" | "text" | "tag"
  >("view");

  // Story settings
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">(
    "public",
  );
  const [duration, setDuration] = useState(24); // hours
  const [backgroundColor, setBackgroundColor] = useState("#667eea");

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [drawThickness, setDrawThickness] = useState(3);

  // Text overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [newTextContent, setNewTextContent] = useState("");

  // User tags
  const [userTags, setUserTags] = useState<UserTag[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [pendingTagPosition, setPendingTagPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyContainerRef = useRef<HTMLDivElement>(null);

  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
    "#000000",
    "#FFFFFF",
  ];

  const backgroundGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  ];

  // Initialize canvas for drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && mediaPreview) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [mediaPreview, activeMode]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCanvasTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    if (activeMode === "draw") {
      if (e.type === "touchstart") {
        setIsDrawing(true);
        setCurrentPath([{ x, y }]);
      } else if (e.type === "touchmove" && isDrawing) {
        setCurrentPath((prev) => [...prev, { x, y }]);
      } else if (e.type === "touchend") {
        if (currentPath.length > 0) {
          setDrawingPaths((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              points: currentPath,
              color: drawColor,
              thickness: drawThickness,
            },
          ]);
        }
        setIsDrawing(false);
        setCurrentPath([]);
      }
    } else if (activeMode === "text") {
      // Add text at touched position
      setNewTextContent("");
      setShowTextEditor(true);
      setSelectedTextId(null);
      setPendingTagPosition({ x, y });
    } else if (activeMode === "tag") {
      // Add user tag at touched position
      setPendingTagPosition({ x, y });
      setShowUserSearch(true);
    }
  };

  const addTextOverlay = () => {
    if (newTextContent.trim() && pendingTagPosition) {
      const newOverlay: TextOverlay = {
        id: Date.now().toString(),
        text: newTextContent,
        x: pendingTagPosition.x,
        y: pendingTagPosition.y,
        fontSize: 24,
        color: "#FFFFFF",
        fontWeight: "bold",
      };
      setTextOverlays((prev) => [...prev, newOverlay]);
      setNewTextContent("");
      setShowTextEditor(false);
      setPendingTagPosition(null);
      setActiveMode("view");
    }
  };

  const addUserTag = (username: string) => {
    if (pendingTagPosition) {
      const newTag: UserTag = {
        id: Date.now().toString(),
        username,
        x: pendingTagPosition.x,
        y: pendingTagPosition.y,
      };
      setUserTags((prev) => [...prev, newTag]);
      setShowUserSearch(false);
      setUserSearchQuery("");
      setPendingTagPosition(null);
      setActiveMode("view");
    }
  };

  const clearDrawings = () => {
    setDrawingPaths([]);
    setCurrentPath([]);
  };

  const handleSubmit = async () => {
    const overlays = [
      ...textOverlays.map((overlay) => ({ type: "text", ...overlay })),
      ...userTags.map((tag) => ({ type: "user_tag", ...tag })),
      ...drawingPaths.map((path) => ({ type: "drawing", ...path })),
    ];

    let mediaData = null;
    if (mediaFile) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(mediaFile);
      });

      mediaData = {
        type: mediaFile.type.startsWith("video/") ? "video" : "image",
        url: base64,
        file: mediaFile,
        fileName: mediaFile.name,
        fileSize: mediaFile.size,
      };
    }

    onSubmit("", mediaData, duration, backgroundColor, privacy, overlays);
    handleClose();
  };

  const handleClose = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setActiveMode("view");
    setTextOverlays([]);
    setUserTags([]);
    setDrawingPaths([]);
    setCurrentPath([]);
    setShowTextEditor(false);
    setShowUserSearch(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm absolute top-0 left-0 right-0 z-20">
        <button onClick={handleClose} className="p-2 rounded-full bg-black/40">
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              setPrivacy(
                privacy === "public"
                  ? "friends"
                  : privacy === "friends"
                    ? "private"
                    : "public",
              )
            }
            className="flex items-center space-x-1 px-3 py-1 bg-black/40 rounded-full"
          >
            {privacy === "public" && <Eye className="w-4 h-4 text-white" />}
            {privacy === "friends" && <Users className="w-4 h-4 text-white" />}
            {privacy === "private" && <Lock className="w-4 h-4 text-white" />}
            <span className="text-white text-sm">
              {privacy === "public"
                ? "Público"
                : privacy === "friends"
                  ? "Amigos"
                  : "Privado"}
            </span>
          </button>
          <button
            onClick={() =>
              setDuration(
                duration === 24
                  ? 12
                  : duration === 12
                    ? 6
                    : duration === 6
                      ? 3
                      : 24,
              )
            }
            className="flex items-center space-x-1 px-3 py-1 bg-black/40 rounded-full"
          >
            <Clock className="w-4 h-4 text-white" />
            <span className="text-white text-sm">{duration}h</span>
          </button>
        </div>
      </div>

      {/* Main Story Area */}
      <div
        ref={storyContainerRef}
        className="flex-1 relative overflow-hidden"
        style={{ background: mediaPreview ? "transparent" : backgroundColor }}
      >
        {/* Background Media */}
        {mediaPreview && (
          <div className="absolute inset-0">
            {mediaFile?.type.startsWith("video/") ? (
              <video
                src={mediaPreview}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
              />
            ) : (
              <img
                src={mediaPreview}
                alt="Story background"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            pointerEvents: activeMode === "draw" ? "auto" : "none",
            touchAction: "none",
          }}
          onTouchStart={handleCanvasTouch}
          onTouchMove={handleCanvasTouch}
          onTouchEnd={handleCanvasTouch}
        />

        {/* Touch Area for Text and Tags */}
        {(activeMode === "text" || activeMode === "tag") && (
          <div
            className="absolute inset-0 w-full h-full"
            onTouchStart={handleCanvasTouch}
          />
        )}

        {/* Text Overlays */}
        {textOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              fontSize: `${overlay.fontSize}px`,
              color: overlay.color,
              fontWeight: overlay.fontWeight,
              backgroundColor: overlay.backgroundColor,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            {overlay.text}
          </div>
        ))}

        {/* User Tags */}
        {userTags.map((tag) => (
          <div
            key={tag.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white px-2 py-1 rounded-full text-sm pointer-events-none"
            style={{
              left: `${tag.x}%`,
              top: `${tag.y}%`,
            }}
          >
            @{tag.username}
          </div>
        ))}

        {/* Drawing Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {drawingPaths.map((path) => (
            <polyline
              key={path.id}
              points={path.points
                .map(
                  (p) =>
                    `${(p.x / 100) * (storyContainerRef.current?.offsetWidth || 0)},${(p.y / 100) * (storyContainerRef.current?.offsetHeight || 0)}`,
                )
                .join(" ")}
              stroke={path.color}
              strokeWidth={path.thickness}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Current drawing path */}
          {isDrawing && currentPath.length > 1 && (
            <polyline
              points={currentPath
                .map(
                  (p) =>
                    `${(p.x / 100) * (storyContainerRef.current?.offsetWidth || 0)},${(p.y / 100) * (storyContainerRef.current?.offsetHeight || 0)}`,
                )
                .join(" ")}
              stroke={drawColor}
              strokeWidth={drawThickness}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>

      {/* Bottom Tools */}
      <div className="bg-black/80 backdrop-blur-sm p-4 space-y-4">
        {/* Mode Selection */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center space-y-1 p-3 rounded-xl bg-white/20"
          >
            <Camera className="w-6 h-6 text-white" />
            <span className="text-xs text-white">Foto</span>
          </button>

          <button
            onClick={() =>
              setActiveMode(activeMode === "draw" ? "view" : "draw")
            }
            className={`flex flex-col items-center space-y-1 p-3 rounded-xl ${
              activeMode === "draw" ? "bg-blue-500" : "bg-white/20"
            }`}
          >
            <Edit3 className="w-6 h-6 text-white" />
            <span className="text-xs text-white">Rabiscar</span>
          </button>

          <button
            onClick={() =>
              setActiveMode(activeMode === "text" ? "view" : "text")
            }
            className={`flex flex-col items-center space-y-1 p-3 rounded-xl ${
              activeMode === "text" ? "bg-blue-500" : "bg-white/20"
            }`}
          >
            <Type className="w-6 h-6 text-white" />
            <span className="text-xs text-white">Texto</span>
          </button>

          <button
            onClick={() => setActiveMode(activeMode === "tag" ? "view" : "tag")}
            className={`flex flex-col items-center space-y-1 p-3 rounded-xl ${
              activeMode === "tag" ? "bg-blue-500" : "bg-white/20"
            }`}
          >
            <UserPlus className="w-6 h-6 text-white" />
            <span className="text-xs text-white">Marcar</span>
          </button>
        </div>

        {/* Drawing Tools */}
        {activeMode === "draw" && (
          <div className="space-y-3">
            <div className="flex justify-center space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setDrawColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    drawColor === color ? "border-white" : "border-gray-400"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={clearDrawings}
                className="px-4 py-2 bg-red-500/80 rounded-lg text-white text-sm"
              >
                Limpar
              </button>
            </div>
          </div>
        )}

        {/* Background Selection */}
        {!mediaPreview && (
          <div className="flex justify-center space-x-2 overflow-x-auto">
            {backgroundGradients.map((gradient, index) => (
              <button
                key={index}
                onClick={() => setBackgroundColor(gradient)}
                className="w-12 h-8 rounded border-2 border-white/20 flex-shrink-0"
                style={{ background: gradient }}
              />
            ))}
          </div>
        )}

        {/* Publish Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center space-x-2"
        >
          <Send className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Publicar Story</span>
        </button>
      </div>

      {/* Text Editor Modal */}
      {showTextEditor && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Adicionar Texto</h3>
            <textarea
              value={newTextContent}
              onChange={(e) => setNewTextContent(e.target.value)}
              placeholder="Digite seu texto..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
              autoFocus
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {newTextContent.length}/100
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTextEditor(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={addTextOverlay}
                  disabled={!newTextContent.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Marcar Amigo</h3>
            <input
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Digite o nome do usuário..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {/* Mock user list - replace with actual search */}
              {["joao123", "maria_silva", "pedro_santos"]
                .filter((user) =>
                  user.toLowerCase().includes(userSearchQuery.toLowerCase()),
                )
                .map((user) => (
                  <button
                    key={user}
                    onClick={() => addUserTag(user)}
                    className="w-full text-left p-3 hover:bg-gray-100 rounded-lg"
                  >
                    @{user}
                  </button>
                ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowUserSearch(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
