import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Logo } from "../ui/Logo";
import { emailVerificationService } from "../../services/EmailVerificationService";
import { mockAuthService } from "../../services/MockAuthService";

interface AuthProps {
  onLogin: (userData: { name: string; email: string; token: string }) => void;
}

export function SimpleAuth({ onLogin }: AuthProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "teste@mail.com",
    password: "12345678",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Função para login rápido de desenvolvimento
  const handleQuickLogin = async () => {
    console.log("🚀 Quick dev login triggered");
    setLoading(true);
    setError("");

    try {
      const mockResult = await mockAuthService.mockLogin("dev@test.com", "123456");
      console.log("✅ Quick login successful!");
      onLogin({
        name: mockResult.user.name,
        email: mockResult.user.email,
        token: mockResult.user.token,
        id: mockResult.user.id,
      });
    } catch (error) {
      console.error("Quick login failed:", error);
      setError("Erro no login rápido");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted, starting authentication process...');
    
    // Prevent multiple submissions
    if (loading) {
      console.log('⚠️ Already processing, ignoring duplicate submission');
      return;
    }

    console.log(`🚀 Starting ${isLogin ? 'login' : 'registration'} process...`);

    setLoading(true);
    setError("");

    // Validate form data
    if (!isLogin) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
        setError("Por favor, preencha todos os campos obrigatórios");
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirm_password) {
        setError("As senhas não coincidem");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres");
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      console.log(`📡 Making request to: http://localhost:8000${endpoint}`);

      let payload;
      if (isLogin) {
        payload = {
          email: formData.email,
          password: formData.password
        };
      } else {
        // Para registro, garantir que os campos obrigatórios estão presentes
        const baseUsername = `${formData.first_name.toLowerCase()}${formData.last_name.toLowerCase()}`
          .replace(/[^a-z0-9]/g, "")
          .substring(0, 15);
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const username = `${baseUsername}${randomSuffix}`;
        const displayId = Math.floor(Math.random() * 9000000000 + 1000000000).toString();

        payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          gender: null, // Permitir null para gender
          birth_date: null, // Permitir null para birth_date
          phone: null, // Permitir null para phone
          username: username,
          display_id: displayId,
        };
      }

      console.log("📦 Payload:", { ...payload, password: '***' });

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response text:", responseText);

      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          setError("Erro na resposta do servidor");
          setLoading(false);
          return;
        }

        if (isLogin) {
          console.log('✅ Login successful, fetching user data...');
          // Get user details for login
          const userResponse = await fetch("http://localhost:8000/auth/me", {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('✅ User data fetched, calling onLogin...');
            onLogin({
              name: `${userData.first_name} ${userData.last_name}`,
              email: userData.email,
              token: data.access_token,
              id: userData.id,
            });
          } else {
            setError("Erro ao obter dados do usuário");
          }
        } else {
          // After registration, redirect to verification
          console.log("✅ Registration successful, processing...");

          try {
            // Store user data temporarily for verification process
            const userData = {
              id: data.id,
              firstName: data.first_name,
              lastName: data.last_name,
              email: data.email,
              username: data.username || payload.username,
              display_id: data.display_id || payload.display_id,
            };

            localStorage.setItem("pendingVerificationUser", JSON.stringify(userData));
            localStorage.setItem("pendingVerificationEmail", data.email);
            localStorage.setItem("pendingPassword", formData.password);

            console.log("📦 User data stored in localStorage");
            console.log("🔄 Redirecting to verification page...");

            // Show success message and navigate
            alert('Conta criada com sucesso! Redirecionando para verificação de e-mail...');

            // Use navigate instead of window.location.href
            setTimeout(() => {
              navigate('/verify-email');
            }, 100);

          } catch (storageError) {
            console.error("❌ Error storing user data:", storageError);
            // Fallback: still redirect to verification page
            alert('Conta criada! Redirecionando para verificação...');
            setTimeout(() => {
              navigate('/verify-email');
            }, 100);
          }
        }
      } else {
        // Handle registration/login error
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("Error parsing response JSON:", jsonError);
          errorData = { detail: "Erro na resposta do servidor" };
        }

        console.error("Registration/Login error:", errorData);

        // Handle specific error cases
        if (response.status === 403 && typeof errorData.detail === 'object') {
          if (errorData.detail.error === 'email_not_verified') {
            // Store user data for verification redirect
            localStorage.setItem("pendingVerificationEmail", errorData.detail.email);
            localStorage.setItem("pendingVerificationUser", JSON.stringify({
              id: errorData.detail.user_id,
              email: errorData.detail.email
            }));

            setError("Você precisa confirmar seu email antes de fazer login. Redirecionando para verificação...");

            setTimeout(() => {
              navigate('/verify-email');
            }, 2000);
            return;
          } else if (errorData.detail.error === 'account_not_active') {
            setError(`Conta não está ativa: ${errorData.detail.message}`);
            return;
          }
        }

        setError(errorData.detail?.message || errorData.detail || "Erro ao processar solicitação");
      }
    } catch (error) {
      console.error("❌ Network or processing error:", error);

      // Se houver erro de rede, tentar usar mock para desenvolvimento
      console.log("🎭 Network error, trying MOCK AUTH for development...");

      try {
        if (isLogin) {
          const mockResult = await mockAuthService.mockLogin(formData.email, formData.password);
          console.log("✅ Mock login successful!");
          onLogin({
            name: mockResult.user.name,
            email: mockResult.user.email,
            token: mockResult.user.token,
            id: mockResult.user.id,
          });
          return;
        } else {
          const mockResult = await mockAuthService.mockRegister(formData);
          console.log("✅ Mock register successful!");
          onLogin({
            name: mockResult.user.name,
            email: mockResult.user.email,
            token: mockResult.user.token,
            id: mockResult.user.id,
          });
          return;
        }
      } catch (mockError) {
        console.error("Mock auth also failed:", mockError);
      }

      setError("Erro de conexão. Tentando modo desenvolvimento...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Welcome Section - Left Side */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-12 relative">
          <div className="absolute top-8 left-8 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Boas-vindas
          </div>

          {/* Decorative separator */}
          <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* Floating elements for social media feel */}
          <div className="absolute top-20 right-20 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-2 h-2 bg-red-400 rounded-full opacity-40"></div>
          <div className="absolute top-40 right-8 w-1.5 h-1.5 bg-green-400 rounded-full opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="max-w-lg text-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-900">
              {isLogin ? "Conecte-se agora!" : "Junte-se à nossa comunidade!"}
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              {isLogin
                ? "Compartilhe momentos especiais e descubra um mundo de possibilidades."
                : "Crie sua conta e faça parte de uma experiência única. Conecte-se e explore."}
            </p>
            <div className="space-y-8 text-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 border-2 border-red-300 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-lg">Curta momentos especiais</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 border-2 border-blue-300 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <span className="text-lg">Compartilhe com amigos</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 border-2 border-green-300 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-lg">Converse e conecte-se</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section - Right Side */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-8 right-8 text-xs font-medium text-gray-400 uppercase tracking-wider">
            {isLogin ? "Login" : "Cadastro"}
          </div>

          {/* Subtle pattern background */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute top-10 left-10 w-32 h-32 border border-gray-400 rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-20 h-20 border border-gray-400 rounded-full"></div>
            <div className="absolute top-1/3 right-10 w-16 h-16 border border-gray-400 rounded-full"></div>
          </div>

          {/* Floating notification-like elements */}
          <div className="absolute top-16 left-8 w-2 h-2 bg-blue-500 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-40 left-12 w-1.5 h-1.5 bg-green-500 rounded-full opacity-40" style={{animationDelay: '2s'}}></div>
          <div className="w-full max-w-md" style={{position: 'relative', zIndex: 20}}>
            {/* Logo */}
            <div className="text-center mb-8">
              <Logo size="lg" showText={true} />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-4">
                {isLogin ? "Bem-vindo de volta!" : "Criar conta"}
              </h2>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                {isLogin
                  ? "Entre na sua conta para continuar"
                  : "Junte-se à nossa comunidade"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" style={{position: 'relative', zIndex: 50}}>
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu sobrenome"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  position: 'relative',
                  zIndex: 1000,
                  pointerEvents: 'all',
                  background: '#2563eb',
                  border: '2px solid #1d4ed8',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onClick={(e) => {
                  console.log('🔥 Botão desktop clicado!', e);
                  console.log('Loading:', loading);
                  console.log('Event target:', e.target);
                  console.log('Event type:', e.type);
                  if (!loading) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processando...
                  </div>
                ) : isLogin ? (
                  "Entrar"
                ) : (
                  "Criar conta"
                )}
              </button>
            </form>

            {/* Forgot Password Link */}
            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {/* Toggle Auth Mode */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                <button
                  onClick={() => {
                    if (isLogin) {
                      // Redirecionar para cadastro em etapas
                      navigate("/cadastro");
                    } else {
                      setIsLogin(!isLogin);
                      setError("");
                      setFormData({
                        first_name: "",
                        last_name: "",
                        email: "",
                        password: "",
                        confirm_password: "",
                      });
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin ? "Criar conta" : "Fazer login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6" style={{position: 'relative', zIndex: 20}}>
            {/* Logo */}
            <div className="text-center mb-8">
              <Logo size="lg" showText={true} />
              <h2 className="text-xl font-bold text-gray-900 mt-4">
                {isLogin ? "Bem-vindo de volta!" : "Criar conta"}
              </h2>
              <p className="text-gray-600 mt-2 text-sm">
                {isLogin
                  ? "Entre na sua conta para continuar"
                  : "Junte-se à nossa comunidade"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        placeholder="Seu sobrenome"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base"
                style={{
                  position: 'relative',
                  zIndex: 1000,
                  pointerEvents: 'all',
                  background: '#2563eb',
                  border: '2px solid #1d4ed8',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onClick={(e) => {
                  console.log('🔥 Botão mobile clicado!', e);
                  console.log('Loading:', loading);
                  console.log('Event target:', e.target);
                  console.log('Event type:', e.type);
                  if (!loading) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processando...
                  </div>
                ) : isLogin ? (
                  "Entrar"
                ) : (
                  "Criar conta"
                )}
              </button>
            </form>

            {/* Forgot Password Link */}
            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {/* Toggle Auth Mode */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                <button
                  onClick={() => {
                    if (isLogin) {
                      // Redirecionar para cadastro em etapas
                      navigate("/cadastro");
                    } else {
                      setIsLogin(!isLogin);
                      setError("");
                      setFormData({
                        first_name: "",
                        last_name: "",
                        email: "",
                        password: "",
                        confirm_password: "",
                      });
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin ? "Criar conta" : "Fazer login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
