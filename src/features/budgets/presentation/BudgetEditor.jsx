import { Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';
import { applyBudgetDraftWithCash, createBudgetDraft } from '../domain/budgetDraft.js';
import { calculateBudgetSummary } from '../domain/budgetCalculations.js';
import { BudgetChart } from './BudgetChart.jsx';
import { SelectExpenseTypes } from '../../../shared/presentation/SelectExpenseTypes.jsx';

const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export function BudgetEditor({ budget, onSave, expenseTypes }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(() => createBudgetDraft(budget));
  const [isSaving, setIsSaving] = useState(false);
  const skipAutoSaveRef = useRef(true);
  const lastSavedExpensesRef = useRef('');
  const previewBudget = useMemo(() => applyBudgetDraftWithCash(budget, draft), [budget, draft]);
  const summary = useMemo(() => calculateBudgetSummary(previewBudget), [previewBudget]);
  const expensesSignature = useMemo(
    () => JSON.stringify({ expenses: draft.expenses, additionals: draft.additionals }),
    [draft.expenses, draft.additionals],
  );

  if (!lastSavedExpensesRef.current) {
    lastSavedExpensesRef.current = expensesSignature;
  }

  useEffect(() => {
    const nextDraft = createBudgetDraft(budget);
    skipAutoSaveRef.current = true;
    lastSavedExpensesRef.current = JSON.stringify({ expenses: nextDraft.expenses, additionals: nextDraft.additionals });
    setDraft(nextDraft);
  }, [budget?._id]);

  useEffect(() => {
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return undefined;
    }

    if (lastSavedExpensesRef.current === expensesSignature) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(applyBudgetDraftWithCash(budget, draft));
        lastSavedExpensesRef.current = expensesSignature;
      } finally {
        setIsSaving(false);
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [expensesSignature, budget?._id]);

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

  return (
    <div className="dashboard-main">
      <div className="summary-grid">
        <Metric label={t('budget.available')} value={summary.available} highlight />
        <Metric label={t('budget.salary')} value={draft.basics.salary} />
        <Metric label={t('budget.savings')} value={summary.savings} />
        <Metric label={t('budget.fixedExpenses')} value={summary.fixedExpenses} />
        <Metric label={t('budget.variableExpenses')} value={summary.additionalExpenses} />
        <Metric label="Cash" value={summary.cash} />
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
            <span className={`autosave-status${isSaving ? ' autosave-status--saving' : ''}`} role="status">
              {isSaving ? t('budget.saving') : t('budget.autoSaved')}
            </span>
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
            <label>
              Efectivo
              <input
                type="number" 
                value={draft.basics.cash}
                onChange={(event) => updateDraft(['basics', 'cash'], event.target.value)}
              />
            </label>
          </div>
        </section>
      </div>

      <div className="content-grid">
        <EditableRowsFixedExpenses
          title={t('budget.fixedExpenses')}
          addLabel={t('budget.addFixedExpense')}
          rows={draft.expenses}
          nameField="expense"
          amountField="amount"
          nameLabel={t('budget.expense')}
          amountLabel={t('budget.amount')}
          onChange={(rows) => setDraft((current) => ({ ...current, expenses: rows }))}
          expenseTypes={expenseTypes}
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

function EditableRowsFixedExpenses({ title, addLabel, rows, nameField, amountField, nameLabel, amountLabel, onChange, expenseTypes }) {
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
        <Button type="button" variant="secondary" aria-label={addLabel} title={addLabel} onClick={() => onChange([...rows, { [nameField]: '', [amountField]: '' }])}>
          <Plus size={18} />
        </Button>
      </div>
      <div className="editable-rows">
        {rows.map((row, index) => (
          <div className="editable-row" key={index}>
            <label>
              {nameLabel}
              {/*<input value={row[nameField]} onChange={(event) => update(index, nameField, event.target.value)} />*/}
              {/*<label>{t(`budget.${row[nameField]}`)}</label>*/}
              {/*<select onChange={(event) => update(index, nameField, event.target.value)}>
                { expenseTypes.map((index, type) => (
                  <option key={index} value={type}>type.</option>
                )) }
              </select>*/}
              <SelectExpenseTypes value={row[nameField]} expenseTypes={expenseTypes} update={update} index={index} nameField={nameField} t={t} />
            </label>
            <label>
              {amountLabel}
              <IncrementAmount
                value={row[amountField]}
                onChange={(value) => update(index, amountField, value)}
                label={amountLabel}
              />
            </label>
            <IconButton label={t('budget.remove')} onClick={() => remove(index)} />
          </div>
        ))}
      </div>
    </section>
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
        <Button type="button" variant="secondary" aria-label={addLabel} title={addLabel} onClick={() => onChange([...rows, { [nameField]: '', [amountField]: '' }])}>
          <Plus size={18} />
        </Button>
      </div>
      <div className="editable-rows">
        {rows.map((row, index) => (
          <div className="editable-row" key={index}>
            <label>
              {nameLabel}
              { <input value={row[nameField]} onChange={(event) => update(index, nameField, event.target.value)} /> }
            </label>
            <label>
              {amountLabel}
              <IncrementAmount
                value={row[amountField]}
                onChange={(value) => update(index, amountField, value)}
                label={amountLabel}
              />
            </label>
            <IconButton label={t('budget.remove')} onClick={() => remove(index)} />
          </div>
        ))}
      </div>
    </section>
  );
}

function IncrementAmount({ value, onChange, label }) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [operation, setOperation] = useState('add');
  const [adjustment, setAdjustment] = useState('');
  const currentValue = Number(value || 0);
  const hasValue = value !== '' && value !== null && value !== undefined;

  const applyAdjustment = (event) => {
    event.preventDefault();
    const amount = Number(adjustment);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const nextValue = operation === 'add' ? currentValue + amount : Math.max(0, currentValue - amount);
    onChange(String(nextValue));
    setAdjustment('');
    setIsOpen(false);
  };

  return (
    <div className="increment-amount">
      <button
        className={`amount-trigger ${hasValue ? '' : 'amount-trigger--empty'}`.trim()}
        type="button"
        aria-expanded={isOpen}
        aria-label={`${label}: ${hasValue ? currency.format(currentValue) : t('budget.addAmount')}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        {hasValue ? currency.format(currentValue) : t('budget.addAmount')}
        <Plus size={16} />
      </button>
      {isOpen ? (
        <form className="increment-popover" onSubmit={applyAdjustment}>
          <div className="increment-popover__header">
            <strong>{t('budget.adjustAmount')}</strong>
            <button type="button" className="increment-popover__close" onClick={() => setIsOpen(false)} aria-label={t('budget.cancel')}>
              ×
            </button>
          </div>
          <div className="increment-toggle" role="group" aria-label={t('budget.adjustAmount')}>
            <button className={operation === 'add' ? 'active' : ''} type="button" onClick={() => setOperation('add')}>
              <Plus size={15} /> {t('budget.add')}
            </button>
            <button className={operation === 'subtract' ? 'active' : ''} type="button" onClick={() => setOperation('subtract')}>
              <Minus size={15} /> {t('budget.subtract')}
            </button>
          </div>
          <label>
            {t('budget.adjustment')}
            <input
              autoFocus
              min="0"
              step="1"
              type="number"
              inputMode="decimal"
              value={adjustment}
              onChange={(event) => setAdjustment(event.target.value)}
              placeholder="0"
            />
          </label>
          <button className="button button--primary increment-popover__submit" type="submit">
            {t('budget.applyAdjustment')}
          </button>
        </form>
      ) : null}
    </div>
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
