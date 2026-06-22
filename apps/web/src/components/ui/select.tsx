import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectOption { value: string; label: string; }

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-foreground">{label}</label>}
        <select
          ref={ref} id={inputId}
          className={`w-full h-10 px-3.5 rounded-xl border bg-white text-foreground text-sm transition-all duration-150 focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 ${error ? 'border-danger ring-1 ring-danger/20' : 'border-border hover:border-secondary/40'} ${className}`}
          aria-invalid={!!error} {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select, type SelectProps, type SelectOption };
