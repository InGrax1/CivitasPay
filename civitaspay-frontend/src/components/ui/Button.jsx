import { Loader2 } from 'lucide-react';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  disabled,
  ...props
}) {
  const variants = {
    primary:   'bg-civitas-blue text-white hover:bg-civitas-blue-dark',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    danger:    'bg-red-500 text-white hover:bg-red-600',
    ghost:     'bg-transparent text-civitas-blue hover:bg-civitas-blue-pale',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center rounded-xl font-medium',
        'transition-all duration-150 cursor-pointer select-none',
        'focus:outline-none focus:ring-2 focus:ring-civitas-blue/30',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading
        ? <Loader2 size={16} className="animate-spin" />
        : Icon && <Icon size={16} />
      }
      {children}
    </button>
  );
}

export default Button;