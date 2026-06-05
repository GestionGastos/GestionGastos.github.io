import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function BudgetFormModal({ onClose, onSubmit }) {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  const [step, setStep] = useState(0);
  const [basics, setBasics] = useState({ year: String(currentYear), month: monthNames[new Date().getMonth()], salary: '', save: '0', additionalIncome: '0' });
  const [expenses, setExpenses] = useState([{ expense: '', amount: '' }]);
  const [tags, setTags] = useState([{ tag: '' }]);
  const [error, setError] = useState('');

  const steps = useMemo(() => [t('budget.stepBasics'), t('budget.stepExpenses'), t('budget.stepTags')], [t]);

  const save = async () => {
    setError('');
    const cleanExpenses = expenses.filter((item) => item.expense && item.amount);
    const cleanTags = tags.filter((item) => item.tag);

    if (!basics.year || !basics.month || Number(basics.salary) <= 0) {
      setError(t('auth.required'));
      setStep(0);
      return;
    }

    if (!cleanExpenses.length) {
      setError(t('auth.required'));
      setStep(1);
      return;
    }

    if (!cleanTags.length) {
      setError(t('auth.required'));
      setStep(2);
      return;
    }

    await onSubmit({
      order: String(monthNames.findIndex((month) => month === basics.month) + 1),
      year: basics.year,
      month: basics.month,
      basics: {
        salary: basics.salary,
        save: basics.save || '0',
        additionalIncome: basics.additionalIncome || '0',
      },
      expenses: cleanExpenses,
      tags: cleanTags,
      additionals: [],
    });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-sheet">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{t('budget.newBudget')}</p>
            <h2>{steps[step]}</h2>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} aria-label={t('budget.cancel')}>
            <X size={18} />
          </Button>
        </div>
        <div className="stepper">
          {steps.map((label, index) => (
            <button className={index === step ? 'active' : ''} key={label} type="button" onClick={() => setStep(index)}>
              {label}
            </button>
          ))}
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        {step === 0 ? (
          <div className="form-stack">
            <div className="two-column">
              <label>
                {t('budget.year')}
                <input value={basics.year} onChange={(event) => setBasics((current) => ({ ...current, year: event.target.value }))} />
              </label>
              <label>
                {t('budget.month')}
                <select value={basics.month} onChange={(event) => setBasics((current) => ({ ...current, month: event.target.value }))}>
                  {monthNames.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              {t('budget.salary')}
              <input type="number" value={basics.salary} onChange={(event) => setBasics((current) => ({ ...current, salary: event.target.value }))} />
            </label>
            <div className="two-column">
              <label>
                {t('budget.savings')}
                <input type="number" value={basics.save} onChange={(event) => setBasics((current) => ({ ...current, save: event.target.value }))} />
              </label>
              <label>
                {t('budget.additionalIncome')}
                <input
                  type="number"
                  value={basics.additionalIncome}
                  onChange={(event) => setBasics((current) => ({ ...current, additionalIncome: event.target.value }))}
                />
              </label>
            </div>
          </div>
        ) : null}
        {step === 1 ? (
          <DynamicRows
            rows={expenses}
            setRows={setExpenses}
            labels={{ name: t('budget.expense'), amount: t('budget.amount'), add: t('budget.addExpense') }}
            shape={{ name: 'expense', amount: 'amount' }}
          />
        ) : null}
        {step === 2 ? <TagRows rows={tags} setRows={setTags} label={t('budget.tags')} /> : null}
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('budget.cancel')}
          </Button>
          {step < 2 ? (
            <Button type="button" onClick={() => setStep((current) => current + 1)}>
              {steps[step + 1]}
            </Button>
          ) : (
            <Button type="button" onClick={save}>
              {t('budget.save')}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function DynamicRows({ rows, setRows, labels, shape }) {
  return (
    <div className="form-stack">
      {rows.map((row, index) => (
        <div className="two-column" key={index}>
          <label>
            {labels.name}
            <input value={row[shape.name]} onChange={(event) => updateRow(setRows, index, shape.name, event.target.value)} />
          </label>
          <label>
            {labels.amount}
            <input type="number" value={row[shape.amount]} onChange={(event) => updateRow(setRows, index, shape.amount, event.target.value)} />
          </label>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, { [shape.name]: '', [shape.amount]: '' }])}>
        <Plus size={18} /> {labels.add}
      </Button>
    </div>
  );
}

function TagRows({ rows, setRows, label }) {
  return (
    <div className="form-stack">
      {rows.map((row, index) => (
        <label key={index}>
          {label}
          <input value={row.tag} onChange={(event) => updateRow(setRows, index, 'tag', event.target.value)} />
        </label>
      ))}
      <Button type="button" variant="secondary" onClick={() => setRows((current) => [...current, { tag: '' }])}>
        <Plus size={18} /> {label}
      </Button>
    </div>
  );
}

function updateRow(setRows, index, field, value) {
  setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
}
