import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat';
  header?: { title: string; action?: ReactNode };
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = { sm: 'p-3', md: 'p-4', lg: 'p-6' };

function Card({ variant = 'default', header, padding = 'md', className = '', children, ...props }: CardProps) {
  const base = variant === 'default'
    ? 'bg-white border border-border rounded-xl shadow-sm'
    : 'bg-surface rounded-xl';

  return (
    <div className={`${base} ${className}`} {...props}>
      {header && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{header.title}</h3>
          {header.action}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
}

export { Card, type CardProps };
