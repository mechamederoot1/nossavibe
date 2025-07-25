import React, { useState, useEffect } from "react";
import {
  X,
  Camera,
  Trash2,
  Download,
  Upload,
  Eye,
  Users,
  Lock,
  Image,
  Folder,
  Grid,
  Calendar,
  MoreHorizontal,
  Edit,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";

interface PhotoManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    avatar?: string;
    cover_photo?: string;
    token: string;
  };
  onPhotoUpdated: () => void;
  initialTab?: "profile" | "cover";
}

interface Photo {
  id: number;
  url: string;
  created_at: string;
  privacy: string;
  reactions_count: number;
  comments_count: number;
  shares_count: number;
}

interface Album {
  id: number;
  name: string;
  photo_count: number;
  cover_photo?: string;
  created_at: string;
}

export function PhotoManagementModal({
  isOpen,
  onClose,
  user,
  onPhotoUpdated,
  initialTab = "profile",
}: PhotoManagementModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "cover" | "albums">(
    initialTab,
  );
  const [profilePhotos, setProfilePhotos] = useState<Photo[]>([]);
  const [coverPhotos, setCoverPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAlbums();
      loadProfilePhotos();
      loadCoverPhotos();
    }
  }, [isOpen]);

  const loadAlbums = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${user.id}/albums`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error("Error loading albums:", error);
    }
  };

  const loadProfilePhotos = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${user.id}/albums/profile-photos`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setProfilePhotos(data.photos || []);
      }
    } catch (error) {
      console.error("Error loading profile photos:", error);
    }
  };

  const loadCoverPhotos = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${user.id}/albums/cover-photos`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCoverPhotos(data.photos || []);
      }
    } catch (error) {
      console.error("Error loading cover photos:", error);
    }
  };

  const deleteCurrentPhoto = async (type: "profile" | "cover") => {
    const photoUrl = type === "profile" ? user.avatar : user.cover_photo;
    if (!photoUrl) return;

    if (
      !confirm(
        `Tem certeza que deseja excluir sua foto de ${type === "profile" ? "perfil" : "capa"}?`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/profile/${type}/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.ok) {
        onPhotoUpdated();
        if (type === "profile") {
          loadProfilePhotos();
        } else {
          loadCoverPhotos();
        }
      } else {
        alert(
          `Erro ao excluir foto de ${type === "profile" ? "perfil" : "capa"}`,
        );
      }
    } catch (error) {
      console.error(`Error deleting ${type} photo:`, error);
      alert(
        `Erro ao excluir foto de ${type === "profile" ? "perfil" : "capa"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const setAsCurrentPhoto = async (photo: Photo, type: "profile" | "cover") => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/profile/${type}/set`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            photo_id: photo.id,
            photo_url: photo.url,
          }),
        },
      );

      if (response.ok) {
        onPhotoUpdated();
        alert(
          `Foto de ${type === "profile" ? "perfil" : "capa"} atualizada com sucesso!`,
        );
      } else {
        alert(
          `Erro ao definir foto de ${type === "profile" ? "perfil" : "capa"}`,
        );
      }
    } catch (error) {
      console.error(`Error setting ${type} photo:`, error);
      alert(
        `Erro ao definir foto de ${type === "profile" ? "perfil" : "capa"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const deletePhotoFromAlbum = async (
    photoId: number,
    type: "profile" | "cover",
  ) => {
    if (!confirm("Tem certeza que deseja excluir esta foto do álbum?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/photos/${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        if (type === "profile") {
          loadProfilePhotos();
        } else {
          loadCoverPhotos();
        }
        loadAlbums();
      } else {
        alert("Erro ao excluir foto");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Erro ao excluir foto");
    } finally {
      setLoading(false);
    }
  };

  const renderPhotoGrid = (photos: Photo[], type: "profile" | "cover") => {
    const currentPhotoUrl = type === "profile" ? user.avatar : user.cover_photo;

    return (
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo) => {
          const isCurrentPhoto = currentPhotoUrl?.includes(
            photo.url.split("/").pop() || "",
          );

          return (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={photo.url}
                  alt="Foto"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setShowPhotoViewer(true);
                  }}
                />
              </div>

              {/* Current Photo Indicator */}
              {isCurrentPhoto && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Atual
                </div>
              )}

              {/* Photo Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  {!isCurrentPhoto && (
                    <button
                      onClick={() => setAsCurrentPhoto(photo, type)}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      title={`Definir como foto de ${type === "profile" ? "perfil" : "capa"}`}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setShowPhotoViewer(true);
                    }}
                    className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePhotoFromAlbum(photo.id, type)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Photo Stats */}
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{photo.reactions_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{photo.comments_count}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Gerenciar Fotos
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Fotos do Perfil</span>
              </button>
              <button
                onClick={() => setActiveTab("cover")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "cover"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Image className="w-4 h-4" />
                <span>Fotos de Capa</span>
              </button>
              <button
                onClick={() => setActiveTab("albums")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "albums"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>Álbuns</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Profile Photos Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Current Photo Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      Foto Atual do Perfil
                    </h3>
                    {user.avatar && (
                      <button
                        onClick={() => deleteCurrentPhoto("profile")}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={
                            user.avatar.startsWith("http")
                              ? user.avatar
                              : `http://localhost:8000${user.avatar}`
                          }
                          alt="Foto atual do perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">
                        {user.avatar
                          ? "Esta é sua foto de perfil atual"
                          : "Você não tem uma foto de perfil definida"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Escolha uma das fotos abaixo ou adicione uma nova
                      </p>
                    </div>
                  </div>
                </div>

                {/* Photos Grid */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">
                    Álbum "Fotos do Perfil" ({profilePhotos.length} fotos)
                  </h3>
                  {profilePhotos.length > 0 ? (
                    renderPhotoGrid(profilePhotos, "profile")
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma foto de perfil anterior encontrada</p>
                      <p className="text-sm mt-1">
                        Suas fotos de perfil aparecerão aqui automaticamente
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cover Photos Tab */}
            {activeTab === "cover" && (
              <div className="space-y-6">
                {/* Current Cover Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      Foto de Capa Atual
                    </h3>
                    {user.cover_photo && (
                      <button
                        onClick={() => deleteCurrentPhoto("cover")}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                      {user.cover_photo ? (
                        <img
                          src={
                            user.cover_photo.startsWith("http")
                              ? user.cover_photo
                              : `http://localhost:8000${user.cover_photo}`
                          }
                          alt="Foto atual de capa"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">
                        {user.cover_photo
                          ? "Esta é sua foto de capa atual"
                          : "Você não tem uma foto de capa definida"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Escolha uma das fotos abaixo ou adicione uma nova
                      </p>
                    </div>
                  </div>
                </div>

                {/* Photos Grid */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">
                    Álbum "Fotos de Capa" ({coverPhotos.length} fotos)
                  </h3>
                  {coverPhotos.length > 0 ? (
                    renderPhotoGrid(coverPhotos, "cover")
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma foto de capa anterior encontrada</p>
                      <p className="text-sm mt-1">
                        Suas fotos de capa aparecerão aqui automaticamente
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Albums Tab */}
            {activeTab === "albums" && (
              <div className="space-y-6">
                <h3 className="font-medium text-gray-900">Todos os Álbuns</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                        {album.cover_photo ? (
                          <img
                            src={album.cover_photo}
                            alt={album.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Folder className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 truncate">
                        {album.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {album.photo_count} fotos
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(album.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>

                {albums.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum álbum encontrado</p>
                    <p className="text-sm mt-1">
                      Álbuns serão criados automaticamente quando você adicionar
                      fotos
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {showPhotoViewer && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60]">
          <div className="w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setShowPhotoViewer(false)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={selectedPhoto.url}
              alt="Foto"
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Foto de {activeTab === "profile" ? "Perfil" : "Capa"}
                  </p>
                  <p className="text-sm text-gray-300">
                    {new Date(selectedPhoto.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{selectedPhoto.reactions_count}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{selectedPhoto.comments_count}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                    <span>{selectedPhoto.shares_count}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
