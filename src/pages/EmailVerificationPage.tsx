import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, Clock, RefreshCw, Edit3, ArrowLeft } from 'lucide-react';
import { emailVerificationService } from '../services/EmailVerificationService';

interface VerificationResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  cooldownMs?: number;
  retryAfter?: number;
}

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false); // Começa como false
  const [hasTriedSending, setHasTriedSending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Dados do usuário
  const [userData, setUserData] = useState({
    id: null,
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    // Verificar se há token na URL (verificação automática via link do e-mail)
    const token = searchParams.get('token');
    if (token) {
      console.log('🔗 Token found in URL, verifying automatically...');
      verifyWithToken(token);
    }

    // Recuperar dados do usuário do localStorage
    const pendingUser = localStorage.getItem('pendingVerificationUser');
    const storedEmail = localStorage.getItem('pendingVerificationEmail');

    console.log('📦 Checking localStorage data:');
    console.log('  - pendingUser:', !!pendingUser);
    console.log('  - storedEmail:', storedEmail);

    if (pendingUser) {
      // Usuário recém-registrado
      try {
        const user = JSON.parse(pendingUser);
        console.log('👤 User data loaded:', user);
        setUserData(user);
        setEmail(user.email || storedEmail || '');
        setNewEmail(user.email || storedEmail || '');
        
        // Tentar enviar código automaticamente na primeira vez
        if (user.id && (user.email || storedEmail)) {
          console.log('📧 Attempting to send initial verification code...');
          sendInitialVerificationCode(user);
        } else {
          console.warn('⚠️ Missing user ID or email for verification');
        }
      } catch (parseError) {
        console.error('❌ Error parsing user data from localStorage:', parseError);
        setMessage('Erro ao carregar dados do usuário. Tente fazer login novamente.');
        setMessageType('error');
      }
    } else {
      console.warn('⚠️ No pending user data found in localStorage');
      setMessage('Nenhum usuário pendente encontrado. Faça o cadastro novamente.');
      setMessageType('error');
    }
  }, [searchParams]);

  useEffect(() => {
    // Gerenciar countdown para reenvio
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const sendInitialVerificationCode = async (user: any) => {
    if (hasTriedSending) return;
    
    try {
      setHasTriedSending(true);
      console.log('📧 Enviando código inicial de verificação...');
      console.log('📋 User data for verification:', {
        email: user.email,
        firstName: user.firstName,
        userId: user.id
      });
      
      // Try the backend email verification service first
      const response = await fetch('http://localhost:8000/email-verification/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          first_name: user.firstName,
          user_id: user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Verification email sent via backend:', data);
        setMessage('Código de verificação enviado para seu e-mail!');
        setMessageType('success');
        setCountdown(60); // 1 minuto de cooldown
        setCanResend(false);
      } else {
        const errorData = await response.json();
        console.error('❌ Backend email service failed:', errorData);
        
        // Fallback to external email service
        console.log('🔄 Trying external email service...');
        await tryExternalEmailService(user);
      }
    } catch (error: any) {
      console.error('❌ Erro ao enviar código inicial:', error);
      
      // Fallback to external email service
      console.log('🔄 Trying external email service as fallback...');
      await tryExternalEmailService(user);
    }
  };

  const tryExternalEmailService = async (user: any) => {
    try {
      const response = await fetch('http://localhost:3001/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          firstName: user.firstName,
          userId: user.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Verification email sent via external service:', data);
        setMessage('Código de verificação enviado para seu e-mail!');
        setMessageType('success');
        setCountdown(60);
        setCanResend(false);
      } else {
        const errorData = await response.json();
        console.error('❌ External email service also failed:', errorData);
        setMessage('Erro ao enviar código. Clique em "Reenviar código" para tentar novamente.');
        setMessageType('error');
        setCanResend(true);
      }
    } catch (externalError) {
      console.error('❌ External email service error:', externalError);
      setMessage('Serviço de e-mail temporariamente indisponível. Clique em "Reenviar código" para tentar novamente.');
      setMessageType('error');
      setCanResend(true);
    }
  };

  const verifyWithToken = async (token: string) => {
    setLoading(true);
    try {
      const response = await emailVerificationService.verifyToken({ token });
      
      if (response.success) {
        setIsVerified(true);
        setMessage('E-mail verificado com sucesso! Redirecionando...');
        setMessageType('success');
        
        // Auto login e redirecionamento
        handleSuccessfulVerification();
      }
    } catch (error: any) {
      setMessage(error.message || 'Erro ao verificar token');
      setMessageType('error');
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

    setLoading(true);
    try {
      const response = await emailVerificationService.verifyCode({
        userId: userData.id,
        code: codeToVerify
      });

      if (response.success) {
        setIsVerified(true);
        setMessage('E-mail verificado com sucesso! Redirecionando...');
        setMessageType('success');

        // Auto login e redirecionamento
        handleSuccessfulVerification();
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

  const handleSuccessfulVerification = async () => {
    console.log('🎉 E-mail verificado! Iniciando login automático...');

    // Limpar dados temporários e fazer login automático
    const pendingUser = localStorage.getItem('pendingVerificationUser');
    if (pendingUser) {
      const user = JSON.parse(pendingUser);
      const pendingPassword = localStorage.getItem('pendingPassword');

      console.log('👤 Dados do usuário pendente:', { email: user.email, hasPassword: !!pendingPassword });

      // Fazer login automático
      if (pendingPassword) {
        try {
          console.log('🔄 Tentando login automático...');
          const loginResponse = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              password: pendingPassword,
            }),
          });

          console.log(`📊 Status do login: ${loginResponse.status}`);

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login automático bem-sucedido!', loginData);
            localStorage.setItem('token', loginData.access_token);

            // Limpar dados pendentes
            localStorage.removeItem('pendingVerificationUser');
            localStorage.removeItem('pendingVerificationEmail');
            localStorage.removeItem('pendingPassword');

            // Redirecionar imediatamente após login bem-sucedido
            console.log('🚀 Redirecionando para página principal...');
            window.location.href = '/';
            return; // Sair da função para evitar delay desnecessário

          } else {
            const errorText = await loginResponse.text();
            console.error('❌ Login automático falhou:', errorText);
            setMessage('E-mail verificado, mas erro no login automático. Faça login manualmente.');
            setMessageType('warning');

            // Se login falhou, redirecionar para tela de login após delay
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          }
        } catch (error) {
          console.error('❌ Erro no login automático:', error);
          setMessage('E-mail verificado, mas erro de conexão. Faça login manualmente.');
          setMessageType('warning');

          // Se houve erro, redirecionar para tela de login após delay
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      } else {
        console.log('⚠️ Senha pendente não encontrada');
        setMessage('E-mail verificado! Faça login com suas credenciais.');
        setMessageType('success');

        // Limpar dados mesmo assim
        localStorage.removeItem('pendingVerificationUser');
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('pendingPassword');

        // Redirecionar para tela de login
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } else {
      console.log('⚠️ Dados de usuário pendente não encontrados');
      setMessage('E-mail verificado! Faça login com suas credenciais.');
      setMessageType('success');

      // Redirecionar para tela de login
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  };

  const resendCode = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    try {
      const emailToUse = editingEmail ? newEmail : email;
      console.log('📧 Resending verification code to:', emailToUse);
      
      // Try backend service first
      const response = await fetch('http://localhost:8000/email-verification/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToUse,
          first_name: userData.firstName,
          user_id: userData.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Code resent successfully:', data);
        setMessage('Novo código enviado com sucesso!');
        setMessageType('success');
        setCountdown(60); // 1 minuto de cooldown
        setCanResend(false);
        
        // Se estava editando e-mail, confirmar a mudança
        if (editingEmail) {
          setEmail(emailToUse);
          setEditingEmail(false);
          localStorage.setItem('pendingVerificationEmail', emailToUse);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Backend resend failed:', errorData);
        
        // Try external service
        await tryExternalResend(emailToUse);
      }
    } catch (error: any) {
      console.error('❌ Error during resend:', error);
      await tryExternalResend(editingEmail ? newEmail : email);
    } finally {
      setResendLoading(false);
    }
  };

  const tryExternalResend = async (emailToUse: string) => {
    try {
      const response = await fetch('http://localhost:3001/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToUse,
          firstName: userData.firstName,
          userId: userData.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ External resend successful:', data);
        setMessage('Novo código enviado com sucesso!');
        setMessageType('success');
        setCountdown(60);
        setCanResend(false);
        
        if (editingEmail) {
          setEmail(emailToUse);
          setEditingEmail(false);
          localStorage.setItem('pendingVerificationEmail', emailToUse);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ External resend failed:', errorData);
        setMessage(errorData.message || 'Erro ao reenviar código');
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('❌ External resend error:', error);
      setMessage('Erro ao reenviar código');
      setMessageType('error');
    }
  };

  const updateEmail = () => {
    if (!newEmail || newEmail === email) {
      setEditingEmail(false);
      return;
    }

    // Validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setMessage('Por favor, insira um e-mail válido');
      setMessageType('error');
      return;
    }

    resendCode(); // Enviará para o novo e-mail
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">E-mail Verificado!</h1>
          <p className="text-gray-600 mb-4">Seu e-mail foi confirmado com sucesso.</p>
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
            <span>Redirecionando</span>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Confirme seu E-mail</h1>
          <p className="text-gray-600">
            Confirme seu endereço de e-mail.
          </p>
        </div>

        {/* E-mail Section */}
        <div className="mb-6">
          {editingEmail ? (
            <div className="space-y-3">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Novo e-mail"
              />
              <div className="flex space-x-2">
                <button
                  onClick={updateEmail}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    setEditingEmail(false);
                    setNewEmail(email);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <span className="text-gray-800 font-medium">{email}</span>
              <button
                onClick={() => setEditingEmail(true)}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Editar e-mail"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Verification Code */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Código de Verificação
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
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={1}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            messageType === 'success' ? 'bg-green-100 text-green-700' :
            messageType === 'error' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={() => verifyCode()}
          disabled={loading || verificationCode.some(digit => digit === '')}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verificando...</span>
            </div>
          ) : (
            'Verificar E-mail'
          )}
        </button>

        {/* Resend Section */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Não recebeu o código?</p>
          
          {canResend ? (
            <button
              onClick={resendCode}
              disabled={resendLoading}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
            >
              {resendLoading ? (
                <span className="flex items-center justify-center space-x-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Enviando...</span>
                </span>
              ) : (
                'Reenviar código'
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {countdown > 0 ? `Reenviar em ${countdown}s` : 'Preparando...'}
              </span>
            </div>
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
};

export default EmailVerificationPage;
