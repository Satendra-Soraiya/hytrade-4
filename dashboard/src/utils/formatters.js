/**
 * Format a number as currency
 * @param {number} value - The numeric value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
};

/**
 * Format a number as a percentage
 * @param {number} value - The numeric value to format (e.g., 0.05 for 5%)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a large number with K, L, Cr suffixes
 * @param {number} num - The number to format
 * @returns {string} Formatted string with suffix
 */
export const formatLargeNumber = (num) => {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(2) + ' Cr';
  }
  if (num >= 100000) {
    return (num / 100000).toFixed(2) + ' L';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toString();
};

/**
 * Format date to a readable string
 * @param {Date|string|number} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
