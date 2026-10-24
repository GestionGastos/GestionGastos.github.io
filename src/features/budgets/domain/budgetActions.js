import { DomainAction, DomainErrorType } from '../../../shared/domain/actions.js';
import { createOperationResult, OperationStatus } from '../../../shared/domain/operation.js';
import { calculateBudgetSummary } from './budgetCalculations.js';

export const BUDGET_MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const BUDGET_STEPS = [
  { id: 'basics', action: 'budget-step-1' },
  { id: 'expenses', action: 'budget-step-2' },
  { id: 'tags', action: 'budget-step-3' },
  { id: 'confirmation', action: 'budget-step-4' },
];

export function cleanBudgetExpenses(expenses = []) {
  return expenses.filter((item) => item.expense && Number(item.amount) > 0);
}

export function cleanBudgetTags(tags = []) {
  return tags.filter((item) => String(item.tag ?? '').trim());
}

export function validateBudgetStep(step, { basics, expenses, tags }, messages) {
  if (step === 0 && (!basics.year || !basics.month || Number(basics.salary) <= 0)) {
    return { basics: messages.requiredBasics };
  }

  if (step === 1 && !cleanBudgetExpenses(expenses).length) {
    return { expenses: messages.requiredExpense };
  }

  if (step === 2 && !cleanBudgetTags(tags).length) {
    return { tags: messages.requiredTag };
  }

  return {};
}

export function buildBudgetPayload({ basics, expenses, tags }) {
  const cleanExpenses = cleanBudgetExpenses(expenses);
  const cleanTags = cleanBudgetTags(tags);

  return {
    order: String(BUDGET_MONTHS.findIndex((month) => month === basics.month) + 1),
    year: basics.year,
    month: basics.month,
    basics: {
      salary: basics.salary,
      save: basics.save || '0',
      additionalIncome: basics.additionalIncome || '0',
      cash: basics.cash || '0',
    },
    expenses: cleanExpenses,
    tags: cleanTags,
    additionals: [],
  };
}

export function previewBudgetSummary({ basics, expenses, tags }) {
  return calculateBudgetSummary({
    basics,
    expenses: cleanBudgetExpenses(expenses),
    additionals: [],
    tags: cleanBudgetTags(tags),
  });
}

export async function executeCreateBudget({ basics, expenses, tags }, submit, messages, formatAvailable) {
  const payload = buildBudgetPayload({ basics, expenses, tags });
  const summary = calculateBudgetSummary(payload);

  try {
    const data = await submit(payload);
    return createOperationResult({
      action: DomainAction.create_budget,
      status: OperationStatus.success,
      message: messages.saveSuccess({
        month: basics.month,
        year: basics.year,
        available: formatAvailable(summary.available),
      }),
      description: 'create_budget persisted the monthly budget and calculated totals',
      data: {
        budget: {
          year: Number(payload.year),
          month: Number(payload.order),
          salary: Number(payload.basics.salary),
          savings: Number(payload.basics.save),
          additionalIncome: Number(payload.basics.additionalIncome),
          cash: Number(payload.basics.cash),
          fixedExpenses: summary.fixedExpenses,
          tags: payload.tags.map((item) => item.tag),
        },
        summary: { available: summary.available },
        api: data,
      },
    });
  } catch (caught) {
    return createOperationResult({
      action: DomainAction.create_budget,
      status: OperationStatus.error,
      message: messages.networkError,
      description: 'create_budget failed while saving; form values are kept',
      error: { type: DomainErrorType.NETWORK, status: caught?.status ?? 0 },
    });
  }
}
