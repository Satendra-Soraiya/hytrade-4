export function formatInr(amount, options = {}) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(value);
}

export function formatPercentage(value, digits = 2) {
  const num = Number(value) || 0;
  return `${num >= 0 ? '+' : ''}${num.toFixed(digits)}%`;
}
