const STATUS_MAP: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  agendada: { label: 'Agendada', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  em_andamento: { label: 'Em andamento', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  concluida: { label: 'Concluída', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  paga: { label: 'Paga', dot: 'bg-green-600', bg: 'bg-green-50', text: 'text-green-800' },
  cancelada: { label: 'Cancelada', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || { label: status, dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-700' };
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.bg} ${config.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export { StatusBadge, type StatusBadgeProps };
