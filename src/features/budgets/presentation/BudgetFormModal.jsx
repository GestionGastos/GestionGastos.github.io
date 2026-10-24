import { Check, Plus, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { DomainAction } from '../../../shared/domain/actions.js';
import { OperationStatus } from '../../../shared/domain/operation.js';
import { FormFeedback } from '../../../shared/presentation/FormFeedback.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { Button } from '../../../shared/presentation/Button.jsx';
import { Field } from '../../../shared/presentation/Field.jsx';
import { Modal } from '../../../shared/presentation/Modal.jsx';
import { SelectMonth } from '../../../shared/presentation/SelectMonth.jsx';
import { SelectExpenseTypes } from '../../../shared/presentation/SelectExpenseTypes.jsx';
import {
  BUDGET_MONTHS,
  BUDGET_STEPS,
  cleanBudgetExpenses,
  cleanBudgetTags,
  executeCreateBudget,
  previewBudgetSummary,
  validateBudgetStep,
} from '../domain/budgetActions.js';

const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export function BudgetFormModal({ onClose, onSubmit, expenseTypes = [] }) {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();
  const salaryRef = useRef(null);
  const tagRef = useRef(null);
  const [step, setStep] = useState(0);
  const [basics, setBasics] = useState({
    year: String(currentYear),
    month: BUDGET_MONTHS[new Date().getMonth()],
    salary: '',
    save: '0',
    additionalIncome: '0',
    cash: '0',
  });
  const [expenses, setExpenses] = useState([{ expense: '', amount: '' }]);
  const [tags, setTags] = useState([{ tag: '' }]);
  const [status, setStatus] = useState(OperationStatus.idle);
  const [message, setMessage] = useState('');
  const [stepErrors, setStepErrors] = useState({});
  const steps = useMemo(() => [
    t('budget.stepBasics'),
    t('budget.stepExpenses'),
    t('budget.stepTags'),
    t('budget.stepConfirmation'),
  ], [t]);
  const preview = useMemo(() => previewBudgetSummary({ basics, expenses, tags }), [basics, expenses, tags]);
  const busy = status === OperationStatus.loading || status === OperationStatus.success;
  const messages = {
    requiredBasics: t('budget.requiredBasics'),
    requiredExpense: t('budget.requiredExpense'),
    requiredTag: t('budget.requiredTag'),
    saveSuccess: (values) => t('budget.saveSuccess', values),
    networkError: t('auth.networkError'),
  };

  const applyStepValidation = (targetStep) => {
    const errors = validateBudgetStep(targetStep, { basics, expenses, tags }, messages);
    const key = Object.keys(errors)[0];
    if (key) {
      setStepErrors((current) => ({ ...current, ...errors }));
      setStatus(OperationStatus.error);
      setMessage(t('auth.required'));
      if (targetStep === 0) salaryRef.current?.focus();
      if (targetStep === 2) tagRef.current?.focus();
      return false;
    }
    setStepErrors((current) => ({ ...current, [keyForStep(targetStep)]: '' }));
    return true;
  };

  const next = () => {
    setStatus(OperationStatus.validating);
    if (!applyStepValidation(step)) {
      return;
    }
    setStatus(OperationStatus.editing);
    setMessage('');
    setStep((current) => current + 1);
  };

  const goToStep = (nextStep) => {
    if (nextStep > step && !applyStepValidation(step)) {
      return;
    }
    setMessage('');
    setStep(nextStep);
  };

  const save = async () => {
    if (![0, 1, 2].every((target) => applyStepValidation(target))) {
      const invalidStep = [0, 1, 2].find((target) => Object.keys(validateBudgetStep(target, { basics, expenses, tags }, messages)).length);
      if (invalidStep !== undefined) {
        setStep(invalidStep);
      }
      return;
    }

    setStatus(OperationStatus.loading);
    setMessage(t('budget.savingBudget'));
    const result = await executeCreateBudget({ basics, expenses, tags }, onSubmit, messages, (value) => currency.format(value));
    setStatus(result.status);
    setMessage(result.message);

    if (result.status === OperationStatus.success) {
      window.setTimeout(onClose, 1800);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    if (step < 3) {
      next();
      return;
    }
    save();
  };

  return (
    <Modal ariaLabel={t('budget.newBudget')}>
      <form className="budget-wizard" onSubmit={handleSubmit} noValidate aria-busy={status === OperationStatus.loading} data-form={DomainAction.create_budget}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{t('budget.newBudget')}</p>
            <h2 id="budget-wizard-title">{t('budget.stepHeading', { step: step + 1, label: steps[step] })}</h2>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} aria-label={t('budget.closeWizard')} data-action="close-budget-wizard">
            <X size={18} />
          </Button>
        </div>
        <ol className="stepper" aria-label={t('budget.wizardProgress')}>
          {steps.map((label, index) => {
            const state = index < step ? t('budget.stepCompleted') : index === step ? t('budget.stepCurrent') : t('budget.stepPending');
            return (
              <li key={BUDGET_STEPS[index].id}>
                <button
                  className={index === step ? 'active' : index < step ? 'completed' : ''}
                  type="button"
                  onClick={() => goToStep(index)}
                  aria-current={index === step ? 'step' : undefined}
                  aria-label={t('budget.stepHeading', { step: index + 1, label: `${label}, ${state}` })}
                  data-action={BUDGET_STEPS[index].action}
                >
                  {index < step ? <Check size={14} /> : index + 1}
                  <span>{label}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <FormFeedback id="budget-feedback" status={status} message={message} />
        {step === 0 ? <BasicsStep basics={basics} setBasics={setBasics} t={t} salaryRef={salaryRef} error={stepErrors.basics} /> : null}
        {step === 1 ? <ExpensesStep rows={expenses} setRows={setExpenses} expenseTypes={expenseTypes} t={t} error={stepErrors.expenses} /> : null}
        {step === 2 ? <TagsStep rows={tags} setRows={setTags} t={t} tagRef={tagRef} error={stepErrors.tags} /> : null}
        {step === 3 ? <Confirmation basics={basics} expenses={cleanBudgetExpenses(expenses)} tags={cleanBudgetTags(tags)} available={preview.available} t={t} /> : null}
        <div className="modal-actions">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((current) => current - 1)} data-action="previous-budget-step">
              {step === 1 ? t('budget.backToBasics') : step === 2 ? t('budget.backToExpenses') : t('budget.backToTags')}
            </Button>
          ) : (
            <Button type="button" variant="secondary" className="form-cancel-button" onClick={onClose} data-action="cancel-budget">
              {t('budget.cancel')}
            </Button>
          )}
          {step < 3 ? (
            <Button type="submit" data-action={`next-budget-step-${step + 1}`}>
              {step === 0 ? t('budget.nextExpenses') : step === 1 ? t('budget.nextTags') : t('budget.nextConfirmation')}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={busy}
              aria-busy={status === OperationStatus.loading}
              data-action={DomainAction.save_budget}
            >
              {status === OperationStatus.loading ? t('budget.savingBudget') : status === OperationStatus.error ? t('budget.retrySave') : t('budget.saveBudget')}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}

function keyForStep(step) {
  return ['basics', 'expenses', 'tags'][step];
}

function BasicsStep({ basics, setBasics, t, salaryRef, error }) {
  const update = (field) => (event) => setBasics((current) => ({ ...current, [field]: event.target.value }));

  return (
    <fieldset className="form-stack">
      <legend>{t('budget.basicInfo')}</legend>
      {error ? <p id="budget-basics-error" className="field-error" role="alert">{error}</p> : null}
      <div className="two-column">
        <Field id="budget-year" label={t('budget.year')} required>
          <input name="budget-year" inputMode="numeric" value={basics.year} onChange={update('year')} />
        </Field>
        <Field id="budget-month" label={t('budget.month')} required>
          <SelectMonth name="budget-month" setValue={setBasics} value={basics.month} />
        </Field>
      </div>
      <Field id="budget-salary" label={t('budget.salary')} error={error} required>
        <input ref={salaryRef} name="budget-salary" type="number" min="1" value={basics.salary} onChange={update('salary')} />
      </Field>
      <div className="two-column">
        <Field id="budget-savings" label={t('budget.savings')}>
          <input name="budget-savings" type="number" min="0" value={basics.save} onChange={update('save')} />
        </Field>
        <Field id="budget-additional-income" label={t('budget.additionalIncome')}>
          <input name="budget-additional-income" type="number" min="0" value={basics.additionalIncome} onChange={update('additionalIncome')} />
        </Field>
        <Field id="budget-cash" label={t('budget.cash')}>
          <input name="budget-cash" type="number" min="0" value={basics.cash} onChange={update('cash')} />
        </Field>
      </div>
    </fieldset>
  );
}

function ExpensesStep({ rows, setRows, expenseTypes, t, error }) {
  return (
    <fieldset className="form-stack">
      <legend>{t('budget.fixedExpenses')}</legend>
      {error ? <p id="budget-expenses-error" className="field-error" role="alert">{error}</p> : null}
      {rows.map((row, index) => (
        <div className="two-column" key={`expense-${index}`}>
          <Field id={`budget-expense-type-${index}`} label={t('budget.expenseType', { n: index + 1 })} required>
            <SelectExpenseTypes
              name={`budget-expense-type-${index}`}
              setRows={setRows}
              shape={{ name: 'expense', amount: 'amount' }}
              expenseTypes={expenseTypes}
              t={t}
              updateRow={updateRow}
              index={index}
              value={row.expense}
              module="budget-form"
            />
          </Field>
          <Field id={`budget-expense-amount-${index}`} label={t('budget.expenseAmount', { n: index + 1 })} required>
            <input name={`budget-expense-amount-${index}`} type="number" min="0" value={row.amount} onChange={(event) => updateRow(setRows, index, 'amount', event.target.value)} />
          </Field>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        className="add-row-button"
        data-action={DomainAction.add_budget_expense}
        aria-label={t('budget.addExpense')}
        onClick={() => setRows((current) => [...current, { expense: '', amount: '' }])}
      >
        <Plus size={18} />
        <span>{t('budget.addExpense')}</span>
      </Button>
    </fieldset>
  );
}

function TagsStep({ rows, setRows, t, tagRef, error }) {
  return (
    <fieldset className="form-stack">
      <legend>{t('budget.tags')}</legend>
      <p id="budget-tags-helper" className="field-help">{t('budget.requiredTag')}</p>
      {error ? <p id="budget-tags-error" className="field-error" role="alert">{error}</p> : null}
      {rows.map((row, index) => (
        <Field
          key={`tag-${index}`}
          id={`budget-tag-${index}`}
          label={t('budget.tagN', { n: index + 1 })}
          required
          error={error && !row.tag ? t('budget.requiredTag') : ''}
          describedBy="budget-tags-helper"
        >
          <input
            ref={index === 0 ? tagRef : undefined}
            name={`budget-tag-${index}`}
            value={row.tag}
            onChange={(event) => updateRow(setRows, index, 'tag', event.target.value)}
          />
        </Field>
      ))}
      <Button
        type="button"
        variant="secondary"
        className="add-row-button"
        data-action={DomainAction.add_budget_tag}
        aria-label={t('budget.addTag')}
        onClick={() => setRows((current) => [...current, { tag: '' }])}
      >
        <Plus size={18} />
        <span>{t('budget.addTag')}</span>
      </Button>
    </fieldset>
  );
}

function Confirmation({ basics, expenses, tags, available, t }) {
  return (
    <section className="budget-confirmation" aria-labelledby="budget-wizard-title">
      <h3>{t('budget.confirmTitle')}</h3>
      <dl>
        <div>
          <dt>{t('budget.month')}</dt>
          <dd>{basics.month} {basics.year}</dd>
        </div>
        <div>
          <dt>{t('budget.salary')}</dt>
          <dd>{currency.format(Number(basics.salary || 0))}</dd>
        </div>
        <div>
          <dt>{t('budget.fixedExpenses')}</dt>
          <dd>{expenses.length}</dd>
        </div>
        <div>
          <dt>{t('budget.tags')}</dt>
          <dd>{tags.map((tag) => tag.tag).join(', ')}</dd>
        </div>
        <div>
          <dt>{t('budget.available')}</dt>
          <dd>{currency.format(Number(available || 0))}</dd>
        </div>
      </dl>
    </section>
  );
}

function updateRow(setRows, index, field, value) {
  setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
}
