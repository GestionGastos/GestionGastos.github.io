import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, CheckCircle2, CirclePlus, Dumbbell, Pause, Play, RotateCcw, Timer, Upload, X } from 'lucide-react';
import { PublicLayout } from '../../../shared/presentation/PublicLayout.jsx';
import { useAuth } from '../../auth/presentation/useAuth.js';
import { useI18n } from '../../../shared/i18n/I18nProvider.jsx';
import { getServiceRecords, createServiceRecord } from '../infrastructure/serviceRepository.js';
import { authHeaders, httpClient } from '../../../shared/infrastructure/httpClient.js';
import { getUserPreferences, updateUserPreferences } from '../infrastructure/serviceRepository.js';

const ROUTINES = '/fitness/routines';
const EXERCISES = '/fitness/exercises';
const WEEKDAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export function FitPulsePage() {
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [routines, setRoutines] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [restSeconds, setRestSeconds] = useState(() => Math.max(0, Number(localStorage.getItem('fitpulse.restSeconds') ?? 60)));
  const lastSignal = useRef('');
  const reload = useCallback(async () => { setLoading(true); try { const year = new Date().getFullYear(); const params = new URLSearchParams({ from: new Date(year, 0, 1).toISOString(), to: new Date(year, 11, 31, 23, 59, 59).toISOString() }); const [nextRoutines, nextExercises, preferences, history] = await Promise.all([getServiceRecords(ROUTINES, token, 'routines'), getServiceRecords(EXERCISES, token, 'exercises'), getUserPreferences(token), httpClient(`/fitness/sessions?${params}`, { headers: authHeaders(token) })]); setRoutines(nextRoutines); setExerciseTypes(nextExercises); setSessionHistory(history?.sessions ?? []); const rest = preferences?.preferences?.fitnessRestSeconds ?? preferences?.fitnessRestSeconds; if (Number.isInteger(rest)) { setRestSeconds(rest); localStorage.setItem('fitpulse.restSeconds', String(rest)); } setError(''); } catch { setError(t('fitpulse.loadError')); } finally { setLoading(false); } }, [token, t]);
  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!session?.running || seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [session?.running, seconds]);

  useEffect(() => {
    if (!session || seconds !== 0 || !session.running) return;
    if (session.phase === 'exercise') {
      if (session.index < session.routine.exercises.length - 1 && restSeconds > 0) { setSession((current) => ({ ...current, phase: 'rest' })); setSeconds(restSeconds); }
      else if (session.index < session.routine.exercises.length - 1) { setSession((current) => ({ ...current, phase: 'exercise', index: current.index + 1 })); setSeconds(Number(session.routine.exercises[session.index + 1]?.durationSeconds) || 45); }
      else finishSession(session);
    } else { setSession((current) => ({ ...current, phase: 'exercise', index: current.index + 1 })); setSeconds(Number(session.routine.exercises[session.index + 1]?.durationSeconds) || 45); }
  }, [seconds, session, restSeconds]);

  useEffect(() => {
    if (!session) return;
    const key = `${session.phase}:${session.index}`;
    if (lastSignal.current === key) return;
    lastSignal.current = key;
    signalTone();
  }, [session?.phase, session?.index]);

  const finished = sessionHistory.filter((item) => item.status === 'completed');
  const weeklyStreak = useMemo(() => {
    const completedDays = new Set(finished.map((session) => new Date(session.scheduledDate).toDateString()));
    let streak = 0;
    for (let offset = 0; offset < 7; offset += 1) { const date = new Date(); date.setDate(date.getDate() - offset); if (completedDays.has(date.toDateString())) streak += 1; else if (offset) break; }
    return streak;
  }, [finished]);

  const finishSession = async (runningSession) => {
    setSession(null); setSeconds(0);
    try { await httpClient(`/fitness/sessions/${runningSession.backendSession._id}/complete`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify({}) }); setNotice(t('fitpulse.completed')); await reload(); }
    catch { setError(t('fitpulse.saveError')); }
  };

  const startSession = async (routine) => {
    setError('');
    try {
      const created = await httpClient('/fitness/sessions', { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ routine: routine._id, scheduledDate: new Date().toISOString() }) });
      const started = await httpClient(`/fitness/sessions/${created.session._id}`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ status: 'in_progress', currentExerciseIndex: 0, currentPhase: 'exercise', secondsRemaining: Number(routine.exercises[0]?.durationSeconds) || 45 }) });
      setSession({ routine, backendSession: started.session, index: 0, phase: 'exercise', running: true }); setSeconds(Number(routine.exercises[0]?.durationSeconds) || 45);
    } catch { setError(t('fitpulse.saveError')); }
  };

  const importWorkbook = async (event) => {
    const file = event.currentTarget.files?.[0]; if (!file) return;
    setSaving(true); setError('');
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
      const groups = new Map();
      for (const row of rows) {
        const key = `${row.routine_name}|${String(row.date).slice(0,10)}`;
        const exercise = exerciseTypes.find((item) => item.name.toLowerCase() === String(row.exercise_name).trim().toLowerCase());
        if (!exercise) throw new Error(`EXERCISE:${row.exercise_name}`);
        const record = groups.get(key) ?? { name: String(row.routine_name).trim(), date: new Date(row.date).toISOString(), monthlyGoal: Number(row.monthly_goal) || 12, active: true, exercises: [] };
        record.exercises.push({ exerciseType: exercise._id, sets: Number(row.sets) || 3, repetitions: Number(row.repetitions) || 10, durationSeconds: Number(row.duration_seconds) || undefined, order: record.exercises.length, notes: String(row.notes || '') }); groups.set(key, record);
      }
      const created = await Promise.all([...groups.values()].map((routine) => createServiceRecord(ROUTINES, token, routine)));
      setRoutines((current) => [...created.map((item) => item.routine).filter(Boolean), ...current]); setNotice(t('fitpulse.imported'));
    } catch (caught) { setError(caught.message.startsWith('EXERCISE:') ? t('fitpulse.exerciseMissing', { name: caught.message.slice(9) }) : t('fitpulse.importError')); }
    finally { setSaving(false); event.currentTarget.value = ''; }
  };

  const saveRoutine = async (event) => {
    event.preventDefault(); const form = event.currentTarget; setSaving(true); setError('');
    const data = new FormData(form); const selectedDays = data.getAll('weekday');
    const rawExercises = form.querySelectorAll('[data-exercise-row]');
    const exerciseRows = [...rawExercises].map((row, order) => ({ exerciseType: row.querySelector('[name="exerciseType"]').value, sets: Number(row.querySelector('[name="sets"]').value), repetitions: Number(row.querySelector('[name="repetitions"]').value), durationSeconds: Number(row.querySelector('[name="durationSeconds"]')?.value) || undefined, order, notes: row.querySelector('[name="notes"]').value })).filter((row) => row.exerciseType);
    try {
      const startDate = new Date(`${data.get('date')}T12:00:00`);
      const daysOfWeek = selectedDays.map((day) => WEEKDAYS.indexOf(day) === 6 ? 0 : WEEKDAYS.indexOf(day) + 1);
      if (!daysOfWeek.length) daysOfWeek.push(startDate.getDay());
      await updateUserPreferences(token, { fitnessRestSeconds: restSeconds });
      const saved = await createServiceRecord(ROUTINES, token, { name: String(data.get('name')).trim(), date: startDate.toISOString(), monthlyGoal: Number(data.get('monthlyGoal')) || 1, exercises: exerciseRows, active: true, recurrence: { daysOfWeek, startDate: startDate.toISOString(), timeZone: 'America/Bogota' } });
      setRoutines((current) => [saved.routine, ...current]); setNotice(t('fitpulse.created')); setOpen(false); form.reset();
    } catch { setError(t('fitpulse.saveError')); }
    finally { setSaving(false); }
  };

  const addExerciseRow = () => {
    const row = document.createElement('div'); row.className = 'fitpulse-exercise-row'; row.dataset.exerciseRow = 'true';
    row.innerHTML = `<label>${t('fitpulse.exercise')}<select name="exerciseType" required>${exerciseTypes.map((item) => `<option value="${escapeAttr(item._id)}">${escapeText(item.name)}</option>`).join('')}</select></label><label>${t('fitpulse.sets')}<input name="sets" type="number" min="1" value="3" required /></label><label>${t('fitpulse.repetitions')}<input name="repetitions" type="number" min="1" value="10" required /></label><label>${t('fitpulse.durationSeconds')}<input name="durationSeconds" type="number" min="1" value="45" /></label><label>${t('fitpulse.notes')}<input name="notes" /></label><button type="button" aria-label="${escapeAttr(t('common.cancel'))}" data-remove-row>×</button>`;
    row.querySelector('[data-remove-row]').addEventListener('click', () => row.remove()); document.getElementById('fitpulse-exercise-rows')?.append(row);
  };

  return <PublicLayout><main className="suite-page fitpulse-page"><header className="suite-module-header"><div><p className="suite-eyebrow"><span />FitPulse · {t('fitpulse.active')}</p><h1>{t('fitpulse.title')}</h1><p>{t('fitpulse.subtitle')}</p></div><div className="suite-header-actions"><a className="suite-button suite-button--secondary" href="/fitpulse-routine-template.xlsx" download><Upload size={16} />{t('fitpulse.template')}</a><label className="suite-button suite-button--secondary fitpulse-import">{t('fitpulse.import')}<input type="file" accept=".xlsx,.xls" onChange={importWorkbook} hidden /></label><button className="suite-button suite-button--primary" type="button" onClick={() => setOpen(true)}><CirclePlus size={18} />{t('fitpulse.newRoutine')}</button></div></header>
    {notice ? <p className="suite-notice" role="status">{notice}</p> : null}{error ? <p className="form-feedback form-feedback--error" role="alert">{error}</p> : null}
    <section className="suite-stats-grid"><Stat icon={<Activity />} label={t('fitpulse.sessions')} value={finished.length} /><Stat icon={<Timer />} label={t('fitpulse.streak')} value={`${weeklyStreak}/7`} /><Stat icon={<Dumbbell />} label={t('fitpulse.scheduled')} value={routines.filter((routine) => routine.status !== 'completed').length} /></section>
    {session ? <section className="suite-panel fitpulse-live"><p className="suite-eyebrow">{session.phase === 'rest' ? t('fitpulse.resting') : t('fitpulse.live')}</p><h2>{session.phase === 'rest' ? t('fitpulse.rest') : exerciseName(session.routine.exercises[session.index], exerciseTypes)}</h2><strong className="fitpulse-timer" role="timer">{formatSeconds(seconds)}</strong><p>{session.index + 1} / {session.routine.exercises.length} · {session.routine.name}</p><div className="suite-header-actions"><button type="button" className="suite-button suite-button--primary" onClick={async () => { const nextRunning = !session.running; try { const response = await httpClient(`/fitness/sessions/${session.backendSession._id}`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ status: nextRunning ? 'in_progress' : 'paused', currentExerciseIndex: session.index, currentPhase: session.phase, secondsRemaining: seconds }) }); setSession((current) => ({ ...current, running: nextRunning, backendSession: response.session })); } catch { setError(t('fitpulse.saveError')); } }}>{session.running ? <Pause size={17} /> : <Play size={17} />}{session.running ? t('fitpulse.pause') : t('fitpulse.resume')}</button><button type="button" className="suite-button suite-button--secondary" onClick={async () => { const index = Math.min(session.index + 1, session.routine.exercises.length - 1); setSession((current) => current ? { ...current, index, phase: 'exercise' } : current); const remaining = Number(session.routine.exercises[index]?.durationSeconds) || 45; setSeconds(remaining); await httpClient(`/fitness/sessions/${session.backendSession._id}`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ currentExerciseIndex: index, currentPhase: 'exercise', secondsRemaining: remaining }) }).catch(() => setError(t('fitpulse.saveError'))); }}><RotateCcw size={16} />{t('fitpulse.next')}</button><button type="button" className="suite-button suite-button--secondary" onClick={() => finishSession(session)}>{t('fitpulse.finish')}</button></div></section> : null}
    <section className="suite-panel"><div className="suite-panel-heading"><div><h2>{t('fitpulse.routines')}</h2><p>{t('fitpulse.routinesHelp')}</p></div></div>{loading ? <p role="status">{t('goal.loading')}</p> : !routines.length ? <div className="suite-empty-state"><p>{t('fitpulse.empty')}</p><button type="button" className="suite-button suite-button--primary" onClick={() => setOpen(true)}>{t('fitpulse.start')}</button></div> : <div className="suite-service-grid">{routines.map((routine) => <article className="suite-panel fitpulse-routine-card" key={routine._id}><span className="suite-chip">{t(`fitpulse.status.${routine.status}`)}</span><h3>{routine.name}</h3><p>{new Date(routine.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO')}</p><ul>{routine.exercises.map((exercise, index) => <li key={exercise._id ?? index}>{exerciseName(exercise, exerciseTypes)} · {exercise.sets} × {exercise.repetitions}</li>)}</ul>{routine.status !== 'completed' ? <button type="button" className="suite-button suite-button--primary" onClick={() => startSession(routine)}><Play size={16} />{t('fitpulse.begin')}</button> : <CheckCircle2 size={18} />}</article>)}</div>}</section>
    {open ? <div className="modal-backdrop" role="presentation"><section className="modal-sheet fitpulse-modal" role="dialog" aria-modal="true" aria-labelledby="fitpulse-modal-title"><header className="modal-heading"><h2 id="fitpulse-modal-title">{t('fitpulse.newRoutine')}</h2><button type="button" aria-label={t('common.cancel')} onClick={() => setOpen(false)}><X size={18} /></button></header><form className="form-stack" onSubmit={saveRoutine}><label>{t('fitpulse.routineName')}<input name="name" required /></label><label>{t('fitpulse.firstSessionDate')}<input name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)} required /></label><label>{t('fitpulse.monthlyGoal')}<input name="monthlyGoal" type="number" min="1" defaultValue="12" /></label><fieldset className="fitpulse-weekdays"><legend>{t('fitpulse.repeatDays')}</legend>{WEEKDAYS.map((day) => <label key={day}><input type="checkbox" name="weekday" value={day} />{t(`fitpulse.days.${day}`)}</label>)}</fieldset><div id="fitpulse-exercise-rows"><div className="fitpulse-exercise-row" data-exercise-row="true"><label>{t('fitpulse.exercise')}<select name="exerciseType" required defaultValue=""><option value="" disabled>{t('fitpulse.chooseExercise')}</option>{exerciseTypes.map((item) => <option value={item._id} key={item._id}>{item.name}</option>)}</select></label><label>{t('fitpulse.sets')}<input name="sets" type="number" min="1" defaultValue="3" required /></label><label>{t('fitpulse.repetitions')}<input name="repetitions" type="number" min="1" defaultValue="10" required /></label><label>{t('fitpulse.durationSeconds')}<input name="durationSeconds" type="number" min="1" defaultValue="45" /></label><label>{t('fitpulse.notes')}<input name="notes" /></label></div></div><button type="button" className="suite-button suite-button--secondary" onClick={addExerciseRow}><CirclePlus size={16} />{t('fitpulse.addExercise')}</button><div className="modal-actions"><button type="button" className="suite-button suite-button--secondary" onClick={() => setOpen(false)}>{t('common.cancel')}</button><button type="submit" className="suite-button suite-button--primary" disabled={saving || !exerciseTypes.length}>{saving ? t('budget.saving') : t('common.saveChanges')}</button></div></form></section></div> : null}
  </main></PublicLayout>;
}

function Stat({ icon, label, value }) { return <article className="suite-stat-card"><span className="fitpulse-stat-icon">{icon}</span><small>{label}</small><strong>{value}</strong></article>; }
function exerciseName(exercise, types) { return types.find((item) => item._id === (exercise.exerciseType?._id ?? exercise.exerciseType))?.name ?? '—'; }
function formatSeconds(value) { return `${String(Math.floor(value / 60)).padStart(2,'0')}:${String(value % 60).padStart(2,'0')}`; }
function recurringDates(start, selected, occurrences) { const wanted = new Set(selected.map((day) => WEEKDAYS.indexOf(day) + 1)); const dates = []; const cursor = new Date(start); while (dates.length < selected.length * occurrences) { const weekday = cursor.getDay() || 7; if (wanted.has(weekday) && cursor >= start) dates.push(new Date(cursor)); cursor.setDate(cursor.getDate() + 1); } return dates; }
function signalTone() { try { const Audio = window.AudioContext || window.webkitAudioContext; if (!Audio) return; const context = new Audio(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 880; gain.gain.value = .08; oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .16); oscillator.onended = () => context.close(); } catch { /* Audio is an enhancement; the timer remains usable without it. */ } }
function escapeText(value) { return String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char])); }
function escapeAttr(value) { return escapeText(value); }
