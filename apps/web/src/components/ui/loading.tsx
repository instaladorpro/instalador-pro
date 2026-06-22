interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

function Loading({ message, fullScreen }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-40">{content}</div>;
  }
  return <div className="flex items-center justify-center py-8">{content}</div>;
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-surface animate-pulse rounded ${className}`} />;
}

export { Loading, Skeleton };
