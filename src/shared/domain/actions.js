export const DomainAction = Object.freeze({
  register_user: 'register_user',
  login_user: 'login_user',
  create_budget: 'create_budget',
  add_budget_expense: 'add_budget_expense',
  add_budget_tag: 'add_budget_tag',
  save_budget: 'save_budget',
});

export const DomainErrorType = Object.freeze({
  VALIDATION: 'VALIDATION',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_DELETED: 'USER_DELETED',
  NETWORK: 'NETWORK',
});
