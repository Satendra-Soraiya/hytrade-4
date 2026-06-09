/** Hytrade chart palette — works in light and dark MUI themes */
export const CHART_COLORS = [
  '#2563eb',
  '#0d9488',
  '#d97706',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
  '#ca8a04',
  '#db2777',
  '#059669',
  '#4f46e5',
  '#ea580c',
  '#0e7490',
];

export function getChartColor(index) {
  return CHART_COLORS[Math.abs(index) % CHART_COLORS.length];
}

export function enrichAllocationItems(items = [], totalValue = 0) {
  const sum = totalValue > 0
    ? totalValue
    : items.reduce((s, item) => s + (Number(item.value) || 0), 0) || 1;

  return items.map((item, index) => {
    const value = Number(item.value) || 0;
    return {
      name: item.name || item.stockSymbol || 'Unknown',
      value,
      color: item.color || getChartColor(index),
      percent: (value / sum) * 100,
    };
  });
}

export function buildChartSeries(timeline, fallback) {
  if (!timeline?.length) {
    return [{ label: 'Now', value: Number(fallback) || 0 }];
  }
  const dayMap = new Map();
  for (const point of timeline) {
    const d = new Date(point.date);
    const label = Number.isNaN(d.getTime())
      ? String(point.date)
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    dayMap.set(label, Number(point.value) || 0);
  }
  let entries = [...dayMap.entries()].map(([label, value]) => ({ label, value }));
  if (entries.length > 10) {
    const step = Math.ceil(entries.length / 10);
    entries = entries.filter((_, i) => i % step === 0 || i === entries.length - 1);
  }
  return entries;
}

export function chartYDomain(data) {
  const values = data.map((d) => d.value).filter((v) => Number.isFinite(v));
  if (!values.length) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    const pad = Math.max(Math.abs(max) * 0.1, 500);
    return [Math.max(0, min - pad), max + pad];
  }
  const pad = (max - min) * 0.1;
  return [Math.max(0, min - pad), max + pad];
}
