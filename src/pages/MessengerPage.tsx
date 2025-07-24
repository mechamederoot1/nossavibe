import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { MessagesModal } from "../components/modals/MessagesModal";

interface MessengerPageProps {
  user: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    token: string;
  };
}

export const MessengerPage: React.FC<MessengerPageProps> = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    // Auto-open the messages modal when page loads
    setIsModalOpen(true);
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
    // Navigate back to previous page or home
    window.history.back() || (window.location.href = "/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => window.history.back() || (window.location.href = "/")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Messenger</h1>
          </div>
        </div>
      </header>

      {/* Main Content - Full screen messenger */}
      <div className="h-[calc(100vh-4rem)]">
        <MessagesModal
          isOpen={isModalOpen}
          onClose={handleClose}
          user={user}
        />
      </div>
    </div>
  );
};
