import React from 'react';
import { X, Download, Camera } from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl?: string;
  userName: string;
  isOwnProfile?: boolean;
  onChangePhoto?: () => void;
}

export function ProfilePhotoModal({
  isOpen,
  onClose,
  photoUrl,
  userName,
  isOwnProfile = false,
  onChangePhoto
}: ProfilePhotoModalProps) {
  if (!isOpen) return null;

  const getPhotoUrl = () => {
    if (!photoUrl) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3B82F6&color=fff&size=512`;
    }
    
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    
    return `http://localhost:8000${photoUrl}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getPhotoUrl();
    link.download = `${userName}_profile_photo.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="text-white">
          <h2 className="text-lg font-medium">Foto de perfil</h2>
          <p className="text-gray-300 text-sm">{userName}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
            title="Baixar foto"
          >
            <Download className="w-5 h-5" />
          </button>
          
          {isOwnProfile && (
            <button
              onClick={onChangePhoto}
              className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
              title="Alterar foto"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Photo */}
      <div className="relative max-w-2xl max-h-[80vh] w-full h-full flex items-center justify-center">
        <img
          src={getPhotoUrl()}
          alt={`Foto de perfil de ${userName}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}
