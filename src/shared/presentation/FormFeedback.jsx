export function FormFeedback({ id, status = 'idle', message }) {
  if (!message) {
    return null;
  }

  const isError = status === 'error';

  return (
    <p
      id={id}
      className={`form-feedback form-feedback--${status}`}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      {message}
    </p>
  );
}
