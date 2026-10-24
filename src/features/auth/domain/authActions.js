import { DomainAction, DomainErrorType } from '../../../shared/domain/actions.js';
import { createOperationResult, OperationStatus } from '../../../shared/domain/operation.js';

const REGISTER_FIELDS = ['name', 'lastname', 'username', 'email', 'password', 'confirmPassword'];
const LOGIN_FIELDS = ['email', 'password'];

export function validateRegisterForm(form, messages) {
  const errors = {};

  REGISTER_FIELDS.forEach((field) => {
    if (!String(form[field] ?? '').trim()) {
      errors[field] = messages.fieldRequired;
    }
  });

  if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
    errors.confirmPassword = messages.passwordMismatch;
  }

  return errors;
}

export function validateLoginForm(form, messages) {
  const errors = {};

  LOGIN_FIELDS.forEach((field) => {
    if (!String(form[field] ?? '').trim()) {
      errors[field] = messages.fieldRequired;
    }
  });

  return errors;
}

export function firstInvalidField(errors, fieldOrder) {
  return fieldOrder.find((field) => errors[field]);
}

export async function executeRegisterUser(form, signUp, messages) {
  const errors = validateRegisterForm(form, messages);

  if (Object.keys(errors).length) {
    return createOperationResult({
      action: DomainAction.register_user,
      status: OperationStatus.error,
      message: messages.required,
      description: 'register_user rejected because the form is incomplete or passwords do not match',
      error: { type: DomainErrorType.VALIDATION, fields: errors },
    });
  }

  try {
    const { confirmPassword: _confirmPassword, ...payload } = form;
    const data = await signUp(payload);
    return createOperationResult({
      action: DomainAction.register_user,
      status: OperationStatus.success,
      message: messages.registerSuccess,
      description: 'register_user created the account and the user can sign in',
      data,
    });
  } catch (caught) {
    const type = caught?.status === 409 ? DomainErrorType.EMAIL_EXISTS : DomainErrorType.NETWORK;
    return createOperationResult({
      action: DomainAction.register_user,
      status: OperationStatus.error,
      message: type === DomainErrorType.EMAIL_EXISTS ? messages.emailExists : messages.networkError,
      description: 'register_user failed before creating the account',
      error: { type, status: caught?.status ?? 0 },
    });
  }
}

export async function executeLoginUser(form, signIn, messages) {
  const errors = validateLoginForm(form, messages);

  if (Object.keys(errors).length) {
    return createOperationResult({
      action: DomainAction.login_user,
      status: OperationStatus.error,
      message: messages.required,
      description: 'login_user rejected because email or password is empty',
      error: { type: DomainErrorType.VALIDATION, fields: errors },
    });
  }

  try {
    const result = await signIn(form);

    if (result?.error) {
      const deleted = result.error === 'User Deleted';
      return createOperationResult({
        action: DomainAction.login_user,
        status: OperationStatus.error,
        message: deleted ? messages.deletedUser : messages.invalidLogin,
        description: 'login_user rejected the credentials',
        error: { type: deleted ? DomainErrorType.USER_DELETED : DomainErrorType.INVALID_CREDENTIALS },
      });
    }

    return createOperationResult({
      action: DomainAction.login_user,
      status: OperationStatus.success,
      message: messages.loginSuccess,
      description: 'login_user restored an authenticated session',
      data: result,
    });
  } catch (caught) {
    const network = !caught?.status;
    return createOperationResult({
      action: DomainAction.login_user,
      status: OperationStatus.error,
      message: network ? messages.networkError : messages.invalidLogin,
      description: 'login_user failed before creating a session',
      error: {
        type: network ? DomainErrorType.NETWORK : DomainErrorType.INVALID_CREDENTIALS,
        status: caught?.status ?? 0,
      },
    });
  }
}
