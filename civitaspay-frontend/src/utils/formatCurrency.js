export function formatCurrencyCompact(value) {
  if (!value || isNaN(value)) return '$0';
  const num = parseFloat(value);
  if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `$${(num / 1_000).toFixed(0)}k`;
  return `$${num.toFixed(0)}`;
}