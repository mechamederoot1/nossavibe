import React from 'react';
import { Code, Info } from 'lucide-react';

interface MockBannerProps {
  show: boolean;
}

export const MockBanner: React.FC<MockBannerProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-sm">
        <Code className="w-4 h-4" />
        <span className="font-medium">MODO DESENVOLVIMENTO</span>
        <span className="opacity-90">|</span>
        <div className="flex items-center space-x-1">
          <Info className="w-3 h-3" />
          <span className="opacity-90">Usando dados simulados (mock)</span>
        </div>
        <span className="opacity-75">🎭</span>
      </div>
    </div>
  );
};
