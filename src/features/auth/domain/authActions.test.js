import { describe, expect, it, vi } from 'vitest';
import { DomainErrorType } from '../../../shared/domain/actions.js';
import { OperationStatus } from '../../../shared/domain/operation.js';
import { executeLoginUser, executeRegisterUser, validateRegisterForm } from './authActions.js';

const messages = {
  fieldRequired: 'required',
  passwordMismatch: 'mismatch',
  required: 'form required',
  registerSuccess: 'created',
  emailExists: 'exists',
  networkError: 'network',
  loginSuccess: 'logged',
  invalidLogin: 'invalid',
  deletedUser: 'deleted',
};

describe('authActions', () => {
  it('rejects mismatched passwords before calling the API', async () => {
    const signUp = vi.fn();
    const result = await executeRegisterUser({
      name: 'Ada', lastname: 'Lovelace', username: 'ada', email: 'ada@example.com', password: 'secret', confirmPassword: 'other',
    }, signUp, messages);

    expect(signUp).not.toHaveBeenCalled();
    expect(result.status).toBe(OperationStatus.error);
    expect(result.error.type).toBe(DomainErrorType.VALIDATION);
    expect(result.error.fields.confirmPassword).toBe('mismatch');
  });

  it('maps a 409 to EMAIL_EXISTS', async () => {
    const signUp = vi.fn().mockRejectedValue({ status: 409 });
    const result = await executeRegisterUser({
      name: 'Ada', lastname: 'Lovelace', username: 'ada', email: 'ada@example.com', password: 'secret', confirmPassword: 'secret',
    }, signUp, messages);

    expect(result.error.type).toBe(DomainErrorType.EMAIL_EXISTS);
    expect(result.message).toBe('exists');
  });

  it('maps a missing status to NETWORK', async () => {
    const signUp = vi.fn().mockRejectedValue(new Error('offline'));
    const result = await executeRegisterUser({
      name: 'Ada', lastname: 'Lovelace', username: 'ada', email: 'ada@example.com', password: 'secret', confirmPassword: 'secret',
    }, signUp, messages);

    expect(result.error.type).toBe(DomainErrorType.NETWORK);
  });

  it('returns a structured login success payload', async () => {
    const session = { user: { id: 'user-1' }, token: 't' };
    const result = await executeLoginUser({ email: 'ada@example.com', password: 'secret' }, async () => session, messages);
    expect(result.status).toBe(OperationStatus.success);
    expect(result.action).toBe('login_user');
    expect(result.data).toEqual(session);
    expect(result.operationId).toMatch(/^login_user-/);
  });

  it('requires every register field', () => {
    expect(Object.keys(validateRegisterForm({}, messages))).toHaveLength(6);
  });
});
