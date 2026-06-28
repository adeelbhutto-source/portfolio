import type { ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}

export default function Modal({ onClose, children, maxWidth = 400 }: ModalProps) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '0 0 0 0' }}
      className="sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)', width: '100%', maxWidth, padding: '24px 20px', maxHeight: '92vh', overflowY: 'auto' }}
        className="sm:rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
