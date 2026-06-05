export function Button({ as: Component = 'button', className = '', variant = 'primary', ...props }) {
  return <Component className={`button button--${variant} ${className}`.trim()} {...props} />;
}
