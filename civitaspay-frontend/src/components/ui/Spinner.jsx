function Spinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={[
          sizes[size],
          'rounded-full border-gray-200 border-t-civitas-blue animate-spin',
        ].join(' ')}
      />
      {text && (
        <p className="text-sm text-gray-500">{text}</p>
      )}
    </div>
  );
}

export default Spinner;