import React, { useState } from 'react';
import {
  Heart,
  Shield,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Flag,
  Lock,
  X,
} from 'lucide-react';

interface WelcomeModalProps {
  user: any;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: 'Bem-vindo ao Vibe!',
    icon: Sparkles,
    description: 'Sua jornada de conexões autênticas começa aqui. O Vibe é uma plataforma dedicada a criar conexões genuínas.',
    points: [
      'Compartilhe momentos especiais',
      'Conecte-se com pessoas incríveis',
      'Descubra conteúdos inspiradores',
    ],
  },
  {
    id: 2,
    title: 'Boas Práticas',
    icon: Heart,
    description: 'No Vibe, valorizamos o respeito mútuo e a autenticidade. Aqui estão algumas diretrizes:',
    points: [
      'Seja autêntico e genuíno',
      'Trate todos com respeito',
      'Compartilhe conteúdo positivo',
    ],
  },
  {
    id: 3,
    title: 'Segurança',
    icon: Shield,
    description: 'Sua segurança é nossa prioridade. Oferecemos várias ferramentas para mantê-lo seguro:',
    points: [
      'Configurações de privacidade',
      'Ferramentas de bloqueio',
      'Sistema de denúncias',
    ],
  },
  {
    id: 4,
    title: 'Sistema de Denúncias',
    icon: Flag,
    description: 'Ajude-nos a manter a comunidade segura reportando conteúdo inadequado:',
    points: [
      'Use o botão de denúncia',
      'Forneça detalhes específicos',
      'Denúncias são confidenciais',
    ],
  },
  {
    id: 5,
    title: 'Privacidade',
    icon: Lock,
    description: 'Controle sua experiência com nossas configurações de privacidade:',
    points: [
      'Perfil público ou privado',
      'Controle de visibilidade',
      'Configurações de mensagens',
    ],
  },
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const currentStepData = onboardingSteps.find(step => step.id === currentStep);
  const isLastStep = currentStep === onboardingSteps.length;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!currentStepData) return null;

  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <StepIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
            <div className="flex justify-center space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index + 1 <= currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">
            {currentStepData.description}
          </p>

          <div className="space-y-3 mb-6">
            {currentStepData.points.map((point, index) => (
              <div key={index} className="flex items-start">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <p className="text-gray-700 text-sm">{point}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Pular tutorial
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {currentStep} de {onboardingSteps.length}
              </span>
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Concluir
                  </>
                ) : (
                  <>
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
