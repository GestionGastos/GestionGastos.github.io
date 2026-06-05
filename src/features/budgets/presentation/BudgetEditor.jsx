import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';
import { applyBudgetDraft, createBudgetDraft } from '../domain/budgetDraft.js';
import { calculateBudgetSummary } from '../domain/budgetCalculations.js';
import { BudgetChart } from './BudgetChart.jsx';

const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export function BudgetEditor({ budget, onSave }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(() => createBudgetDraft(budget));
  const [isSaving, setIsSaving] = useState(false);
  const previewBudget = useMemo(() => applyBudgetDraft(budget, draft), [budget, draft]);
  const summary = useMemo(() => calculateBudgetSummary(previewBudget), [previewBudget]);

  useEffect(() => {
    setDraft(createBudgetDraft(budget));
  }, [budget?._id]);

  const updateDraft = (path, value) => {
    setDraft((current) => {
      const next = structuredClone(current);
      setByPath(next, path, value);
      return next;
    });
  };

  const addFromTag = (tag) => {
    setDraft((current) => ({
      ...current,
      additionals: [...current.additionals, { name: tag, amount: '' }],
    }));
  };

  const save = async () => {
    setIsSaving(true);
    await onSave(applyBudgetDraft(budget, draft));
    setIsSaving(false);
  };

  return (
    <div className="dashboard-main">
      <div className="summary-grid">
        <Metric label={t('budget.available')} value={summary.available} highlight />
        <Metric label={t('budget.salary')} value={draft.basics.salary} />
        <Metric label={t('budget.savings')} value={summary.savings} />
        <Metric label={t('budget.fixedExpenses')} value={summary.fixedExpenses} />
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{t('budget.editBudget')}</h2>
              <p className="muted">
                {draft.month}, {draft.year}
              </p>
            </div>
            <Button type="button" onClick={save} disabled={isSaving}>
              <Save size={18} /> {t('budget.updateBudget')}
            </Button>
          </div>
          <BudgetChart budget={previewBudget} />
        </section>

        <section className="panel">
          <h2>{t('budget.basicInfo')}</h2>
          <div className="editable-list">
            <div className="two-column">
              <label>
                {t('budget.year')}
                <input value={draft.year} onChange={(event) => updateDraft(['year'], event.target.value)} />
              </label>
              <label>
                {t('budget.month')}
                <input value={draft.month} onChange={(event) => updateDraft(['month'], event.target.value)} />
              </label>
            </div>
            <label>
              {t('budget.salary')}
              <input type="number" value={draft.basics.salary} onChange={(event) => updateDraft(['basics', 'salary'], event.target.value)} />
            </label>
            <div className="two-column">
              <label>
                {t('budget.savings')}
                <input type="number" value={draft.basics.save} onChange={(event) => updateDraft(['basics', 'save'], event.target.value)} />
              </label>
              <label>
                {t('budget.additionalIncome')}
                <input
                  type="number"
                  value={draft.basics.additionalIncome}
                  onChange={(event) => updateDraft(['basics', 'additionalIncome'], event.target.value)}
                />
              </label>
            </div>
          </div>
        </section>
      </div>

      <div className="content-grid">
        <EditableRows
          title={t('budget.fixedExpenses')}
          addLabel={t('budget.addFixedExpense')}
          rows={draft.expenses}
          nameField="expense"
          amountField="amount"
          nameLabel={t('budget.expense')}
          amountLabel={t('budget.amount')}
          onChange={(rows) => setDraft((current) => ({ ...current, expenses: rows }))}
        />
        <EditableRows
          title={t('budget.variableExpenses')}
          addLabel={t('budget.addVariableExpense')}
          rows={draft.additionals}
          nameField="name"
          amountField="amount"
          nameLabel={t('budget.expense')}
          amountLabel={t('budget.amount')}
          onChange={(rows) => setDraft((current) => ({ ...current, additionals: rows }))}
        />
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h2>{t('budget.tags')}</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDraft((current) => ({ ...current, tags: [...current.tags, { tag: '' }] }))}
          >
            <Plus size={18} /> {t('budget.tags')}
          </Button>
        </div>
        <div className="tag-editor">
          {draft.tags.map((tag, index) => (
            <div className="tag-editor__row" key={index}>
              <input value={tag.tag} onChange={(event) => updateDraft(['tags', index, 'tag'], event.target.value)} />
              <Button type="button" variant="ghost" onClick={() => addFromTag(tag.tag)} disabled={!tag.tag}>
                <Plus size={18} /> {t('budget.addVariableExpense')}
              </Button>
              <IconButton label={t('budget.remove')} onClick={() => removeRow(setDraft, 'tags', index)} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EditableRows({ title, addLabel, rows, nameField, amountField, nameLabel, amountLabel, onChange }) {
  const { t } = useI18n();

  const update = (index, field, value) => {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const remove = (index) => {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    onChange(nextRows.length ? nextRows : [{ [nameField]: '', [amountField]: '' }]);
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        <Button type="button" variant="secondary" onClick={() => onChange([...rows, { [nameField]: '', [amountField]: '' }])}>
          <Plus size={18} /> {addLabel}
        </Button>
      </div>
      <div className="editable-rows">
        {rows.map((row, index) => (
          <div className="editable-row" key={index}>
            <label>
              {nameLabel}
              <input value={row[nameField]} onChange={(event) => update(index, nameField, event.target.value)} />
            </label>
            <label>
              {amountLabel}
              <input type="number" value={row[amountField]} onChange={(event) => update(index, amountField, event.target.value)} />
            </label>
            <IconButton label={t('budget.remove')} onClick={() => remove(index)} />
          </div>
        ))}
      </div>
    </section>
  );
}

function IconButton({ label, onClick, disabled = false }) {
  return (
    <button className="icon-button" type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      <Trash2 size={18} />
    </button>
  );
}

function Metric({ label, value, highlight = false }) {
  return (
    <article className={`metric ${highlight ? 'metric--highlight' : ''}`}>
      <span>{label}</span>
      <strong>{currency.format(Number(value ?? 0))}</strong>
    </article>
  );
}

function removeRow(setDraft, collection, index) {
  setDraft((current) => {
    const nextRows = current[collection].filter((_, rowIndex) => rowIndex !== index);
    return { ...current, [collection]: nextRows.length ? nextRows : [{ tag: '' }] };
  });
}

function setByPath(target, path, value) {
  let cursor = target;
  path.slice(0, -1).forEach((key) => {
    cursor = cursor[key];
  });
  cursor[path.at(-1)] = value;
}
