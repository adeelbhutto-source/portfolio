import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border ${hasError ? 'border-red-400 focus:border-red-600' : 'border-slate-200 focus:border-slate-900'} bg-white text-slate-900 placeholder-slate-400 px-4 py-2.5 text-sm outline-none transition disabled:opacity-60`;
}

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function FieldWrapper({ label, hint, error, children }: FieldWrapperProps) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-xs font-semibold text-slate-500">{label}</label>}
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className = '', ...props }: InputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <input className={`${inputCls(!!error)} ${className}`} {...props} />
    </FieldWrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className = '', ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <textarea className={`${inputCls(!!error)} resize-none ${className}`} {...props} />
    </FieldWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, hint, error, className = '', children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <select className={`${inputCls(!!error)} ${className}`} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
