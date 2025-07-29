import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface BackendStatusProps {
  className?: string;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ className = '' }) => {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [showStatus, setShowStatus] = useState(true);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        setIsBackendOnline(true);
        // Hide status after 3 seconds if backend is online
        setTimeout(() => setShowStatus(false), 3000);
      } else {
        setIsBackendOnline(false);
      }
    } catch (error) {
      console.warn('Backend não está respondendo:', error);
      setIsBackendOnline(false);
    }
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Don't show anything if we haven't checked yet
  if (isBackendOnline === null) return null;

  // Don't show if backend is online and we've decided to hide the status
  if (isBackendOnline && !showStatus) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {isBackendOnline ? (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Backend online</span>
        </div>
      ) : (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Backend offline</span>
          </div>
          <div className="text-xs opacity-90">
            • Stories podem não carregar imagens<br/>
            • Algumas funcionalidades limitadas
          </div>
          <button
            onClick={checkBackendStatus}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
};
