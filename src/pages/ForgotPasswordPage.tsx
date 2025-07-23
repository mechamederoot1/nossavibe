import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Shield, Clock, CheckCircle } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { passwordRecoveryService } from '../services/PasswordRecoveryService';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Por favor, insira seu e-mail');
      setMessageType('error');
      return;
    }

    // Validar formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Por favor, insira um e-mail válido');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await passwordRecoveryService.sendPasswordRecovery({ email });
      
      if (response.success) {
        setIsSubmitted(true);
        setMessage(response.message);
        setMessageType('success');
        
        // Salvar e-mail para usar na próxima página
        localStorage.setItem('recoveryEmail', email);
        
        // Iniciar countdown se houver cooldown
        if (response.cooldownMs) {
          setCountdown(Math.ceil(response.cooldownMs / 1000));
          const interval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } catch (error: any) {
      setMessage(error.message || 'Erro ao enviar e-mail de recuperação');
      setMessageType('error');
      
      if (error.retryAfter) {
        setCountdown(Math.ceil(error.retryAfter / 1000));
        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setMessage('');
    setCountdown(0);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">E-mail Enviado!</h1>
            <p className="text-gray-600">
              Verifique sua caixa de entrada
            </p>
          </div>

          {/* Success Message */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm text-center">{message}</p>
          </div>

          {/* E-mail Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <Mail className="w-4 h-4" />
              <span className="font-medium">{email}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="text-red-500 font-bold">1.</span>
              <span>Verifique sua caixa de entrada</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-red-500 font-bold">2.</span>
              <span>Se não encontrar, verifique a pasta de spam</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-red-500 font-bold">3.</span>
              <span>Use o código de 6 dígitos ou clique no link</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/reset-password')}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Já tenho o código
            </button>

            {countdown > 0 ? (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Reenviar em {Math.ceil(countdown / 60)}min {countdown % 60}s</span>
              </div>
            ) : (
              <button
                onClick={handleResend}
                className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Reenviar e-mail
              </button>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-700 text-sm flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Voltar ao login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" showText={true} />
          <h1 className="text-2xl font-bold text-gray-800 mb-2 mt-4">Esqueceu sua senha?</h1>
          <p className="text-gray-600">
            Digite seu e-mail e enviaremos instruções para redefinir sua senha
          </p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Processo seguro</p>
              <p>Enviaremos um código temporário válido por 15 minutos para seu e-mail.</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {message && messageType === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço de e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="seu@email.com"
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || countdown > 0}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </div>
            ) : countdown > 0 ? (
              `Aguarde ${Math.ceil(countdown / 60)}min ${countdown % 60}s`
            ) : (
              '🔑 Enviar código de recuperação'
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-700 text-sm flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Voltar ao login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
