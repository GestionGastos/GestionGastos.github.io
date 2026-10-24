export function Button({ as: Component = 'button', className = '', variant = 'primary', children, ...props }) {
  const busy = props['aria-busy'] === true || props['aria-busy'] === 'true';

  return (
    <Component className={`button button--${variant} ${busy ? 'button--busy' : ''} ${className}`.trim()} {...props}>
      {busy ? <span className="button__spinner" aria-hidden="true" /> : null}
      <span className="button__label">{children}</span>
    </Component>
  );
}
