import React, { useState } from 'react';
import {
  Heart,
  Shield,
  Users,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flag,
  Lock,
  Camera,
} from 'lucide-react';
import { Logo } from '../ui/Logo';

interface WelcomeOnboardingProps {
  user: any;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: 'Bem-vindo ao Vibe!',
    icon: Sparkles,
    content: {
      subtitle: 'Sua jornada de conexões autênticas começa aqui',
      description:
        'O Vibe é uma plataforma dedicada a criar conexões genuínas e promover interações positivas entre pessoas.',
      points: [
        'Compartilhe momentos especiais',
        'Conecte-se com pessoas que pensam como você',
        'Descubra conteúdos inspiradores',
        'Faça parte de uma comunidade acolhedora',
      ],
    },
  },
  {
    id: 2,
    title: 'Boas Práticas da Comunidade',
    icon: Heart,
    content: {
      subtitle: 'Construindo um ambiente positivo juntos',
      description:
        'No Vibe, valorizamos o respeito mútuo e a autenticidade. Aqui estão algumas diretrizes para uma experiência incrível:',
      points: [
        'Seja autêntico e genuíno em suas interações',
        'Trate todos com respeito e gentileza',
        'Compartilhe conteúdo positivo e inspirador',
        'Celebre as conquistas e apoie os outros',
        'Use linguagem inclusiva e respeitosa',
      ],
    },
  },
  {
    id: 3,
    title: 'Segurança e Privacidade',
    icon: Shield,
    content: {
      subtitle: 'Sua segurança é nossa prioridade',
      description:
        'Oferecemos várias ferramentas para manter você seguro e no controle da sua experiência:',
      points: [
        'Configurações de privacidade personalizáveis',
        'Ferramentas de bloqueio e relatório',
        'Verificação de identidade opcional',
        'Controle total sobre quem vê seu conteúdo',
        'Criptografia ponta a ponta nas mensagens',
      ],
    },
  },
  {
    id: 4,
    title: 'Sistema de Denúncias',
    icon: Flag,
    content: {
      subtitle: 'Como reportar conteúdo inadequado',
      description:
        'Ajude-nos a manter a comunidade segura. Se você encontrar algo que viola nossas diretrizes:',
      points: [
        'Use o botão de denúncia em qualquer post ou perfil',
        'Forneça detalhes específicos sobre a violação',
        'Nossa equipe revisará em até 24 horas',
        'Denúncias são confidenciais e anônimas',
        'Ações são tomadas conforme a gravidade',
      ],
    },
  },
  {
    id: 5,
    title: 'Configurações de Privacidade',
    icon: Lock,
    content: {
      subtitle: 'Controle quem vê o quê',
      description:
        'Personalize sua experiência com nossas configurações de privacidade flexíveis:',
      points: [
        'Perfil público ou privado',
        'Controle de quem pode te encontrar',
        'Visibilidade de posts e stories',
        'Configurações de mensagens diretas',
        'Bloqueio de palavras-chave',
      ],
    },
  },
  {
    id: 6,
    title: 'Pronto para Começar!',
    icon: CheckCircle,
    content: {
      subtitle: 'Sua jornada no Vibe começou',
      description:
        'Agora você está pronto para explorar e se conectar! Lembre-se de que nossa equipe está sempre aqui para ajudar.',
      points: [
        'Complete seu perfil com foto e bio',
        'Encontre e siga pessoas interessantes',
        'Comece a compartilhar seus momentos',
        'Explore conteúdos relevantes para você',
        'Entre em contato se precisar de ajuda',
      ],
    },
  },
];

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  user,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStepData = onboardingSteps.find(
    (step) => step.id === currentStep
  );

  const handleNext = () => {
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  if (!currentStepData) return null;

  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo className="text-white mr-4" />
              <div>
                <h1 className="text-2xl font-bold">
                  Olá, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-blue-100">
                  Vamos configurar sua experiência no Vibe
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">
                Etapa {currentStep} de {onboardingSteps.length}
              </div>
              <div className="w-32 bg-blue-500 rounded-full h-2 mt-1">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentStep / onboardingSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar com navegação */}
          <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-4">Navegação</h3>
            <div className="space-y-2">
              {onboardingSteps.map((step) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.has(step.id);
                const isCurrent = step.id === currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleSkipToStep(step.id)}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                      isCurrent
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isCompleted
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs opacity-75">
                        Etapa {step.id}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              {/* Cabeçalho da etapa */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StepIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-xl text-gray-600">
                  {currentStepData.content.subtitle}
                </p>
              </div>

              {/* Descrição */}
              <div className="mb-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {currentStepData.content.description}
                </p>

                {/* Lista de pontos */}
                <div className="space-y-3">
                  {currentStepData.content.points.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dica especial para a etapa atual */}
              {currentStep === 2 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Heart className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Dica Especial
                      </h4>
                      <p className="text-yellow-700 text-sm">
                        Lembre-se: pequenos gestos de gentileza podem fazer uma
                        grande diferença na experiência de alguém na plataforma!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">
                        Importante
                      </h4>
                      <p className="text-red-700 text-sm">
                        Nunca hesite em denunciar comportamentos inadequados.
                        Suas denúncias ajudam a manter nossa comunidade segura
                        para todos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer com navegação */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Etapa {currentStep} de {onboardingSteps.length}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === onboardingSteps.length ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Começar!
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
