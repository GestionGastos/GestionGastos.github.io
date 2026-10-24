export function ErrorSummary({ id, title, items = [] }) {
  const entries = items.filter((item) => item?.message);

  if (!entries.length) {
    return null;
  }

  return (
    <div id={id} className="error-summary" role="alert" aria-live="assertive">
      <p className="error-summary__title">{title}</p>
      <ul>
        {entries.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
