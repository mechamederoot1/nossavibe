import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Background circle with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full"></div>
        
        {/* V letter with modern styling */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-white font-bold" style={{ fontSize: size === 'lg' ? '2rem' : size === 'md' ? '1.5rem' : '1rem' }}>
            V
          </div>
          
          {/* Small heart accent */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 20 20">
              <path d="M10 18.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-6.55 8.54L10 18.35z"/>
            </svg>
          </div>
        </div>
      </div>
      
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent`}>
          Vibe
        </span>
      )}
    </div>
  );
};