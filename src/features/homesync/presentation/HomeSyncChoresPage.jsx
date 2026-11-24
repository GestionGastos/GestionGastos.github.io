import { useEffect, useMemo, useState } from 'react';
import { Check, CirclePlus, ListFilter, Plus, Users, X } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { initialChores, summarizeChores } from '../domain/homeSyncData.js';
import { useAuth } from '../../auth/presentation/useAuth.js';
import { createServiceItem, createTaskPerson, listServiceItems, listTaskPeople, updateServiceItem } from '../../services/infrastructure/serviceRepository.js';

const columns = ['pending', 'progress', 'done'];

export function HomeSyncChoresPage() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [chores, setChores] = useState(initialChores);
  const [people, setPeople] = useState([]);
  const [filter, setFilter] = useState('all');
  const [assignee, setAssignee] = useState('all');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const stats = useMemo(() => summarizeChores(chores), [chores]);

  useEffect(() => {
    Promise.all([listServiceItems('taskflow', token), listTaskPeople(token)]).then(([records, availablePeople]) => {
      setPeople(availablePeople);
      const monday = new Date(); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0);
      setChores(records.filter((task) => (task.type === 'weekly' || task.assigneeType === 'household') && (!task.weekStart || new Date(task.weekStart) >= monday)).map((task) => ({ id: task._id, title: task.title, description: task.description, priority: ({ high: 'Alta', medium: 'Media', low: 'Baja' })[task.priority] ?? 'Media', room: task.type ?? 'General', assignee: task.assignee ?? t('homesync.chores.household'), assigneeType: task.assigneeType, assigneePerson: task.assigneePerson, due: task.deadline ? new Date(task.deadline).toLocaleDateString() : '—', deadline: task.deadline, weekStart: task.weekStart, weekEnd: task.weekEnd, status: task.status === 'in_progress' ? 'progress' : task.status === 'done' ? 'done' : 'pending' })));
    }).catch(() => setNotice(t('homesync.chores.loadError')));
  }, [token, t]);

  const addChore = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6); weekEnd.setHours(23, 59, 59, 999);
    const due = data.get('deadline');
    const assigneeName = String(data.get('assignee') || '').trim();
    let person = people.find((entry) => entry.name.toLowerCase() === assigneeName.toLowerCase());
    try {
      if (assigneeName && !person) { const savedPerson = await createTaskPerson(token, { name: assigneeName }); person = savedPerson?.person; if (person) setPeople((current) => [...current, person]); }
    } catch { setNotice(t('homesync.chores.personSaveError')); return; }
    const payload = { title: data.get('title'), description: data.get('description'), type: 'weekly', assigneeType: person ? 'person' : 'household', assignee: assigneeName || undefined, assigneePerson: person?._id, deadline: due ? new Date(`${due}T12:00:00`).toISOString() : undefined, weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString(), priority: String(data.get('priority')).toLowerCase(), status: 'pending' };
    let created;
    try { created = (await createServiceItem('taskflow', token, payload))?.task; if (!created?._id) throw new Error('Missing task'); }
    catch { setNotice(t('homesync.chores.saveError')); return; }
    setChores((current) => [{ id: created._id, title: payload.title, description: payload.description, priority: data.get('priority'), room: 'General', assignee: assigneeName || t('homesync.chores.household'), assigneeType: payload.assigneeType, assigneePerson: payload.assigneePerson, due: due || '—', deadline: payload.deadline, weekStart: payload.weekStart, weekEnd: payload.weekEnd, status: 'pending' }, ...current]);
    form.reset();
    setShowForm(false);
    setNotice(t('homesync.chores.created'));
  };

  const updateStatus = async (chore, next) => {
    if (!String(chore.id).startsWith('chore-')) {
      const backendStatus = next === 'progress' ? 'in_progress' : next === 'done' ? 'done' : 'pending';
      try { await updateServiceItem('taskflow', token, chore.id, { title: chore.title, type: 'weekly', assigneeType: chore.assigneeType ?? 'household', assignee: chore.assignee, assigneePerson: chore.assigneePerson, description: chore.description, deadline: chore.deadline, weekStart: chore.weekStart, weekEnd: chore.weekEnd, priority: chore.priority.toLowerCase(), status: backendStatus }); } catch { setNotice(t('homesync.chores.saveError')); return; }
    }
    setChores((current) => current.map((item) => item.id === chore.id ? { ...item, status: next } : item));
    setNotice(t(`homesync.chores.moved.${next}`));
  };
  const moveToNext = (chore) => updateStatus(chore, chore.status === 'pending' ? 'progress' : 'done');

  const visible = chores.filter((chore) => (filter === 'all' || chore.room === filter) && (assignee === 'all' || chore.assignee === assignee));
  const urgent = chores.filter((chore) => chore.status === 'pending').sort((a, b) => ({ Alta: 3, Media: 2, Baja: 1 }[b.priority] - ({ Alta: 3, Media: 2, Baja: 1 }[a.priority])))[0];
  const counts = stats;

  return (
    <PublicLayout>
      <main className="suite-page chores-page">
        <header className="suite-module-header">
          <div><p className="suite-eyebrow"><span />{t('homesync.chores.syncActive')} · {t('homesync.chores.cycle')}</p><h1>{t('homesync.chores.title')}</h1><p>{t('homesync.chores.subtitle')}</p></div>
          <div className="suite-header-actions"><label className="suite-button suite-button--secondary"><Users size={16} /><span className="sr-only">{t('homesync.chores.filterAssignee')}</span><select aria-label={t('homesync.chores.filterAssignee')} value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="all">{t('homesync.chores.allPeople')}</option>{[...new Set(chores.map((chore) => chore.assignee))].map((person) => <option key={person}>{person}</option>)}</select></label><button type="button" className="suite-button suite-button--primary" onClick={() => setShowForm((open) => !open)}><CirclePlus size={18} />{t('homesync.chores.newChore')}</button></div>
        </header>

        {notice ? <p className="suite-notice" role="status">{notice}</p> : null}
        {showForm ? <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}><section className="modal-sheet service-create-modal" role="dialog" aria-modal="true" aria-labelledby="chore-create-title"><header className="modal-heading"><h2 id="chore-create-title">{t('homesync.chores.newChore')}</h2><button type="button" aria-label={t('common.cancel')} onClick={() => setShowForm(false)}><X size={18} /></button></header><form className="form-stack chore-create-form" onSubmit={addChore}><label>{t('homesync.chores.taskTitle')}<input name="title" required maxLength="100" autoFocus /></label><label>{t('homesync.chores.description')}<textarea name="description" rows="2" /></label><div className="suite-form-row"><label>{t('homesync.chores.deadline')}<input name="deadline" type="date" defaultValue={new Date().toISOString().slice(0,10)} /></label><label>{t('homesync.chores.priority')}<select name="priority"><option>Media</option><option>Alta</option><option>Baja</option></select></label><label>{t('homesync.chores.responsible')}<input name="assignee" list="chores-people" /><datalist id="chores-people">{[...new Set(chores.map((chore) => chore.assignee))].map((person) => <option key={person}>{person}</option>)}</datalist></label></div><div className="modal-actions"><button type="button" className="suite-button suite-button--secondary" onClick={() => setShowForm(false)}>{t('common.cancel')}</button><button type="submit" className="suite-button suite-button--primary"><Plus size={16} />{t('homesync.chores.addTask')}</button></div></form></section></div> : null}

        <nav className="suite-list-tabs chore-filters" aria-label={t('homesync.chores.categories')}>
          {['all', ...new Set(chores.map((chore) => chore.room))].map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}><ListFilter size={16} />{item === 'all' ? t('homesync.chores.filter.all') : item}{item === 'all' ? <small>{counts.total}</small> : null}</button>)}
        </nav>

        <section className="suite-stats-grid chores-stats">
          <Stat label={t('homesync.chores.weeklyLoad')} value={counts.total} tone="blue" />
          <Stat label={t('homesync.chores.pending')} value={counts.pending} tone="orange" />
          <Stat label={t('homesync.chores.inProgress')} value={counts.progress} tone="slate" />
          <Stat label={t('homesync.chores.completedWeek')} value={counts.done} tone="green" />
        </section>

        {urgent ? <section className="suite-notice" role="status">{t('homesync.chores.priorityBanner', { title: urgent.title })}</section> : null}

        <section className="chore-board" aria-label={t('homesync.chores.board')}>
          {columns.map((status) => {
            const tasks = visible.filter((chore) => chore.status === status);
            return <div className={`chore-column chore-column--${status}`} key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const chore = chores.find((item) => String(item.id) === event.dataTransfer.getData('text/plain')); if (chore && chore.status !== status) updateStatus(chore, status); }}><header><h2><i />{t(`homesync.chores.status.${status}`)}</h2><span>{tasks.length}</span></header><div className="chore-column__items">{tasks.map((chore) => <article className="chore-card" key={chore.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(chore.id))}><div className="chore-card__chips"><span className={`chore-priority chore-priority--${chore.priority.toLowerCase()}`}>{t(`homesync.chores.priorityValues.${chore.priority}`)}</span><span className="suite-chip">{chore.room}</span></div><h3>{chore.title}</h3>{chore.description ? <p>{chore.description}</p> : null}<footer><span className="chore-avatar">{chore.assignee.split(' ').map((part) => part[0]).join('')}</span><span>{chore.assignee}</span><time>{chore.due}</time>{status !== 'done' ? <button type="button" aria-label={`${t('homesync.chores.moveForward')} ${chore.title}`} onClick={() => moveToNext(chore)}><Check size={15} /></button> : <Check size={16} className="chore-done-icon" />}</footer></article>)}</div><button className="chore-add-column" type="button" onClick={() => setShowForm(true)}><Plus size={16} />{t('homesync.chores.addTo', { status: t(`homesync.chores.status.${status}`) })}</button></div>;
          })}
        </section>

      </main>
    </PublicLayout>
  );
}

function Stat({ label, value, detail, tone }) {
  const { t } = useI18n();
  return <article className={`suite-stat-card suite-stat-card--${tone}`}><small>{label}</small><strong>{value} <span>{detail}</span></strong><span>{t('homesync.chores.statsFootnote')}</span></article>;
}
