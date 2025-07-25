import React, { useState } from "react";
import { MultiStepAuth } from "./MultiStepAuth";
import { SimpleAuth } from "./SimpleAuth";
import { Layers, Zap, ChevronLeft } from "lucide-react";
import { Logo } from "../ui/Logo";

interface AuthProps {
  onLogin: (userData: {
    name: string;
    email: string;
    token: string;
    id: number;
  }) => void;
}

export function AuthSelector({ onLogin }: AuthProps) {
  const [selectedAuth, setSelectedAuth] = useState<
    "selector" | "simple" | "multi"
  >("selector");

  if (selectedAuth === "simple") {
    return (
      <div>
        <button
          onClick={() => setSelectedAuth("selector")}
          className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <SimpleAuth onLogin={onLogin} />
      </div>
    );
  }

  if (selectedAuth === "multi") {
    return (
      <div>
        <button
          onClick={() => setSelectedAuth("selector")}
          className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <MultiStepAuth onLogin={onLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo e Header */}
          <div className="text-center mb-8">
            <Logo className="mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo!
            </h1>
            <p className="text-gray-600">
              Escolha como prefere criar sua conta
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <button
              onClick={() => setSelectedAuth("multi")}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Layers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Cadastro Guiado
                  </h3>
                  <p className="text-sm text-gray-600">
                    Processo em etapas com validação completa
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedAuth("simple")}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Cadastro Rápido
                  </h3>
                  <p className="text-sm text-gray-600">
                    Criação de conta simples e direta
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Features Comparison */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Comparação rápida:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-medium text-blue-600 mb-2">
                  Cadastro Guiado
                </div>
                <ul className="space-y-1 text-gray-600">
                  <li>✓ Validação em tempo real</li>
                  <li>✓ Termos e privacidade</li>
                  <li>✓ Interface moderna</li>
                  <li>✓ Maior segurança</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-green-600 mb-2">
                  Cadastro Rápido
                </div>
                <ul className="space-y-1 text-gray-600">
                  <li>✓ Processo mais rápido</li>
                  <li>✓ Menos etapas</li>
                  <li>✓ Interface simples</li>
                  <li>✓ Ideal para mobile</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Você pode alterar suas informações posteriormente nas
              configurações
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
