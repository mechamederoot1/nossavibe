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

  // Don't show anything if backend is online - users don't need to know
  if (isBackendOnline) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Only show when backend is offline */}
      {!isBackendOnline && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center space-x-2 mb-2">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Backend offline</span>
          </div>
          <div className="text-xs opacity-90 mb-2">
            O servidor Python não está rodando:<br/>
            • Stories não carregam imagens<br/>
            • Dados não são salvos no banco<br/>
            • Upload de arquivos indisponível
          </div>
          <div className="text-xs bg-red-600 p-2 rounded mb-2">
            <strong>Para corrigir:</strong><br/>
            Execute: <code>python3 start-backend.py</code>
          </div>
          <button
            onClick={checkBackendStatus}
            className="text-xs underline hover:no-underline"
          >
            ↻ Verificar novamente
          </button>
        </div>
      )}
    </div>
  );
};
