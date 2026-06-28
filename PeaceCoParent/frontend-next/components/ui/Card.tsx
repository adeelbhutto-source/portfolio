import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export default function Card({ children, className = '', style, onClick }: CardProps) {
  return (
    <div
      style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, ...style }}
      className={className}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
