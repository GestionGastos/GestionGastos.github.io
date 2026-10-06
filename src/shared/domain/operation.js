export const OperationStatus = Object.freeze({
  idle: 'idle',
  editing: 'editing',
  validating: 'validating',
  loading: 'loading',
  success: 'success',
  error: 'error',
});

export function createOperationResult({ action, status, message = '', data = null, error = null }) {
  return {
    action,
    status,
    operationId: `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    data,
    error,
  };
}
