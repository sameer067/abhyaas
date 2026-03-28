import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', onClick }: Props) {
  return (
    <div
      className={`glass rounded-2xl ${onClick ? 'cursor-pointer active:scale-98 transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
