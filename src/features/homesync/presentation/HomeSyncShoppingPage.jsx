import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, Check, ChevronDown, CirclePlus, Plus, Receipt, ShoppingCart, Trash2, Pencil, X, CreditCard, RefreshCw } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { shoppingItems, shoppingLists, summarizeShopping } from '../domain/homeSyncData.js';
import { useAuth } from '../../auth/presentation/useAuth.js';
import { createShoppingEstablishment, createShoppingItem, createShoppingList, deleteShoppingItem, deleteShoppingList, getShoppingList, listShoppingCategories, listShoppingEstablishments, listShoppingLists, listExpenseTypes, markShoppingListPaid, synchronizeShoppingList, updateShoppingItem } from '../../services/infrastructure/serviceRepository.js';
import { formatCurrency } from '../../../shared/i18n/currency.js';


export function HomeSyncShoppingPage() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [items, setItems] = useState(shoppingItems);
  const [lists, setLists] = useState(shoppingLists);
  const [categories, setCategories] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [listState, setListState] = useState({ status: 'pending', expenseType: '', invoice: null, establishmentNit: '' });
  const [paidModal, setPaidModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [activeList, setActiveList] = useState('market');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('all');
  const [isListFormOpen, setIsListFormOpen] = useState(false);
  const summary = useMemo(() => summarizeShopping(items), [items]);
  const visibleItems = items.filter((item) => filter === 'all' || (filter === 'selected' ? item.checked : !item.checked));
  const toggleItem = async (item) => {
    const checked = !item.checked;
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, checked } : entry));
    if (isMongoId(activeList) && isMongoId(item.id) && isMongoId(item.categoryId)) {
      try {
        await updateShoppingItem(token, activeList, item.id, { name: item.name, category: item.categoryId, quantity: item.quantity, unitPrice: item.price, taxRate: item.tax, status: checked ? 'purchased' : 'pending' });
      } catch { setNotice(t('homesync.shopping.localDemo')); }
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([listShoppingLists(token), listShoppingCategories(token), listShoppingEstablishments(token), listExpenseTypes(token)]).then(([records, availableCategories, availableEstablishments, availableExpenseTypes]) => {
      if (!active) return;
      setCategories(availableCategories);
      setEstablishments(availableEstablishments);
      setExpenseTypes(availableExpenseTypes);
      const mapped = records.map((list) => ({ id: list._id, name: list.name, count: list.items?.length ?? 0, category: 'Home', establishment: list.establishment?._id ?? list.establishment, establishmentNit: list.establishmentNit, status: list.status, expenseType: list.expenseType?._id ?? list.expenseType, invoice: list.invoice }));
      setLists(mapped);
      setActiveList(mapped[0]?.id ?? '');
      if (!mapped.length) setItems([]);
    }).catch(() => {});
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (!isMongoId(activeList)) return undefined;
    let active = true;
    getShoppingList(token, activeList).then((list) => {
      if (active && list) {
        setListState({ status: list.status ?? 'pending', expenseType: list.expenseType?._id ?? list.expenseType ?? '', invoice: list.invoice, establishmentNit: list.establishmentNit ?? '' });
        setItems((list.items ?? []).map((item) => {
          const category = item.category && typeof item.category === 'object' ? item.category : null;
          return { id: item._id, name: item.name, detail: '', category: category?.name ?? t('homesync.shopping.other'), categoryId: category?._id ?? item.category, quantity: item.quantity, unit: 'und', price: item.unitPrice, tax: item.taxRate, checked: item.status === 'purchased' };
        }));
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [activeList, token, t]);

  const createList = () => setIsListFormOpen(true);

  const submitList = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    if (!name) return;
    setBusy(true);
    try {
      const storeName = String(data.get('storeName') || '').trim();
      const storeNit = String(data.get('storeNit') || '').trim();
      let establishment = storeName ? establishments.find((place) => place.name?.trim().toLowerCase() === storeName.toLowerCase() && (!storeNit || place.nit === storeNit)) : null;
      if (storeName && !establishment) {
        const establishmentResponse = await createShoppingEstablishment(token, { name: storeName, nit: storeNit || undefined });
        establishment = establishmentResponse?.establishment;
      }
      const expenseType = String(data.get('expenseType') || '');
      const response = await createShoppingList(token, { name, expenseType, establishment: establishment?._id, establishmentNit: storeNit || undefined });
      if (!response?.list?._id) throw new Error('List was not saved');
      const list = response.list;
      if (establishment) setEstablishments((current) => [...current, establishment]);
    const id = list?._id ?? `list-${Date.now()}`;
    const nextList = { id, name: list?.name ?? name, count: 0, category: 'Home', establishment: establishment?._id, establishmentNit: storeNit, status: 'pending', expenseType };
    setLists((current) => [...current, nextList]);
    setActiveList(id);
    if (list?._id) setItems([]);
      setNotice(t('homesync.shopping.listCreated'));
      setIsListFormOpen(false);
    } catch { setNotice(t('homesync.shopping.listSaveError')); }
    finally { setBusy(false); }
  };

  const removeList = async (list) => {
    if (!isMongoId(list.id)) return;
    setBusy(true);
    try { await deleteShoppingList(token, list.id); const next = lists.filter((entry) => entry.id !== list.id); setLists(next); setActiveList(next[0]?.id ?? ''); setItems([]); setNotice(t('homesync.shopping.listDeleted')); }
    catch { setNotice(t('homesync.shopping.listSaveError')); } finally { setBusy(false); }
  };

  const saveEditedItem = async (event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true);
    const categoryId = String(data.get('category'));
    const payload = { name: String(data.get('name')).trim(), category: categoryId, quantity: Number(data.get('quantity')), unitPrice: Number(data.get('unitPrice')), taxRate: Number(data.get('taxRate')) };
    try { await updateShoppingItem(token, activeList, editingItem.id, payload); setItems((current) => current.map((item) => item.id === editingItem.id ? { ...item, name: payload.name, categoryId, category: categories.find((entry) => entry._id === categoryId)?.name ?? item.category, quantity: payload.quantity, price: payload.unitPrice, tax: payload.taxRate } : item)); setEditingItem(null); }
    catch { setNotice(t('homesync.shopping.itemSaveError')); } finally { setBusy(false); }
  };

  const removeItem = async (item) => { if (!isMongoId(item.id)) return; try { await deleteShoppingItem(token, activeList, item.id); setItems((current) => current.filter((entry) => entry.id !== item.id)); } catch { setNotice(t('homesync.shopping.itemSaveError')); } };

  const submitPaid = async (event) => {
    event.preventDefault(); const nit = String(new FormData(event.currentTarget).get('nit') || '').trim();
    try { const response = await markShoppingListPaid(token, activeList, nit); setListState((current) => ({ ...current, status: response?.list?.status ?? 'paid', establishmentNit: nit })); setLists((current) => current.map((list) => list.id === activeList ? { ...list, status: 'paid', establishmentNit: nit } : list)); setPaidModal(false); setNotice(t('homesync.shopping.markedPaid')); }
    catch { setNotice(t('homesync.shopping.listSaveError')); }
  };
  const synchronize = async () => { try { const response = await synchronizeShoppingList(token, activeList); const invoice = response?.list?.invoice; setListState((current) => ({ ...current, status: 'synced', invoice })); setLists((current) => current.map((list) => list.id === activeList ? { ...list, status: 'synced', invoice } : list)); setNotice(t('homesync.shopping.synced')); }
    catch { setNotice(t('homesync.shopping.syncError')); }
  };
  const isSynced = listState.status === 'synced';

  return (
    <PublicLayout>
      <main className="suite-page homesync-page">
        <header className="suite-module-header">
          <div>
            <p className="suite-eyebrow"><span />{t('homesync.shopping.savedToAccount')}</p>
            <h1>{t('homesync.shopping.title')}</h1>
            <p>{t('homesync.shopping.subtitle')}</p>
          </div>
          <div className="suite-header-actions">
            {listState.status === 'pending' && activeList && isMongoId(activeList) ? <button className="suite-button suite-button--secondary" type="button" onClick={() => setPaidModal(true)} disabled={busy}><CreditCard size={17} />{t('homesync.shopping.markPaid')}</button> : null}
            {listState.status === 'paid' ? <button className="suite-button suite-button--secondary" type="button" onClick={synchronize}><RefreshCw size={17} />{t('homesync.shopping.syncInvoice')}</button> : null}
            {activeList && isMongoId(activeList) && !isSynced ? <button className="suite-button suite-button--secondary" type="button" onClick={() => { const list = lists.find((entry) => entry.id === activeList); if (list) removeList(list); }} disabled={busy}><Trash2 size={17} />{t('homesync.shopping.deleteList')}</button> : null}
            <button className="suite-button suite-button--primary" type="button" onClick={createList}><Plus size={18} />{t('homesync.shopping.createList')}</button>
          </div>
        </header>

        {notice ? <p className="suite-notice" role="status">{notice}</p> : null}
        {activeList ? <p className="suite-notice" role="status">{t(`homesync.shopping.status${listState.status === 'synced' ? 'Synced' : listState.status === 'paid' ? 'Paid' : 'Pending'}`)}{listState.invoice ? ` · ${t('homesync.shopping.invoice')}: ${String(listState.invoice).slice(-8)}` : ''}</p> : null}

        <div className="suite-list-tabs" role="tablist" aria-label={t('homesync.shopping.lists')}>
          {lists.map((list) => <button key={list.id} type="button" role="tab" aria-selected={activeList === list.id} onClick={() => setActiveList(list.id)}><ShoppingCart size={17} /><span>{list.name}</span><small>{list.count} {t('homesync.shopping.items')}</small></button>)}
          <button type="button" onClick={createList}><CirclePlus size={17} />{t('homesync.shopping.newList')}</button>
        </div>

        <section className="suite-stats-grid" aria-label={t('homesync.shopping.estimate')}>
          <article className="suite-stat-card"><small>{t('homesync.shopping.subtotal')}</small><strong>{formatCurrency(summary.net)}</strong><span>{summary.selected} {t('homesync.shopping.countedItems')}</span></article>
          <article className="suite-stat-card suite-stat-card--orange"><small>{t('homesync.shopping.tax')}</small><strong>{formatCurrency(summary.tax)}</strong><span><Receipt size={14} /> {t('homesync.shopping.taxRule')}</span></article>
          <article className="suite-stat-card suite-stat-card--highlight"><small>{t('homesync.shopping.total')}</small><strong>{formatCurrency(summary.net + summary.tax)}</strong><span>{t('homesync.shopping.projected')}</span></article>
        </section>

        <section className="suite-panel shopping-detail">
          <div className="suite-panel-heading"><div><h2>{t('homesync.shopping.detail')}</h2><p>{t('homesync.shopping.showing', { count: visibleItems.length, total: summary.items })}</p></div><div className="suite-inline-filters"><label>{t('homesync.shopping.filter')}<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">{t('homesync.shopping.allItems')}</option><option value="selected">{t('homesync.shopping.inCart')}</option><option value="pending">{t('homesync.shopping.pending')}</option></select></label><button type="button" onClick={() => setFilter('all')}><ChevronDown size={15} />{t('homesync.shopping.sort')}</button></div></div>
          <div className="suite-table-scroll"><table className="suite-table"><thead><tr><th><span className="sr-only">{t('homesync.shopping.select')}</span></th><th>{t('homesync.shopping.item')}</th><th>{t('homesync.shopping.category')}</th><th>{t('homesync.shopping.quantity')}</th><th>{t('homesync.shopping.unitPrice')}</th><th>{t('homesync.shopping.tax')}</th><th>{t('homesync.shopping.lineTotal')}</th><th>{t('homesync.shopping.status')}</th><th>{t('common.actions')}</th></tr></thead><tbody>{visibleItems.map((item) => { const lineTotal = item.quantity * item.price * (1 + item.tax / 100); return <tr key={item.id}><td><input type="checkbox" checked={item.checked} disabled={isSynced} onChange={() => toggleItem(item)} aria-label={t('homesync.shopping.selectItem', { name: item.name })} /></td><td><strong>{item.name}</strong><small>{item.detail}</small></td><td><span className="suite-chip">{item.category}</span></td><td>{item.quantity} {item.unit}</td><td>{formatCurrency(item.price)}</td><td><span className={`suite-tax-chip${item.tax ? ' suite-tax-chip--taxed' : ''}`}>{item.tax ? `IVA ${item.tax}%` : t('homesync.shopping.exempt')}</span></td><td className="suite-amount">{formatCurrency(lineTotal)}</td><td><span className={`suite-state${item.checked ? ' suite-state--done' : ''}`}>{item.checked ? t('homesync.shopping.inCart') : t('homesync.shopping.pending')}</span></td><td><button type="button" className="suite-icon-button" aria-label={`${t('common.edit')} ${item.name}`} onClick={() => setEditingItem(item)} disabled={isSynced || !isMongoId(item.id)}><Pencil size={15} /></button><button type="button" className="suite-icon-button" aria-label={`${t('common.delete')} ${item.name}`} onClick={() => removeItem(item)} disabled={isSynced || !isMongoId(item.id)}><Trash2 size={15} /></button></td></tr>; })}</tbody></table></div>
          <form className="shopping-quick-add" onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const name = String(data.get('name') || '').trim(); if (!name || isSynced) return; const category = categories[0]; const payload = { name, category: category?._id, quantity: Number(data.get('quantity')) || 1, unitPrice: Number(data.get('price')) || 0, taxRate: Number(data.get('tax')) || 0, status: 'pending' }; let created; if (isMongoId(activeList) && isMongoId(payload.category)) { try { const response = await createShoppingItem(token, activeList, payload); created = response?.list?.items?.at(-1); } catch { setNotice(t('homesync.shopping.itemSaveError')); return; } } setItems((current) => [...current, { id: created?._id ?? `item-${Date.now()}`, name, detail: '', category: category?.name ?? t('homesync.shopping.other'), categoryId: category?._id, quantity: payload.quantity, unit: 'und', price: payload.unitPrice, tax: payload.taxRate, checked: false }]); form.reset(); }}>
            <strong><CirclePlus size={17} />{t('homesync.shopping.quickAdd')}</strong><label className="sr-only" htmlFor="shopping-item-name">{t('homesync.shopping.itemName')}</label><input id="shopping-item-name" name="name" placeholder={t('homesync.shopping.itemPlaceholder')} required disabled={isSynced} /><label className="sr-only" htmlFor="shopping-item-price">{t('homesync.shopping.unitPrice')}</label><input id="shopping-item-price" name="price" type="number" min="0" placeholder={t('homesync.shopping.pricePlaceholder')} disabled={isSynced} /><label className="sr-only" htmlFor="shopping-item-quantity">{t('homesync.shopping.quantity')}</label><input id="shopping-item-quantity" name="quantity" type="number" min="0.01" step="0.01" defaultValue="1" disabled={isSynced} /><button type="submit" className="suite-button suite-button--primary" disabled={isSynced || !isMongoId(activeList) || !categories.length}><Plus size={16} />{t('homesync.shopping.addItem')}</button>
          </form>
        </section>

        <footer className="suite-privacy-note"><ArrowDown size={15} />{t('homesync.shopping.backendLimits')}</footer>
        {isListFormOpen ? <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsListFormOpen(false); }}><section className="modal-sheet service-create-modal" role="dialog" aria-modal="true" aria-labelledby="shopping-list-dialog-title"><header className="modal-heading"><h2 id="shopping-list-dialog-title">{t('homesync.shopping.newList')}</h2><button type="button" aria-label={t('common.cancel')} onClick={() => setIsListFormOpen(false)}><X size={18} /></button></header><form className="form-stack" onSubmit={submitList}><label>{t('homesync.shopping.newList')}<input name="name" required autoFocus defaultValue={t('homesync.shopping.newListName')} /></label><label>{t('homesync.shopping.expenseType')}<select name="expenseType" required defaultValue=""><option value="" disabled>{t('homesync.shopping.chooseExpenseType')}</option>{expenseTypes.map((type) => <option key={type._id} value={type._id}>{type.name}</option>)}</select></label><label>{t('homesync.shopping.storeName')}<input name="storeName" list="shopping-establishments" /> <datalist id="shopping-establishments">{establishments.map((place) => <option key={place._id} value={place.name} />)}</datalist></label><label>{t('homesync.shopping.storeNit')}<input name="storeNit" /></label><div className="modal-actions"><button className="suite-button suite-button--secondary" type="button" onClick={() => setIsListFormOpen(false)}>{t('common.cancel')}</button><button className="suite-button suite-button--primary" type="submit" disabled={busy || !expenseTypes.length}>{t('services.form.save')}</button></div></form></section></div> : null}
        {paidModal ? <div className="modal-backdrop" role="presentation"><section className="modal-sheet service-create-modal" role="dialog" aria-modal="true" aria-labelledby="shopping-paid-title"><header className="modal-heading"><h2 id="shopping-paid-title">{t('homesync.shopping.markPaid')}</h2><button type="button" aria-label={t('common.cancel')} onClick={() => setPaidModal(false)}><X size={18} /></button></header><form className="form-stack" onSubmit={submitPaid}><label>{t('homesync.shopping.storeNit')}<input name="nit" required defaultValue={listState.establishmentNit} /></label><div className="modal-actions"><button className="suite-button suite-button--secondary" type="button" onClick={() => setPaidModal(false)}>{t('common.cancel')}</button><button className="suite-button suite-button--primary" type="submit">{t('homesync.shopping.markPaid')}</button></div></form></section></div> : null}
        {editingItem ? <div className="modal-backdrop" role="presentation"><section className="modal-sheet service-create-modal" role="dialog" aria-modal="true" aria-labelledby="shopping-edit-title"><header className="modal-heading"><h2 id="shopping-edit-title">{t('homesync.shopping.editItem')}</h2><button type="button" aria-label={t('common.cancel')} onClick={() => setEditingItem(null)}><X size={18} /></button></header><form className="form-stack" onSubmit={saveEditedItem}><label>{t('homesync.shopping.itemName')}<input name="name" required defaultValue={editingItem.name} /></label><label>{t('homesync.shopping.category')}<select name="category" required defaultValue={editingItem.categoryId}>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label><div className="suite-form-row"><label>{t('homesync.shopping.quantity')}<input name="quantity" type="number" min="0.01" step="0.01" required defaultValue={editingItem.quantity} /></label><label>{t('homesync.shopping.unitPrice')}<input name="unitPrice" type="number" min="0" step="0.01" required defaultValue={editingItem.price} /></label><label>{t('homesync.shopping.tax')}<input name="taxRate" type="number" min="0" max="100" step="0.01" defaultValue={editingItem.tax} /></label></div><div className="modal-actions"><button type="button" className="suite-button suite-button--secondary" onClick={() => setEditingItem(null)}>{t('common.cancel')}</button><button type="submit" className="suite-button suite-button--primary" disabled={busy}>{t('common.saveChanges')}</button></div></form></section></div> : null}
      </main>
    </PublicLayout>
  );
}

function isMongoId(value) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}
