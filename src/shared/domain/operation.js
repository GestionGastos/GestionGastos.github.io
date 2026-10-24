export const OperationStatus = Object.freeze({
  idle: 'idle',
  editing: 'editing',
  validating: 'validating',
  loading: 'loading',
  success: 'success',
  error: 'error',
});

export function createOperationId(action) {
  return `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createOperationResult({
  action,
  status,
  message = '',
  data = null,
  error = null,
  description = '',
}) {
  return {
    action,
    status,
    operationId: createOperationId(action),
    message,
    description,
    data,
    error,
  };
}

export function isBusyStatus(status) {
  return status === OperationStatus.loading || status === OperationStatus.validating;
}
