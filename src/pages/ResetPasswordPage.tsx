import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, RefreshCw, Shield } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { passwordRecoveryService } from '../services/PasswordRecoveryService';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estados do componente
  const [step, setStep] = useState<'code' | 'password' | 'success'>('code');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [recoveryToken, setRecoveryToken] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Verificar se há token na URL (link direto do e-mail)
    const token = searchParams.get('token');
    if (token) {
      verifyTokenFromUrl(token);
    }

    // Recuperar e-mail da página anterior
    const storedEmail = localStorage.getItem('recoveryEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, [searchParams]);

  const verifyTokenFromUrl = async (token: string) => {
    setLoading(true);
    try {
      const response = await passwordRecoveryService.verifyRecoveryToken({ token });
      
      if (response.success) {
        setRecoveryToken(token);
        setEmail(response.email || '');
        setStep('password');
        setMessage('Token válido! Defina sua nova senha.');
        setMessageType('success');
      }
    } catch (error: any) {
      setMessage(error.message || 'Token inválido ou expirado');
      setMessageType('error');
      setStep('code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus próximo campo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verificar automaticamente quando todos os campos estiverem preenchidos
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (code?: string) => {
    const codeToVerify = code || verificationCode.join('');
    
    if (codeToVerify.length !== 6) {
      setMessage('Por favor, insira o código completo de 6 dígitos');
      setMessageType('error');
      return;
    }

    if (!email) {
      setMessage('E-mail é obrigatório');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await passwordRecoveryService.verifyRecoveryCode({
        email,
        code: codeToVerify
      });

      if (response.success) {
        setRecoveryToken(response.token || '');
        setStep('password');
        setMessage('Código verificado! Agora defina sua nova senha.');
        setMessageType('success');
      }
    } catch (error: any) {
      setMessage(error.message || 'Código inválido ou expirado');
      setMessageType('error');
      // Limpar código em caso de erro
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('As senhas não coincidem');
      setMessageType('error');
      return;
    }

    if (!recoveryToken) {
      setMessage('Token de recuperação inválido');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await passwordRecoveryService.completePasswordRecovery({
        token: recoveryToken,
        newPassword
      });

      if (response.success) {
        setStep('success');
        setMessage(response.message);
        setMessageType('success');
        
        // Limpar dados temporários
        localStorage.removeItem('recoveryEmail');
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error: any) {
      setMessage(error.message || 'Erro ao redefinir senha');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Página de sucesso
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Senha Redefinida!</h1>
          <p className="text-gray-600 mb-4">Sua senha foi alterada com sucesso.</p>
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
            <span>Redirecionando para o login</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2 mt-4">
            {step === 'code' ? 'Código de Recuperação' : 'Nova Senha'}
          </h1>
          <p className="text-gray-600">
            {step === 'code' 
              ? 'Digite o código de 6 dígitos enviado para seu e-mail'
              : 'Defina uma nova senha segura para sua conta'
            }
          </p>
        </div>

        {/* Security Notice */}
        {step === 'code' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Código enviado para:</p>
                <p className="font-mono">{email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-50 border border-green-200' :
            messageType === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-sm ${
              messageType === 'success' ? 'text-green-700' :
              messageType === 'error' ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* Código Step */}
        {step === 'code' && (
          <div>
            {/* E-mail Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="seu@email.com"
                disabled={loading}
                required
              />
            </div>

            {/* Código de Verificação */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Código de Recuperação
              </label>
              <div className="flex space-x-2 justify-center">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => inputRefs.current[index] = el}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    maxLength={1}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={() => verifyCode()}
              disabled={loading || verificationCode.some(digit => digit === '')}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </div>
              ) : (
                'Verificar Código'
              )}
            </button>
          </div>
        )}

        {/* Password Step */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nova senha (mín. 6 caracteres)"
                    disabled={loading}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Confirme a nova senha"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Redefinindo...</span>
                </div>
              ) : (
                '🔒 Redefinir Senha'
              )}
            </button>
          </form>
        )}

        {/* Back to Login / Previous Step */}
        <div className="pt-4 border-t border-gray-200 text-center">
          <button
            onClick={() => {
              if (step === 'password') {
                setStep('code');
                setMessage('');
              } else {
                navigate('/');
              }
            }}
            className="text-gray-600 hover:text-gray-700 text-sm flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>{step === 'password' ? 'Voltar ao código' : 'Voltar ao login'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
