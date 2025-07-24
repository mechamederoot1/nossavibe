import React, { useState, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Calendar,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Check,
  Loader,
  ExternalLink,
} from "lucide-react";
import { Logo } from "../ui/Logo";
import { apiService } from "../../services/ApiService";

interface AuthProps {
  onLogin: (userData: {
    name: string;
    email: string;
    token: string;
    id: number;
  }) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

const STEPS = [
  { id: 1, title: "Dados Pessoais", icon: User },
  { id: 2, title: "Email", icon: Mail },
  { id: 3, title: "Informações Adicionais", icon: Calendar },
  { id: 4, title: "Senha", icon: Lock },
  { id: 5, title: "Termos e Privacidade", icon: Shield },
];

export function MultiStepAuth({ onLogin }: AuthProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1: // Nome e Sobrenome
        if (!formData.firstName.trim()) {
          newErrors.firstName = "Nome é obrigatório";
        } else if (formData.firstName.trim().length < 2) {
          newErrors.firstName = "Nome deve ter pelo menos 2 caracteres";
        }

        if (!formData.lastName.trim()) {
          newErrors.lastName = "Sobrenome é obrigatório";
        } else if (formData.lastName.trim().length < 2) {
          newErrors.lastName = "Sobrenome deve ter pelo menos 2 caracteres";
        }
        break;

      case 2: // Email
        if (!formData.email.trim()) {
          newErrors.email = "Email é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Formato de email inválido";
        }
        break;

      case 3: // Gênero e Data de Nascimento
        if (!formData.gender) {
          newErrors.gender = "Selecione um gênero";
        }

        if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
          newErrors.birthDate = "Data de nascimento é obrigatória";
        } else {
          const day = parseInt(formData.birthDay);
          const month = parseInt(formData.birthMonth);
          const year = parseInt(formData.birthYear);

          // Verificar se é uma data válida
          const birthDate = new Date(year, month - 1, day);
          const today = new Date();

          if (
            birthDate.getDate() !== day ||
            birthDate.getMonth() !== month - 1 ||
            birthDate.getFullYear() !== year
          ) {
            newErrors.birthDate = "Data de nascimento inválida";
          } else {
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();

            const actualAge =
              age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);

            if (actualAge < 13) {
              newErrors.birthDate = "Você deve ter pelo menos 13 anos";
            } else if (actualAge > 120) {
              newErrors.birthDate = "Data de nascimento inválida";
            }
          }
        }
        break;

      case 4: // Senha
        if (!formData.password) {
          newErrors.password = "Senha é obrigatória";
        } else if (formData.password.length < 8) {
          newErrors.password = "Senha deve ter pelo menos 8 caracteres";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password =
            "Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número";
        }

        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Confirmação de senha é obrigatória";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "As senhas não coincidem";
        }
        break;

      case 5: // Termos e Privacidade
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = "Você deve aceitar os Termos de Uso";
        }

        if (!formData.acceptPrivacy) {
          newErrors.acceptPrivacy =
            "Você deve aceitar a Política de Privacidade";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    console.log('🚀 Starting registration process...');

    // Prevent multiple submissions
    if (loading) {
      console.log('⚠️ Already processing, ignoring duplicate submission');
      return;
    }
    try {
      // Formatando a data de nascimento para o backend
      const birthDate =
        formData.birthDay && formData.birthMonth && formData.birthYear
          ? `${formData.birthYear}-${formData.birthMonth.padStart(2, "0")}-${formData.birthDay.padStart(2, "0")}`
          : null;

      // Gerar username único baseado no nome
      const baseUsername = `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 15);
      
      // Adicionar números aleatórios para garantir unicidade
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const username = `${baseUsername}${randomSuffix}`;

      // Gerar display_id único
      const displayId = Math.floor(Math.random() * 9000000000 + 1000000000).toString();

      const registrationData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        gender: formData.gender || null,
        birth_date: birthDate,
        phone: null,
        username: username,
        display_id: displayId,
      };

      console.log("Sending registration data:", registrationData);

      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const responseText = await response.text();
      console.log('Registration response status:', response.status);
      console.log('Registration response text:', responseText);

      if (response.ok) {
        let userData;
        try {
          userData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing registration response:', parseError);
          setErrors({ general: "Erro na resposta do servidor" });
          return;
        }

        console.log("✅ Registration successful:", userData);

        // Salvar dados temporários para verificação de e-mail
        const userDataForStorage = {
          id: userData.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          username: userData.username || username,
          display_id: userData.display_id || displayId,
        };

        console.log('💾 Storing user data:', userDataForStorage);
        localStorage.setItem('pendingVerificationUser', JSON.stringify(userDataForStorage));
        localStorage.setItem('pendingVerificationEmail', formData.email);
        localStorage.setItem('pendingPassword', formData.password);

        console.log('🔄 Redirecting to verification page...');

        // Redirecionamento direto sem mensagem
        setErrors({ general: "" });

        // Redirecionamento imediato
        window.location.href = '/verify-email';
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorData = { detail: "Erro no servidor" };
        }
        
        console.error("❌ Registration error:", errorData);
        setErrors({ general: errorData.detail || "Erro ao criar conta" });
      }
    } catch (error) {
      console.error("❌ Network error during registration:", error);
      setErrors({ general: "Erro de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const openTermsOfService = () => {
    window.open("/termos-de-uso", "_blank");
  };

  const openPrivacyPolicy = () => {
    window.open("/politica-de-privacidade", "_blank");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Seu nome"
                autoFocus
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sobrenome *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Seu sobrenome"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
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
                autoFocus
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Este será seu email para login e comunicações importantes.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
                autoFocus
              >
                <option value="">Selecione seu gênero</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
                <option value="prefer_not_to_say">Prefiro não informar</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <select
                    value={formData.birthDay}
                    onChange={(e) =>
                      handleInputChange("birthDay", e.target.value)
                    }
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.birthDate ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Dia</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day.toString().padStart(2, "0")}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={formData.birthMonth}
                    onChange={(e) =>
                      handleInputChange("birthMonth", e.target.value)
                    }
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.birthDate ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Mês</option>
                    <option value="01">Janeiro</option>
                    <option value="02">Fevereiro</option>
                    <option value="03">Março</option>
                    <option value="04">Abril</option>
                    <option value="05">Maio</option>
                    <option value="06">Junho</option>
                    <option value="07">Julho</option>
                    <option value="08">Agosto</option>
                    <option value="09">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                  </select>
                </div>
                <div>
                  <select
                    value={formData.birthYear}
                    onChange={(e) =>
                      handleInputChange("birthYear", e.target.value)
                    }
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.birthDate ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Ano</option>
                    {Array.from(
                      { length: 100 },
                      (_, i) => new Date().getFullYear() - 13 - i,
                    ).map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {errors.birthDate && (
                <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Você deve ter pelo menos 13 anos para se cadastrar.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
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
                  placeholder="Crie uma senha segura"
                  autoFocus
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
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                <p>Sua senha deve conter:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pelo menos 8 caracteres</li>
                  <li>Uma letra maiúscula</li>
                  <li>Uma letra minúscula</li>
                  <li>Um número</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Digite a senha novamente"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quase pronto!
              </h3>
              <p className="text-gray-600">
                Para finalizar, você precisa aceitar nossos termos.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) =>
                    handleInputChange("acceptTerms", e.target.checked)
                  }
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Eu li e aceito os{" "}
                  <button
                    type="button"
                    onClick={openTermsOfService}
                    className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                  >
                    Termos de Uso
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
              )}

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptPrivacy}
                  onChange={(e) =>
                    handleInputChange("acceptPrivacy", e.target.checked)
                  }
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Eu li e aceito a{" "}
                  <button
                    type="button"
                    onClick={openPrivacyPolicy}
                    className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                  >
                    Política de Privacidade
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </span>
              </label>
              {errors.acceptPrivacy && (
                <p className="text-red-500 text-sm">{errors.acceptPrivacy}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 leading-relaxed">
                Ao criar sua conta, você concorda em seguir nossas diretrizes da
                comunidade e aceita que suas informações sejam processadas de
                acordo com nossa Política de Privacidade, em conformidade com a
                Lei Geral de Proteção de Dados (LGPD).
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo e Header */}
          <div className="text-center mb-8">
            <Logo className="mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-600">Junte-se à nossa comunidade</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-full h-1 mx-2 ${
                          currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Etapa {currentStep} de {STEPS.length}:{" "}
              {STEPS[currentStep - 1].title}
            </p>
          </div>

          {/* Error Messages */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-8">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Criar Conta
                  </>
                )}
              </button>
            )}
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{" "}
              <button
                onClick={() => (window.location.href = "/")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
