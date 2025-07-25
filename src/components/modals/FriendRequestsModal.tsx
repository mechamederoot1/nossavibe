import React from 'react';
import { X } from 'lucide-react';
import { FriendRequestNotifications } from '../notifications/FriendRequestNotifications';

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToken: string;
  onRequestHandled?: () => void;
  currentUserId?: number;
}

export const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({
  isOpen,
  onClose,
  userToken,
  onRequestHandled,
  currentUserId = 0
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Solicitações de Amizade
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <FriendRequestNotifications
          userToken={userToken}
          currentUserId={currentUserId}
          onRequestHandled={onRequestHandled}
          onUserProfileClick={(userId) => {
            console.log("View profile:", userId);
            // Could open profile modal or navigate to profile
          }}
          showAsDropdown={false}
        />
      </div>
    </div>
  );
};
