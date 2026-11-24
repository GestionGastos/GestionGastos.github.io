import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../shared/i18n/currency.js';

export const GoalCard = ({ name, date, target = 0, current = 0, percent = 0, onEdit, onDelete, onContribute, type }) => {
  const rawProgress = Math.max(0, Number(percent) || 0);
  const progress = Math.min(100, rawProgress);
  return (
    <article className="goal-card">
      <div className="goal-icon goal-icon--green" />
      <div className="goal-card__top"><div><h3>{name}</h3><p>Fecha objetivo: {date || '—'}</p></div><div className="goal-card__actions"><button type="button" className="icon-button icon-button--neutral" aria-label={`Editar ${name}`} onClick={onEdit}><Pencil size={16} /></button><button type="button" className="icon-button icon-button--neutral" aria-label={`Eliminar ${name}`} onClick={onDelete}><Trash2 size={17} /></button></div></div>
      <div className="goal-card__amount"><strong>{formatCurrency(Number(current) || 0)}</strong><span>de {formatCurrency(Number(target) || 0)}</span></div>
      <div className="progress progress--large"><span style={{ width: `${progress}%` }} /></div>
      <div className={`goal-card__footer${rawProgress > 100 ? ' goal-card__footer--over' : ''}`}><span>{rawProgress}% completado</span>{['saving','travel','emergency','investment'].includes(type) ? <button type="button" onClick={onContribute}>+ Añadir monto</button> : null}</div>
    </article>
  );
};
