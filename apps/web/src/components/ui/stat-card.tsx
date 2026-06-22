interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: { value: number; label?: string };
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  accent?: boolean;
}

function StatCard({ title, value, icon, trend, subtitle, onClick, className = '', accent }: StatCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`bg-white border border-border rounded-2xl p-5 text-left shadow-card transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-card-hover hover:border-primary/20' : ''} ${accent ? 'border-l-4 border-l-primary' : ''} ${className}`}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{title}</p>
        {icon && <span className="text-xl opacity-80">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`text-xs font-semibold ${trend.value >= 0 ? 'text-success' : 'text-danger'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            {trend.label && <span className="text-muted font-normal ml-1">{trend.label}</span>}
          </span>
        )}
        {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
      </div>
    </Wrapper>
  );
}

export { StatCard, type StatCardProps };
