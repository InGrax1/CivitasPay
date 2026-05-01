export function formatCurrency(value, decimales = 2) {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(parseFloat(value));
}

export function formatCurrencyCompact(value) {
  if (!value || isNaN(value)) return '$0';
  const num = parseFloat(value);
  if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000)     return `$${(num / 1_000).toFixed(0)}k`;
  return `$${num.toFixed(0)}`;
}