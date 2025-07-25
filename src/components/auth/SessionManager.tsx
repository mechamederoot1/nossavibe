import React, { useEffect, useState, useCallback } from 'react';
import { Clock, LogOut, Shield } from 'lucide-react';

interface SessionManagerProps {
  user: any;
  onLogout: (expired?: boolean) => void;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const WARNING_TIME = 5 * 60 * 1000; // 5 minutos antes do timeout
const CHECK_INTERVAL = 60 * 1000; // Verificar a cada minuto

export const SessionManager: React.FC<SessionManagerProps> = ({
  user,
  onLogout,
}) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Atualizar última atividade
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Verificar inatividade
  const checkInactivity = useCallback(() => {
    if (!user) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    const timeUntilLogout = INACTIVITY_TIMEOUT - timeSinceActivity;

    if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
      // Sessão expirou
      onLogout(true);
      return;
    }

    if (timeUntilLogout <= WARNING_TIME && !showWarning) {
      // Mostrar aviso
      setShowWarning(true);
      setTimeRemaining(Math.ceil(timeUntilLogout / 1000));
    }

    if (showWarning) {
      setTimeRemaining(Math.ceil(timeUntilLogout / 1000));
    }
  }, [user, lastActivity, showWarning, onLogout]);

  // Estender sessão
  const extendSession = useCallback(() => {
    updateActivity();
    setShowWarning(false);
  }, [updateActivity]);

  // Configurar listeners de atividade
  useEffect(() => {
    if (!user) return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => updateActivity();

    // Adicionar listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Timer para verificar inatividade
    const timer = setInterval(checkInactivity, CHECK_INTERVAL);

    return () => {
      // Remover listeners
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(timer);
    };
  }, [user, updateActivity, checkInactivity]);

  // Formatação do tempo restante
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Sessão Expirando
            </h3>
            <p className="text-sm text-gray-600">
              Por motivos de segurança
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Sua sessão expirará em{' '}
            <span className="font-bold text-orange-600">
              {formatTime(timeRemaining)}
            </span>{' '}
            devido à inatividade.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Proteção de Segurança</p>
                <p>
                  Esta medida protege sua conta contra acesso não autorizado
                  quando você se afasta do dispositivo.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Clique em "Continuar Conectado" para estender sua sessão por mais 30
            minutos.
          </p>
        </div>

        {/* Botões */}
        <div className="flex space-x-3">
          <button
            onClick={extendSession}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continuar Conectado
          </button>
          <button
            onClick={() => onLogout(true)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${(timeRemaining / (WARNING_TIME / 1000)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
