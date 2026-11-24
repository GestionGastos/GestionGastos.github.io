import { useState } from 'react';
import { Modal } from '../../../shared/presentation/Modal.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { formatCurrency } from '../../../shared/i18n/currency.js';

export function GoalContributionModal({ goal, onClose, onSave, busy }) {
  const { t } = useI18n();
  const [amount, setAmount] = useState('');
  const value = Number(amount);
  return <Modal><div className="modal-heading"><div><p className="eyebrow">{t('goal.contribution')}</p><h2>{goal.name}</h2></div><button type="button" className="icon-button icon-button--neutral" onClick={onClose} aria-label={t('budget.cancel')}>×</button></div><p>{t('goal.currentAmount')}: {formatCurrency(goal.current ?? 0)}</p><form className="form-stack" onSubmit={(event) => { event.preventDefault(); if (value > 0) onSave(value); }}><label>{t('goal.amountToAdd')}<input type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} /></label><div className="modal-actions"><button type="button" className="button button--secondary form-cancel-button" onClick={onClose}>{t('budget.cancel')}</button><button type="submit" className="button button--primary" disabled={busy || value <= 0}>{busy ? t('budget.saving') : t('goal.contribute')}</button></div></form></Modal>;
}
