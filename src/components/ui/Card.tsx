import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        transition-all duration-300
        ${hoverable ? 'hover:shadow-lg hover:border-gray-300 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
