import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'flat' | 'elevated';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', hover = true, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
      premium: 'premium-card',
      flat: 'bg-white border border-gray-100 rounded-lg',
      elevated: 'bg-white rounded-xl shadow-lg border-0'
    };

    const hoverEffect = hover ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300' : '';

    return (
      <div
        ref={ref}
        className={`${variants[variant]} ${hoverEffect} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`border-b border-gray-100 px-6 py-4 ${className}`} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h3 ref={ref} className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-6 ${className}`} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`border-t border-gray-100 px-6 py-4 bg-gray-50/50 rounded-b-lg ${className}`} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
export type { CardProps };