const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  agendada: { label: 'Agendada', classes: 'bg-blue-50 text-blue-700' },
  em_andamento: { label: 'Em andamento', classes: 'bg-amber-50 text-amber-700' },
  concluida: { label: 'Concluída', classes: 'bg-emerald-50 text-emerald-700' },
  paga: { label: 'Paga', classes: 'bg-green-50 text-green-800' },
  cancelada: { label: 'Cancelada', classes: 'bg-red-50 text-red-700' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || { label: status, classes: 'bg-gray-100 text-gray-700' };
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${config.classes} ${sizeClass}`}>
      {config.label}
    </span>
  );
}

export { StatusBadge, type StatusBadgeProps };
