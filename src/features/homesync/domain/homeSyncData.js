export const shoppingLists = [];

export const shoppingItems = [];

export const initialChores = [];

export const initialTaxRates = [
  { id: 'standard', name: 'IVA Estándar', description: 'Tasa general de consumo y compras básicas', rate: 19, type: 'Porcentual', scope: 'Canasta General & Hogar', active: true },
  { id: 'reduced', name: 'IVA Reducido / Alimentos Procesados', description: 'Abarrotes específicos, café, pastas y granos procesados', rate: 5, type: 'Porcentual', scope: 'Alimentos seleccionados', active: true },
  { id: 'restaurant', name: 'Impuesto al Consumo (Restaurantes/Salidas)', description: 'Aplicable a cuentas de comensales y domicilios', rate: 8, type: 'Porcentual', scope: 'Módulo Salidas & Ocio', active: true },
  { id: 'healthy', name: 'Impuesto Saludable / Bebidas Azucaradas', description: 'Gaseosas, repostería con alto contenido de sodio/azúcar', rate: 10, type: 'Porcentual', scope: 'Snacks & Bebidas', active: true },
];

export function summarizeShopping(items) {
  return items.reduce((summary, item) => {
    const net = item.quantity * item.price;
    summary.net += net;
    summary.tax += net * item.tax / 100;
    summary.items += 1;
    if (item.checked) summary.selected += 1;
    return summary;
  }, { net: 0, tax: 0, items: 0, selected: 0 });
}

export function summarizeChores(chores) {
  const summary = { total: chores.length, pending: 0, progress: 0, done: 0 };
  chores.forEach(({ status }) => { summary[status] += 1; });
  return summary;
}
