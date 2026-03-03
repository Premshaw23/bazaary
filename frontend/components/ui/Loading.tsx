import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <svg 
          className={`animate-spin ${sizes[size]} text-brand-600`} 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && (
          <p className="text-sm text-gray-600 font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC<{ className?: string; lines?: number }> = ({ 
  className = '', 
  lines = 1 
}) => {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={`skeleton h-4 ${className}`}></div>
      ))}
    </div>
  );
};

const LoadingCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`premium-card animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="skeleton h-6 w-3/4"></div>
        <div className="skeleton h-4 w-1/2"></div>
        <div className="skeleton h-4 w-5/6"></div>
        <div className="skeleton h-8 w-1/3"></div>
      </div>
    </div>
  );
};

export { LoadingSpinner, LoadingSkeleton, LoadingCard };
export type { LoadingSpinnerProps };