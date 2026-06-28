import type { ReactNode } from 'react';

export function FormSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      )}
      {children}
    </div>
  );
}

export function FormLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold text-slate-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function FormHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-slate-400">{children}</p>;
}

export function FormError({ error }: { error: string }) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2 pt-2">{children}</div>;
}
