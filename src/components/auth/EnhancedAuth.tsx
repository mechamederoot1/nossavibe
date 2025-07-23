import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  MessageCircle,
  Sparkles,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader,
  AtSign,
} from "lucide-react";
import { Logo } from "../ui/Logo";

interface AuthProps {
  onLogin: (userData: {
    name: string;
    email: string;
    token: string;
    id: number;
  }) => void;
}

export function EnhancedAuth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthDate: "",
    phone: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Generate username when first name and last name change
  useEffect(() => {
    if (formData.firstName && formData.lastName && !formData.username) {
      const baseUsername =
        `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`
          .replace(/[^a-z0-9]/g, "")
          .substring(0, 15);

      setGeneratedUsername(baseUsername);
      setFormData((prev) => ({ ...prev, username: baseUsername }));
    }
  }, [formData.firstName, formData.lastName]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username && formData.username.length >= 3 && !isLogin) {
        setCheckingUsername(true);
        try {
          const response = await fetch(
            `http://localhost:8000/auth/check-username-public?username=${formData.username}`,
          );
          if (response.ok) {
            const data = await response.json();
            setUsernameAvailable(!data.exists);
          }
        } catch (error) {
          console.error("Error checking username:", error);
        } finally {
          setCheckingUsername(false);
        }
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, isLogin]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Username formatting
    if (field === "username") {
      const formattedUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
      setFormData((prev) => ({ ...prev, username: formattedUsername }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!isLogin) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "Nome é obrigatório";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Sobrenome é obrigatório";
      }

      if (!formData.username.trim()) {
        newErrors.username = "Username é obrigatório";
      } else if (formData.username.length < 3) {
        newErrors.username = "Username deve ter pelo menos 3 caracteres";
      } else if (usernameAvailable === false) {
        newErrors.username = "Username não disponível";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não coincidem";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStart - touchEnd > 50) {
      setActiveSlide(1);
    }

    if (touchStart - touchEnd < -50) {
      setActiveSlide(0);
    }
  }, [touchStart, touchEnd]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);

      try {
        if (isLogin) {
          const response = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });

          if (response.ok) {
            const data = await response.json();

            // Get user details
            const userResponse = await fetch("http://localhost:8000/auth/me", {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              onLogin({
                name: `${userData.first_name} ${userData.last_name}`,
                email: userData.email,
                token: data.access_token,
                id: userData.id,
              });
            }
          } else {
            const error = await response.json();
            setErrors({ general: error.detail || "Erro ao fazer login" });
          }
        } else {
          const response = await fetch("http://localhost:8000/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: formData.firstName,
              last_name: formData.lastName,
              username: formData.username,
              email: formData.email,
              password: formData.password,
              gender: formData.gender || null,
              birth_date: formData.birthDate || null,
              phone: formData.phone || null,
              display_id: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
            }),
          });

          if (response.ok) {
            const userData = await response.json();

            // Salvar dados temporários para verificação de e-mail
            localStorage.setItem('pendingVerificationEmail', formData.email);
            localStorage.setItem('pendingUserData', JSON.stringify({
              id: userData.id,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              username: formData.username,
              display_id: userData.display_id,
            }));
            localStorage.setItem('pendingPassword', formData.password);

            // Enviar e-mail de verificação
            try {
              const emailResponse = await fetch('http://localhost:3001/send-verification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: formData.email,
                  firstName: formData.firstName,
                  userId: userData.id
                })
              });

              if (emailResponse.ok) {
                // Redirecionar para página de verificação
                window.location.href = '/verify-email';
              } else {
                const emailError = await emailResponse.json();
                setErrors({ general: emailError.message || 'Erro ao enviar e-mail de verificação' });
              }
            } catch (emailError) {
              console.error('Erro ao enviar e-mail:', emailError);
              // Mesmo se o e-mail falhar, redirecionar para verificação
              window.location.href = '/verify-email';
            }
          } else {
            const error = await response.json();
            console.error("Registration error:", error);
            setErrors({ general: error.detail || "Erro ao criar conta" });
          }
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
        setErrors({ general: "Erro de conexão. Tente novamente." });
      } finally {
        setLoading(false);
      }
    },
    [formData, isLogin, usernameAvailable, onLogin],
  );

  const slides = useMemo(
    () => [
      {
        icon: Users,
        title: "Conecte-se com Amigos",
        description: "Encontre e conecte-se com pessoas próximas a você",
        gradient: "from-blue-600 to-purple-600",
      },
      {
        icon: MessageCircle,
        title: "Converse em Tempo Real",
        description: "Envie mensagens, fotos e vídeos instantaneamente",
        gradient: "from-green-600 to-blue-600",
      },
      {
        icon: Sparkles,
        title: "Compartilhe Momentos",
        description: "Publique suas experiências e acompanhe amigos",
        gradient: "from-purple-600 to-pink-600",
      },
    ],
    [],
  );

  const currentSlide = slides[activeSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - Carousel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient} transition-all duration-700`}
        />

        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center space-y-8 max-w-lg">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <currentSlide.icon className="w-12 h-12" />
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-4">{currentSlide.title}</h2>
              <p className="text-xl text-white/90">
                {currentSlide.description}
              </p>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-8 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeSlide ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() =>
              setActiveSlide((prev) =>
                prev === 0 ? slides.length - 1 : prev - 1,
              )
            }
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() =>
              setActiveSlide((prev) =>
                prev === slides.length - 1 ? 0 : prev + 1,
              )
            }
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Carousel */}
      {isMobile && (
        <div
          className="lg:hidden relative h-64 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient} transition-all duration-500`}
          />

          <div className="relative z-10 flex flex-col justify-center items-center text-white h-full p-8">
            <currentSlide.icon className="w-12 h-12 mb-4" />
            <h2 className="text-2xl font-bold text-center mb-2">
              {currentSlide.title}
            </h2>
            <p className="text-center text-white/90">
              {currentSlide.description}
            </p>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeSlide ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo className="mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? "Entre para continuar conectado"
                : "Junte-se à nossa comunidade"}
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="João"
                      required
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Silva"
                      required
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <AtSign className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.username
                          ? "border-red-500"
                          : usernameAvailable === false
                            ? "border-red-500"
                            : usernameAvailable === true
                              ? "border-green-500"
                              : "border-gray-300"
                      }`}
                      placeholder="joaosilva"
                      required
                    />
                    {checkingUsername && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username}
                    </p>
                  )}
                  {usernameAvailable === false && !errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      Username não disponível
                    </p>
                  )}
                  {usernameAvailable === true && !errors.username && (
                    <p className="text-green-500 text-sm mt-1">
                      Username disponível!
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="seu@email.com"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirme sua senha"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                (!isLogin && checkingUsername) ||
                (!isLogin && usernameAvailable === false)
              }
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  {isLogin ? "Entrando..." : "Criando conta..."}
                </div>
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setUsernameAvailable(null);
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
  );
}
