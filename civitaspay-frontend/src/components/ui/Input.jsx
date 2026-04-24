function Input({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-civitas-blue focus-within:ring-2 focus-within:ring-civitas-blue/10 transition-all">
        {Icon && (
          <div className="px-3 text-gray-400">
            <Icon size={16} />
          </div>
        )}
        <input
          className={[
            'flex-1 py-2.5 pr-4 text-sm text-gray-800',
            'placeholder-gray-400 outline-none bg-transparent',
            !Icon ? 'pl-4' : '',
            className,
          ].join(' ')}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default Input;