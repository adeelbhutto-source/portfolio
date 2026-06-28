type BadgeColor = 'amber' | 'green' | 'red' | 'blue' | 'indigo' | 'slate';

interface BadgeProps {
  children: string;
  color?: BadgeColor;
}

const colorStyles: Record<BadgeColor, string> = {
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red:   'bg-red-50 text-red-700 border-red-200',
  blue:  'bg-sky-50 text-sky-700 border-sky-200',
  indigo:'bg-indigo-50 text-indigo-700 border-indigo-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function Badge({ children, color = 'slate' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colorStyles[color]}`}>
      {children}
    </span>
  );
}
