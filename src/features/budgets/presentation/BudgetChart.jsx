import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { chartSegments } from '../domain/budgetCalculations.js';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { formatCurrency } from '../../../shared/i18n/currency.js';

export function BudgetChart({ budget }) {
  const { t } = useI18n();
  const segments = chartSegments(budget).map((segment) => ({ ...segment, label: t(`budget.chart.${segment.label}`) }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (!segments.length) return <div className="chart-card chart-card--empty" role="img" aria-label={t('budget.chart.empty')}>{t('budget.chart.empty')}</div>;

  return (
    <div className="chart-card chart-card--modern">
      <div className="budget-pie" role="img" aria-label={t('budget.chart.description', { total: formatCurrency(total) })}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={segments} dataKey="value" nameKey="label" innerRadius="68%" outerRadius="96%" paddingAngle={3} stroke="none" cornerRadius={5}>
              {segments.map((segment) => <Cell key={segment.label} fill={resolveChartColor(segment.color)} />)}
            </Pie>
            <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name]} contentStyle={{ borderRadius: 12, border: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)', color: 'var(--color-on-surface)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="budget-pie__center"><small>{t('budget.chart.total')}</small><strong>{formatCurrency(total)}</strong></div>
      </div>
      <div className="chart-legend" aria-label={t('budget.chart.legend')}>
        {segments.map((segment) => <span key={segment.label}><i style={{ background: resolveChartColor(segment.color) }} />{segment.label}<strong>{formatCurrency(segment.value)}</strong></span>)}
      </div>
    </div>
  );
}

function resolveChartColor(token) {
  if (token.includes('secondary')) return 'var(--color-secondary)';
  if (token.includes('primary')) return 'var(--color-primary)';
  if (token.includes('tertiary')) return 'var(--color-tertiary)';
  return 'var(--color-outline)';
}
