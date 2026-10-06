import { Check, Plus, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { FormFeedback } from '../../../shared/presentation/FormFeedback.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';
import { Modal } from '../../../shared/presentation/Modal.jsx';
import { SelectMonth } from '../../../shared/presentation/SelectMonth.jsx';
import { SelectExpenseTypes } from '../../../shared/presentation/SelectExpenseTypes.jsx';
import { calculateBudgetSummary } from '../domain/budgetCalculations.js';

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function BudgetFormModal({ onClose, onSubmit, expenseTypes = [] }) {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  const salaryRef = useRef(null);
  const tagRef = useRef(null);
  const [step, setStep] = useState(0);
  const [basics, setBasics] = useState({ year: String(currentYear), month: monthNames[new Date().getMonth()], salary: '', save: '0', additionalIncome: '0', cash: '0' });
  const [expenses, setExpenses] = useState([{ expense: '', amount: '' }]);
  const [tags, setTags] = useState([{ tag: '' }]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [stepErrors, setStepErrors] = useState({});

  const steps = useMemo(() => [t('budget.stepBasics'), t('budget.stepExpenses'), t('budget.stepTags'), t('budget.stepConfirmation')], [t]);
  const cleanExpenses = expenses.filter((item) => item.expense && Number(item.amount) > 0);
  const cleanTags = tags.filter((item) => item.tag.trim());
  const preview = useMemo(() => calculateBudgetSummary({ basics, expenses: cleanExpenses, additionals: [], tags: cleanTags }), [basics, cleanExpenses, cleanTags]);

  const validateStep = (targetStep) => {
    if (targetStep === 0 && (!basics.year || !basics.month || Number(basics.salary) <= 0)) {
      setStepErrors((current) => ({ ...current, basics: t('budget.requiredBasics') }));
      salaryRef.current?.focus();
      return false;
    }
    if (targetStep === 1 && !cleanExpenses.length) {
      setStepErrors((current) => ({ ...current, expenses: t('budget.requiredExpense') }));
      return false;
    }
    if (targetStep === 2 && !cleanTags.length) {
      setStepErrors((current) => ({ ...current, tags: t('budget.requiredTag') }));
      tagRef.current?.focus();
      return false;
    }
    return true;
  };

  const next = () => {
    setStatus('validating');
    if (!validateStep(step)) {
      setStatus('error');
      setMessage(t('auth.required'));
      return;
    }
    setStepErrors((current) => ({ ...current, [step === 0 ? 'basics' : step === 1 ? 'expenses' : 'tags']: '' }));
    setStatus('editing');
    setMessage('');
    setStep((current) => current + 1);
  };

  const goToStep = (nextStep) => {
    if (nextStep > step && !validateStep(step)) {
      setStatus('error');
      setMessage(t('auth.required'));
      return;
    }
    setMessage('');
    setStep(nextStep);
  };

  const payload = () => ({
    order: String(monthNames.findIndex((month) => month === basics.month) + 1),
    year: basics.year,
    month: basics.month,
    basics: { salary: basics.salary, save: basics.save || '0', additionalIncome: basics.additionalIncome || '0', cash: basics.cash || '0' },
    expenses: cleanExpenses,
    tags: cleanTags,
    additionals: [],
  });

  const save = async () => {
    if (![0, 1, 2].every(validateStep)) {
      setStatus('error');
      setMessage(t('auth.required'));
      return;
    }
    setStatus('loading');
    setMessage(t('budget.savingBudget'));
    try {
      await onSubmit(payload());
      setStatus('success');
      setMessage(t('budget.saveSuccess', { month: basics.month, year: basics.year, available: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(preview.available) }));
      window.setTimeout(onClose, 800);
    } catch {
      setStatus('error');
      setMessage(t('auth.networkError'));
    }
  };

  return (
    <Modal ariaLabel={t('budget.newBudget')}>
      <div className="modal-heading">
        <div><p className="eyebrow">{t('budget.newBudget')}</p><h2 id="budget-wizard-title">{steps[step]}</h2></div>
        <Button type="button" variant="ghost" onClick={onClose} aria-label={t('budget.cancel')} data-action="close-budget-wizard"><X size={18} /></Button>
      </div>
      <ol className="stepper" aria-label={t('budget.newBudget')}>
        {steps.map((label, index) => <li key={label}><button className={index === step ? 'active' : index < step ? 'completed' : ''} type="button" onClick={() => goToStep(index)} aria-current={index === step ? 'step' : undefined} aria-label={`${label} (${index < step ? 'completado' : index === step ? 'actual' : 'pendiente'})`} data-action={`budget-step-${index + 1}`}>{index < step ? <Check size={14} /> : index + 1}<span>{label}</span></button></li>)}
      </ol>
      <FormFeedback id="budget-feedback" status={status} message={message} />
      {step === 0 ? <BasicsStep basics={basics} setBasics={setBasics} t={t} salaryRef={salaryRef} error={stepErrors.basics} /> : null}
      {step === 1 ? <ExpensesStep rows={expenses} setRows={setExpenses} expenseTypes={expenseTypes} t={t} error={stepErrors.expenses} /> : null}
      {step === 2 ? <TagsStep rows={tags} setRows={setTags} t={t} tagRef={tagRef} error={stepErrors.tags} /> : null}
      {step === 3 ? <Confirmation basics={basics} expenses={cleanExpenses} tags={cleanTags} available={preview.available} t={t} /> : null}
      <div className="modal-actions">
        {step > 0 ? <Button type="button" variant="ghost" onClick={() => setStep((current) => current - 1)} data-action="previous-budget-step">{step === 1 ? t('budget.backToBasics') : step === 2 ? t('budget.backToExpenses') : t('budget.backToTags')}</Button> : <Button type="button" variant="secondary" className="form-cancel-button" onClick={onClose}>{t('budget.cancel')}</Button>}
        {step < 3 ? <Button type="button" onClick={next} data-action={`next-budget-step-${step + 1}`}>{step === 0 ? t('budget.nextExpenses') : step === 1 ? t('budget.nextTags') : t('budget.nextConfirmation')}</Button> : <Button type="button" onClick={save} disabled={status === 'loading' || status === 'success'} aria-busy={status === 'loading'} data-action="create-budget">{status === 'loading' ? t('budget.savingBudget') : status === 'error' ? t('budget.retrySave') : t('budget.save')}</Button>}
      </div>
    </Modal>
  );
}

function BasicsStep({ basics, setBasics, t, salaryRef, error }) {
  const update = (field) => (event) => setBasics((current) => ({ ...current, [field]: event.target.value }));
  return <fieldset className="form-stack" aria-describedby={error ? 'budget-basics-error' : undefined}><legend>{t('budget.basicInfo')}</legend>{error ? <p id="budget-basics-error" className="field-error" role="alert">{error}</p> : null}<div className="two-column"><label htmlFor="budget-year">{t('budget.year')} <span aria-hidden="true">*</span><input id="budget-year" name="budget-year" inputMode="numeric" value={basics.year} onChange={update('year')} required /></label><label htmlFor="budget-month">{t('budget.month')} <span aria-hidden="true">*</span><SelectMonth id="budget-month" name="budget-month" setValue={setBasics} value={basics.month} required /></label></div><label htmlFor="budget-salary">{t('budget.salary')} <span aria-hidden="true">*</span><input ref={salaryRef} id="budget-salary" name="budget-salary" type="number" min="1" value={basics.salary} onChange={update('salary')} required /></label><div className="two-column"><label htmlFor="budget-savings">{t('budget.savings')}<input id="budget-savings" name="budget-savings" type="number" min="0" value={basics.save} onChange={update('save')} /></label><label htmlFor="budget-additional-income">{t('budget.additionalIncome')}<input id="budget-additional-income" name="budget-additional-income" type="number" min="0" value={basics.additionalIncome} onChange={update('additionalIncome')} /></label><label htmlFor="budget-cash">{t('budget.cash')}<input id="budget-cash" name="budget-cash" type="number" min="0" value={basics.cash} onChange={update('cash')} /></label></div></fieldset>;
}

function ExpensesStep({ rows, setRows, expenseTypes, t, error }) {
  return <fieldset className="form-stack" aria-describedby={error ? 'budget-expenses-error' : undefined}><legend>{t('budget.fixedExpenses')}</legend>{error ? <p id="budget-expenses-error" className="field-error" role="alert">{error}</p> : null}{rows.map((row, index) => <div className="two-column" key={`expense-${index}`}><label htmlFor={`budget-expense-type-${index}`}>{t('budget.expense')}<SelectExpenseTypes id={`budget-expense-type-${index}`} name={`budget-expense-type-${index}`} setRows={setRows} shape={{ name: 'expense', amount: 'amount' }} expenseTypes={expenseTypes} t={t} updateRow={updateRow} index={index} value={row.expense} module="budget-form" /></label><label htmlFor={`budget-expense-amount-${index}`}>{t('budget.amount')}<input id={`budget-expense-amount-${index}`} name={`budget-expense-amount-${index}`} type="number" min="0" value={row.amount} onChange={(event) => updateRow(setRows, index, 'amount', event.target.value)} /></label></div>)}<Button type="button" variant="secondary" className="add-row-button" data-action="add_budget_expense" aria-label={t('budget.addExpense')} onClick={() => setRows((current) => [...current, { expense: '', amount: '' }])}><Plus size={18} /><span>{t('budget.addExpense')}</span></Button></fieldset>;
}

function TagsStep({ rows, setRows, t, tagRef, error }) {
  return <fieldset className="form-stack" aria-describedby="budget-tags-helper"><legend>{t('budget.tags')}</legend><p id="budget-tags-helper" className="field-help">{t('budget.requiredTag')}</p>{error ? <p className="field-error" role="alert">{error}</p> : null}{rows.map((row, index) => <label key={`tag-${index}`} htmlFor={`budget-tag-${index}`}>{`${t('budget.tags')} ${index + 1}`}<input ref={index === 0 ? tagRef : undefined} id={`budget-tag-${index}`} name={`budget-tag-${index}`} value={row.tag} onChange={(event) => updateRow(setRows, index, 'tag', event.target.value)} aria-invalid={Boolean(error && !row.tag)} /></label>)}<Button type="button" variant="secondary" className="add-row-button" data-action="add_budget_tag" aria-label={t('budget.addTag')} onClick={() => setRows((current) => [...current, { tag: '' }])}><Plus size={18} /><span>{t('budget.addTag')}</span></Button></fieldset>;
}

function Confirmation({ basics, expenses, tags, available, t }) {
  const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  return <section className="budget-confirmation" aria-labelledby="budget-wizard-title"><h3>{t('budget.confirmTitle')}</h3><dl><div><dt>{t('budget.month')}</dt><dd>{basics.month} {basics.year}</dd></div><div><dt>{t('budget.salary')}</dt><dd>{currency.format(Number(basics.salary || 0))}</dd></div><div><dt>{t('budget.fixedExpenses')}</dt><dd>{expenses.length}</dd></div><div><dt>{t('budget.tags')}</dt><dd>{tags.map((tag) => tag.tag).join(', ')}</dd></div><div><dt>{t('budget.available')}</dt><dd>{currency.format(Number(available || 0))}</dd></div></dl></section>;
}

function updateRow(setRows, index, field, value) {
  setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
}
