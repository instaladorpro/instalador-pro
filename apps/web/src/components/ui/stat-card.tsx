interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: { value: number; label?: string };
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

function StatCard({ title, value, icon, trend, subtitle, onClick, className = '' }: StatCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`bg-white border border-border rounded-xl p-4 text-left transition-colors ${onClick ? 'cursor-pointer hover:border-primary/30 hover:shadow-sm' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-secondary">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            {trend.label && <span className="text-muted ml-1">{trend.label}</span>}
          </span>
        )}
        {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
      </div>
    </Wrapper>
  );
}

export { StatCard, type StatCardProps };
