import { cloneElement, isValidElement } from 'react';

export function Field({ id, label, error, hint, required = false, children, describedBy }) {
  const descriptionIds = [
    error ? `${id}-error` : null,
    hint ? `${id}-hint` : null,
    describedBy,
  ].filter(Boolean);
  const ariaDescribedBy = descriptionIds.length ? descriptionIds.join(' ') : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': Boolean(error) || undefined,
        'aria-describedby': ariaDescribedBy,
        'aria-required': required || undefined,
      })
    : children;

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {control}
      {hint ? <p id={`${id}-hint`} className="field-help">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}
