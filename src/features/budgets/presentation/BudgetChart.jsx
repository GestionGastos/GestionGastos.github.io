import { chartSegments } from '../domain/budgetCalculations.js';

export function BudgetChart({ budget }) {
  const segments = chartSegments(budget);
  const background = segments.length
    ? `conic-gradient(${segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(', ')})`
    : 'var(--color-surface-container-high)';

  return (
    <div className="chart-card">
      <div className="donut-chart" style={{ background }} />
      <div className="chart-legend">
        {segments.map((segment) => (
          <span key={segment.label}>
            <i style={{ background: segment.color }} />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  );
}
