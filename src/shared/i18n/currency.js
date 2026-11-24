const CURRENCY_LOCALE = { COP: 'es-CO', USD: 'en-US', EUR: 'de-DE' };

/** Format monetary values using the signed-in user's persisted currency preference. */
export function formatCurrency(value, currency = localStorage.getItem('currency') ?? 'COP', language = localStorage.getItem('locale') ?? 'es') {
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : CURRENCY_LOCALE[currency] ?? 'es-CO', {
    style: 'currency', currency, maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(Number(value) || 0);
}

export function useCurrency() { return localStorage.getItem('currency') ?? 'COP'; }
