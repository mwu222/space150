// GENERATED from Schedule.dc.html by tools/board2react.py. Don't edit by hand.
// @ts-nocheck
import { DCLogic } from "../runtime/dc";

export default class ScheduleLogic extends DCLogic {
  constructor(props) {
    super(props);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const off = (n) => { const d = new Date(t); d.setDate(d.getDate() + n); return iso(d); };
    const seedTasks = [
      { id: 1, text: 'Read chapter 4', done: true, plan: 2700, logged: 2710 },
      { id: 2, text: 'Problem set 3', done: false, plan: 3000, logged: 1500 },
      { id: 3, text: 'Essay outline', done: false, plan: 1800, logged: 630 },
      { id: 4, text: 'Email study group', done: false, plan: 0, logged: 0 },
      { id: 5, text: 'Flashcards, ch. 5', done: false, plan: 900, logged: 0 },
      { id: 6, text: 'Review lecture 7 slides', done: false, plan: 1500, logged: 0 },
      { id: 7, text: 'Lab report intro', done: false, plan: 2700, logged: 0 }
    ];
    this.state = {
      customTags: [], hiddenKinds: [], tagDraft: null, tagErr: '',
      view: 'day', cur: iso(t), selTask: null, ghost: null, preview: null, movingId: null,
      tasks: this.readJSON('space150.todo') || seedTasks,
      dayPlan: this.readJSON('space150.dayplan') || [{ id: 'p1', date: off(0), start: 960, taskId: 3 }],
      weekItems: [
        { id: 'w1', date: off(0), start: 540, dur: 90, title: 'Biology lecture', kind: 'class' },
        { id: 'w2', date: off(0), start: 720, dur: 45, title: 'Lunch with Maya', kind: 'social' },
        { id: 'w3', date: off(1), start: 660, dur: 60, title: 'Math tutorial', kind: 'class' },
        { id: 'w4', date: off(1), start: 960, dur: 90, title: 'Study group', kind: 'social' },
        { id: 'w5', date: off(2), start: 540, dur: 90, title: 'Biology lecture', kind: 'class' },
        { id: 'w6', date: off(-2), start: 840, dur: 120, title: 'Lab session', kind: 'class' },
        { id: 'w7', date: off(3), start: 1080, dur: 60, title: 'Soccer practice', kind: 'other' }
      ],
      monthItems: [
        { id: 'm1', date: off(3), title: 'Essay outline due', kind: 'deadline' },
        { id: 'm2', date: off(5), title: 'Biology quiz', kind: 'deadline' },
        { id: 'm3', date: off(9), title: 'Field trip', kind: 'class' },
        { id: 'm4', date: off(12), title: 'Dad’s birthday', kind: 'social' },
        { id: 'm5', date: off(16), title: 'Math midterm', kind: 'deadline' },
        { id: 'm6', date: off(-4), title: 'Club fair', kind: 'other' }
      ],
      notes: this.readJSON('space150.weeknotes') || { [off(0)]: 'Bring lab coat for Thursday.' },
      wTitle: '', wStart: '09:00', wEnd: '10:00', wKind: 'class', wErr: '',
      mTitle: '', mKind: 'deadline', mErr: ''
    };
  }
  readJSON(k) { return null; }
  componentDidMount() {}
  componentWillUnmount() { clearInterval(this.iv); try { window.removeEventListener('storage', this.onStore); } catch (e) {} }
  renderVals() {
    const v = this._renderVals();
    const lampN = 3;
    return { ...v, lampGlow: lampN ? 1 : 0, lampInk: lampN ? '#2B2A27' : '#A39C8E', lampOff: lampN === 0, lampTip: true,
      lampSub: '3 online · 2 focused on work', lampNone: false,
      lampRows: [['[Friend 1]', 'running', 'Focusing · 40m in'], ['[Friend 2]', 'paused', 'Paused · 15m in'], ['[Friend 3]', 'online', 'Online now']].map(([name, act, status], i) => ({
        name, status, initial: 'F' + (i + 1), tint: ['#FBF3D9', '#F2F5EE', '#F3EEF7'][i], nameColor: '#2B2A27',
        dot: act === 'running' ? '#E8A838' : act === 'paused' ? '#F2D59A' : '#8FB07E', glow: act === 'running' ? '0 0 6px 2px rgba(232, 168, 56, 0.55)' : 'none',
        note: act === 'running' ? 'Focused on work · timer going' : act === 'paused' ? 'Timer paused' : 'Not focusing · no timer going', noteFg: act === 'running' ? '#9A6A12' : '#8A8478' })),
      lampOpen: !!this.state.lampOpen, lampTipClass: this.state.lampOpen ? 'lamptip pinned' : 'lamptip',
      toggleLamp: () => {
        const open = !this.state.lampOpen;
        if (this._lampAway) { document.removeEventListener('click', this._lampAway, true); this._lampAway = null; }
        this.setState({ lampOpen: open });
        if (open) setTimeout(() => {
          this._lampAway = (ev) => { if (ev.target && ev.target.closest && ev.target.closest('.lampwrap')) return; document.removeEventListener('click', this._lampAway, true); this._lampAway = null; this.setState({ lampOpen: false }); };
          document.addEventListener('click', this._lampAway, true);
        }, 0);
      }, lampOn: lampN > 0, lampHead: lampN + ' online now', lampMoreOn: false, lampMore: '', lampList: [['[Friend 1]', 'Focusing', '#E8A838'], ['[Friend 2]', 'Online now', '#8FB07E'], ['[Friend 3]', 'Timer paused', '#F2D59A']].map(([name, when, dot]) => ({ name, when, dot, whenFg: dot === '#6B655A' ? '#A39C8E' : '#E3DDD0' })) };
  }

  _renderVals() {
    const st = this.state;
    const START = 7 * 60, END = 23 * 60, TOTAL = END - START, HOUR = 52, SNAP = 15;
    const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
    const today = iso(new Date());
    const curD = parse(st.cur);
    const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const tm = (m) => { const h = Math.floor(m / 60), mi = m % 60, ap = h >= 12 ? 'PM' : 'AM', h12 = ((h + 11) % 12) + 1; return h12 + (mi ? ':' + String(mi).padStart(2, '0') : '') + ' ' + ap; };
    const tmShort = (m) => { const h = Math.floor(m / 60), mi = m % 60, h12 = ((h + 11) % 12) + 1; return h12 + (mi ? ':' + String(mi).padStart(2, '0') : ''); };
    const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    const dur = (m) => m >= 60 ? Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : '') : m + ' min';
    const pal = { task: ['#E6EEFA', '#8FA8E8', '#C9D6F2'], done: ['#EEF3EA', '#6B8A5E', '#CADBC1'], class: ['#F1ECF8', '#9C8AD0', '#DCD3EE'], social: ['#E7F0E2', '#6B8A5E', '#CADBC1'], deadline: ['#FBE9E2', '#C8553D', '#F0CBBE'], other: ['#F4F1EA', '#8A8273', '#DDD6C8'] };
    const KINDS = [['class', 'Class'], ['social', 'Social'], ['deadline', 'Deadline'], ['other', 'Other']];
    const TAGPAL = [['#FDF0D5', '#D9A23A', '#F3DDAF'], ['#E3F1F4', '#4C93A3', '#C4E0E6'], ['#FBE4EE', '#C2648E', '#F1C6D8'], ['#E9E6F8', '#6F66C2', '#D2CEF0'], ['#EAF2DC', '#7F9A3E', '#D3E2B6'], ['#F6E6DA', '#B0703E', '#EBCDB6']];
    for (const tg of st.customTags || []) { pal[tg.id] = TAGPAL[(tg.color || 0) % TAGPAL.length]; KINDS.push([tg.id, tg.label]); }
    for (const h of st.hiddenKinds || []) { const hi = KINDS.findIndex((k) => k[0] === h && h !== 'other'); if (hi >= 0) KINDS.splice(hi, 1); }
    const isCustom = (k) => (st.customTags || []).some((tg) => tg.id === k);
    const canDelete = (k) => k !== 'other';
    const kindLabel = (k) => (KINDS.find((x) => x[0] === k) || ['', 'Other'])[1];
    const longDate = (s) => { const d = parse(s); return DOWL[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); };
    // ---- day: to-do tasks from Home
    const tasks = (st.tasks || []).map((t) => ({ id: t.id, title: t.text, mins: t.plan ? Math.round(t.plan / 60) : 0, doneMin: Math.round((t.logged || 0) / 60), done: !!t.done, showFrom: t.showFrom || null, note: t.note || '', kind: t.kind || null }));
    // Tasks added for a future day only show up from that day on.
    const shownOn = (ds) => tasks.filter((t) => !t.showFrom || t.showFrom <= ds);
    // Each day has its own to-do list: today's is your Home list, other days hold tasks added for them.
    // A task leaves the list once it's dragged onto a day (move it on the timeline after that).
    const placedIds = new Set((st.dayPlan || []).map((b) => b.taskId));
    const trayFor = (ds) => tasks.filter((t) => !t.done && !placedIds.has(t.id) && (ds === today ? (!t.showFrom || t.showFrom <= today) : t.showFrom === ds));
    const taskById = (id) => tasks.find((t) => t.id === id);
    const taskPal = (t) => !t ? pal.task : t.done ? pal.done : (t.kind && pal[t.kind]) || pal.task;
    const taskTag = (t) => t && t.kind && pal[t.kind] ? kindLabel(t.kind) : '';
    const gridH = Math.round(TOTAL / 60 * HOUR);
    const minToPx = (m) => Math.round((m - START) / TOTAL * gridH);
    const snap = (m) => Math.max(START, Math.min(END - SNAP, Math.round(m / SNAP) * SNAP));
    const fromY = (clientY, rect) => START + (clientY - rect.top) / rect.height * TOTAL;
    const gridEl = () => { try { return document.querySelector('.daygrid'); } catch (e) { return null; } };
    const durOf = (t) => t.mins || 30;
    const place = (task, start) => {
      const d = durOf(task), s3 = Math.min(snap(start), END - d);
      this.setState({ dayPlan: this.state.dayPlan.filter((b) => !(b.taskId === task.id && b.date === st.cur)).concat([{ id: 'p' + task.id + '-' + Date.now(), date: st.cur, start: s3, taskId: task.id }]), selTask: null, ghost: null, preview: null });
    };
    const dayRaw = st.dayPlan.filter((b) => b.date === st.cur && taskById(b.taskId)).map((b) => { const t = taskById(b.taskId); return { ...b, title: t.title, dur: durOf(t), done: t.done, kind: t.kind }; }).sort((a, b) => a.start - b.start);
    const schedFor = (taskId) => dayRaw.find((b) => b.taskId === taskId);
    const taskChips = trayFor(st.cur).map((t) => {
      const sb = schedFor(t.id), sel = st.selTask === t.id;
      const alloc = t.mins ? dur(t.mins) + ' allocated' + (t.doneMin ? ' · ' + dur(t.doneMin) + ' done' : '') : 'No time allocated · 30 min block';
      return {
        title: t.title, sel, deco: t.done ? 'line-through' : 'none', titleColor: t.done ? '#6B655A' : '#2B2A27',
        sub: (t.done ? 'Done · ' : '') + alloc + (sb ? ' · ' + tm(sb.start) : ''),
        subColor: sb ? '#3E6B33' : '#6B655A',
        border: sel ? '#2B2A27' : '#D8D1C2', accent: sb ? '#6B8A5E' : '#8FA8E8',
        bg: sel ? '#FBF3D9' : (sb ? '#F4F8F1' : '#FFFFFF'),
        label: t.title + ', ' + alloc + (sb ? ', scheduled at ' + tm(sb.start) : ', not scheduled') + '. Drag onto the day, or press Enter then pick a time.',
        down: (e) => { if (e.button && e.button !== 0) return; if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); this.td = { id: t.id, sx: e.clientX, sy: e.clientY, moved: false }; },
        move: (e) => {
          const d = this.td; if (!d || d.id !== t.id) return;
          if (!d.moved && Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) < 6) return;
          d.moved = true;
          const g = gridEl(); let preview = null;
          if (g) { const r = g.getBoundingClientRect(); if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) preview = { start: Math.min(snap(fromY(e.clientY, r)), END - durOf(t)), dur: durOf(t) }; }
          this.setState({ ghost: { x: e.clientX, y: e.clientY, title: t.title }, preview });
        },
        up: () => { const d = this.td; this.td = null; if (!d || d.id !== t.id) return; if (d.moved) { const pv = this.state.preview; if (pv) place(t, pv.start); else this.setState({ ghost: null, preview: null }); } else this.setState({ selTask: sel ? null : t.id }); },
        cancel: () => { this.td = null; this.setState({ ghost: null, preview: null }); },
        key: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.setState({ selTask: sel ? null : t.id }); } }
      };
    });
    const selTaskObj = taskById(st.selTask);
    const openTaskEd = (b) => { const t = taskById(b.taskId) || {}; this.setState({ ed: { mode: 'task', id: b.id, taskId: b.taskId, date: b.date, title: t.title || b.title, from: hhmm(b.start), to: hhmm(b.start + b.dur), kind: t.kind || 'task', note: t.note || '', err: '' } }); };
    const dayBlocks = dayRaw.map((b) => {
      const p = taskPal(b), moving = st.movingId === b.id, tg = taskTag(b);
      return {
        title: (b.done ? '✓ ' : '') + b.title, time: tm(b.start) + '–' + tm(b.start + b.dur) + ' · ' + (tg ? tg + ' · ' : '') + dur(b.dur) + ((taskById(b.taskId) || {}).note && minToPx(b.start + b.dur) - minToPx(b.start) < 58 ? ' · ✎ note' : ''), top: minToPx(b.start), h: Math.max(22, minToPx(b.start + b.dur) - minToPx(b.start)),
        bg: p[0], accent: p[1], border: p[2], z: moving ? 20 : 6, shadow: moving ? '0 8px 18px rgba(43, 42, 39, 0.22)' : 'none',
        cursor: moving ? 'grabbing' : 'grab', removable: true, removeLabel: 'Remove ' + b.title + ' from this day',
        // Notes show on blocks tall enough for a third line; shorter blocks get a small ✎ instead.
        noteOn: !!(taskById(b.taskId) || {}).note && minToPx(b.start + b.dur) - minToPx(b.start) >= 58, note: (taskById(b.taskId) || {}).note || '',
        remove: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ dayPlan: this.state.dayPlan.filter((x) => x.id !== b.id) }); },
        label: b.title + ', ' + tm(b.start) + ' to ' + tm(b.start + b.dur),
        down: (e) => { if (e.target.closest && e.target.closest('button')) return; const g = gridEl(); if (!g) return; if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); this.bd = { id: b.id, sy: e.clientY, start: b.start, rect: g.getBoundingClientRect() }; this.setState({ movingId: b.id }); },
        move: (e) => { const d = this.bd; if (!d || d.id !== b.id) return; const delta = (e.clientY - d.sy) / d.rect.height * TOTAL; const ns = Math.max(START, Math.min(END - b.dur, Math.round((d.start + delta) / SNAP) * SNAP)); this.setState({ dayPlan: this.state.dayPlan.map((x) => x.id === b.id ? { ...x, start: ns } : x) }); },
        up: () => { const d = this.bd; if (d && d.id === b.id) { this.bd = null; this.setState({ movingId: null }); if (this.state.dayPlan.find((x) => x.id === b.id).start === d.start) openTaskEd(b); } }
      };
    });
    const fixed = st.weekItems.filter((b) => b.date === st.cur).map((b) => { const p = pal[b.kind] || pal.other; return {
      title: b.title, time: tm(b.start) + '–' + tm(b.start + b.dur) + ' · ' + kindLabel(b.kind), start: b.start, dur: b.dur,
      top: minToPx(b.start), h: Math.max(22, minToPx(Math.min(END, b.start + b.dur)) - minToPx(Math.max(START, b.start))),
      bg: p[0], accent: p[1], border: p[2], z: st.movingId === b.id ? 20 : 5, shadow: st.movingId === b.id ? '0 8px 18px rgba(43, 42, 39, 0.22)' : 'none', cursor: st.movingId === b.id ? 'grabbing' : 'grab',
      removable: true, removeLabel: 'Delete ' + b.title,
      remove: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ weekItems: this.state.weekItems.filter((x) => x.id !== b.id) }); },
      tip: '', label: b.title + ', ' + tm(b.start) + ' to ' + tm(b.start + b.dur),
      down: (e) => { if (e.target.closest && e.target.closest('button')) return; const g = gridEl(); if (!g) return; if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); this.bd = { id: b.id, sy: e.clientY, start: b.start, rect: g.getBoundingClientRect() }; this.setState({ movingId: b.id }); },
      move: (e) => { const d = this.bd; if (!d || d.id !== b.id) return; const delta = (e.clientY - d.sy) / d.rect.height * TOTAL; const ns = Math.max(START, Math.min(END - b.dur, Math.round((d.start + delta) / SNAP) * SNAP)); this.setState({ weekItems: this.state.weekItems.map((x) => x.id === b.id ? { ...x, start: ns } : x) }); },
      up: () => { if (this.bd && this.bd.id === b.id) { this.bd = null; this.setState({ movingId: null }); } }
    }; });
    fixed.forEach((f) => { if (f.start < START) f.top = 0; });
    const allBlocks = fixed.concat(dayBlocks.map((b, i) => ({ ...b, start: dayRaw[i].start, dur: dayRaw[i].dur, tip: '' }))).sort((a, b) => a.start - b.start);
    // side-by-side lanes for overlapping blocks
    let cluster = [], clusterEnd = -1;
    const flush = () => { const lanes = []; cluster.forEach((b) => { let li = lanes.findIndex((end) => end <= b.start); if (li < 0) { li = lanes.length; lanes.push(0); } lanes[li] = b.start + b.dur; b.lane = li; }); const n = lanes.length; cluster.forEach((b) => { b.left = 'calc(' + (b.lane * 100 / n) + '% + ' + (b.lane ? 3 : 6) + 'px)'; b.width = 'calc(' + (100 / n) + '% - ' + (n === 1 ? 12 : (b.lane === 0 || b.lane === n - 1 ? 9 : 6)) + 'px)'; }); cluster = []; };
    allBlocks.forEach((b) => { if (cluster.length && b.start >= clusterEnd) flush(); cluster.push(b); clusterEnd = Math.max(clusterEnd, b.start + b.dur); });
    flush();
    const hourLines = [];
    for (let m = START; m <= END; m += 30) hourLines.push({ top: minToPx(m), label: m % 60 === 0 ? tmShort(m) + (m < 720 ? ' AM' : ' PM') : '', style: m % 60 === 0 ? 'solid' : 'dashed', color: m % 60 === 0 ? '#E3DDD0' : '#F0EBE0' });
    const now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
    const planned = dayRaw.reduce((a, b) => a + b.dur, 0);
    // ---- week: its own items
    const weekStart = addDays(st.cur, -curD.getDay());
    const WHOUR = 30, weekH = Math.round(TOTAL / 60 * WHOUR);
    const wpx = (m) => Math.round((Math.max(START, Math.min(END, m)) - START) / TOTAL * weekH);
    // Month items show on the week and day views (read-only; tap one to edit it in Month).
    const monthChips = (ds) => st.monthItems.filter((b) => b.date === ds).map((b) => { const p = pal[b.kind] || pal.other; return { title: b.title, kind: kindLabel(b.kind), bg: p[0], accent: p[1], border: p[2] || p[1], label: b.title + ', ' + kindLabel(b.kind) + ', all day. Open in month view.', open: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.setState({ view: 'month', cur: ds }); } }; });
    const weekDays = [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const ds = addDays(weekStart, i), d = parse(ds), isT = ds === today, sel = ds === st.cur;
      const wdg = st.wDrag;
      const tb = st.dayPlan.filter((b) => taskById(b.taskId)).map((b) => wdg && wdg.id === b.id ? { ...b, date: wdg.date, start: wdg.start } : b).filter((b) => b.date === ds).map((b) => { const t = taskById(b.taskId); return { id: b.id, src: 'task', taskId: t.id, start: b.start, dur: durOf(t), name: t.title, title: (t.done ? '✓ ' : '') + t.title, kind: t.done ? 'done' : (t.kind && pal[t.kind] ? t.kind : 'task') }; });
      const blocks = st.weekItems.map((b) => wdg && wdg.id === b.id ? { ...b, date: wdg.date, start: wdg.start } : b).filter((b) => b.date === ds).map((b) => ({ ...b, src: 'item', name: b.title })).concat(tb).map((b) => { const p = pal[b.kind] || pal.other, dragging = !!(wdg && wdg.id === b.id && wdg.moved); return { title: b.title, label: 'Edit ' + b.name + ', ' + tm(b.start) + ' to ' + tm(b.start + b.dur) + '. Drag to move.', top: wpx(b.start), h: Math.max(14, wpx(b.start + b.dur) - wpx(b.start)), bg: p[0], accent: p[1],
        z: dragging ? 20 : 1, shadow: dragging ? '0 6px 14px rgba(43, 42, 39, 0.28)' : 'none', cursor: dragging ? 'grabbing' : 'grab',
        down: (e) => {
          if (e.button && e.button !== 0) return;
          let cols = []; try { cols = Array.prototype.slice.call(document.querySelectorAll('.weekcol')).map((el) => ({ date: el.getAttribute('data-date'), r: el.getBoundingClientRect() })); } catch (er) {}
          const d = { id: b.id, src: b.src, taskId: b.taskId, dur: b.dur, sx: e.clientX, sy: e.clientY, start: b.start, date: ds, cols, moved: false };
          this.wdrag = d;
          // Follow the pointer on the window: the block re-renders in a new day column while it moves.
          const mv = (ev) => {
            if (this.wdrag !== d) return;
            if (!d.moved) { if (Math.abs(ev.clientX - d.sx) + Math.abs(ev.clientY - d.sy) < 6) return; d.moved = true; }
            const col = d.cols.find((c) => ev.clientX >= c.r.left && ev.clientX <= c.r.right) || d.cols.find((c) => c.date === (this.state.wDrag ? this.state.wDrag.date : d.date));
            const hgt = col ? col.r.height : weekH;
            const ns = Math.max(START, Math.min(END - d.dur, Math.round((d.start + (ev.clientY - d.sy) / hgt * TOTAL) / SNAP) * SNAP));
            const g = this.state.wDrag;
            if (!g || g.date !== (col ? col.date : d.date) || g.start !== ns) this.setState({ wDrag: { id: d.id, date: col ? col.date : d.date, start: ns, moved: true } });
          };
          const done = (ev) => {
            window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', done); window.removeEventListener('pointercancel', done);
            if (this.wdrag !== d) return; this.wdrag = null;
            const g = this.state.wDrag;
            if (!d.moved || !g || ev.type === 'pointercancel') { if (g) this.setState({ wDrag: null }); return; }
            this.wJustDragged = true; setTimeout(() => { this.wJustDragged = false; }, 300);
            if (d.src === 'item') this.setState({ wDrag: null, weekItems: this.state.weekItems.map((x) => x.id === d.id ? { ...x, date: g.date, start: g.start } : x) });
            else this.setState({ wDrag: null, dayPlan: this.state.dayPlan.filter((x) => !(x.id !== d.id && x.taskId === d.taskId && x.date === g.date)).map((x) => x.id === d.id ? { ...x, date: g.date, start: g.start } : x) });
          };
          try { window.addEventListener('pointermove', mv); window.addEventListener('pointerup', done); window.addEventListener('pointercancel', done); } catch (er) {}
        },
        move: () => {}, up: () => {}, cancel: () => {},
        edit: (e) => { if (e && e.stopPropagation) e.stopPropagation(); if (this.wJustDragged) return; this.setState({ ed: { mode: b.src, id: b.id, taskId: b.taskId, date: ds, title: b.name, from: hhmm(b.start), to: hhmm(b.start + b.dur), kind: b.src === 'task' ? ((taskById(b.taskId) || {}).kind || 'task') : b.kind, note: b.src === 'task' ? ((taskById(b.taskId) || {}).note || '') : '', err: '' } }); } }; });
      const open = () => this.setState({ cur: ds, view: 'day' });
      const tapNew = (e) => { if (this.wJustDragged) return; if (e.target && e.target.closest && e.target.closest('[data-wblock]')) return; const r = e.currentTarget.getBoundingClientRect(); const m = Math.max(START, Math.min(END - 60, Math.floor((START + (e.clientY - r.top) / r.height * TOTAL) / SNAP) * SNAP)); this.setState({ ed: { mode: 'new', date: ds, title: '', from: hhmm(m), to: hhmm(m + 60), kind: KINDS[0][0], err: '' } }); };
      const allDay = monthChips(ds);
      return { allDay, dow: DOW[i].toUpperCase(), num: d.getDate(), sel, weight: isT ? 700 : 400, numColor: isT ? '#B5562E' : '#2B2A27', line: isT ? '#E8A838' : '#ECE6DA', bg: isT ? '#FFFBEA' : '#FCFAF6', outline: 'none', label: 'Open ' + DOWL[i] + ' ' + MON[d.getMonth()] + ' ' + d.getDate() + ' in day view', blocks, open, tapNew, date: ds };
    });
    const weekHours = [];
    for (let m = START; m <= END; m += 120) weekHours.push({ top: wpx(m), label: tmShort(m) + (m < 720 ? 'a' : 'p') });
    const toMin = (v) => { const p = String(v || '').split(':'); return p.length < 2 ? NaN : Number(p[0]) * 60 + Number(p[1]); };
    const wList = st.weekItems.filter((b) => b.date === st.cur).map((b) => { const p = pal[b.kind] || pal.other; return { start: b.start, title: b.title, sub: tm(b.start) + '–' + tm(b.start + b.dur) + ' · ' + kindLabel(b.kind), accent: p[1], bg: p[0], removeLabel: 'Delete ' + b.title, remove: () => this.setState({ weekItems: this.state.weekItems.filter((x) => x.id !== b.id) }) }; })
      .concat(dayRaw.map((b) => { const p = taskPal(b), t = taskById(b.taskId); return { start: b.start, title: (b.done ? '✓ ' : '') + b.title, sub: tm(b.start) + '–' + tm(b.start + b.dur) + ' · ' + (taskTag(b) || 'To-do') + (t.mins ? ', ' + dur(t.mins) + ' allocated' : ''), accent: p[1], bg: p[0], removeLabel: 'Unschedule ' + b.title, remove: () => this.setState({ dayPlan: this.state.dayPlan.filter((x) => x.id !== b.id) }) }; }))
      .sort((a, b) => a.start - b.start);
    const wTodo = tasks.filter((t) => !t.done && !schedFor(t.id)).map((t) => ({ title: t.title, sub: t.mins ? dur(t.mins) : '30 min', label: 'Schedule ' + t.title + ' on this day at the From time', pick: () => { const s0 = toMin(this.state.wStart); if (isNaN(s0)) return this.setState({ wErr: 'Pick a From time first.' }); place(t, s0); this.setState({ wErr: '' }); } }));
    const kindChips = (cur, key) => KINDS.map(([id, label]) => { const on = cur === id, p = pal[id]; return { label, on, dot: p[1], bg: on ? p[0] : '#FFFFFF', border: on ? p[1] : '#D8D1C2', pick: () => key ? this.setState({ [key]: id }) : this.setState({ ed: { ...this.state.ed, kind: on && this.state.ed.mode === 'task' ? 'task' : id } }),
      custom: canDelete(id), padR: canDelete(id) ? 2 : 10, removeLabel: 'Delete the ' + label + ' tag', remove: () => removeTag(id) }; });
    const closeMTag = () => { if (this._mTagAway) { document.removeEventListener('click', this._mTagAway, true); this._mTagAway = null; } this.setState({ mTagMenu: false, mTagDraft: null, mTagErr: '' }); };
    const dtErrOf = (h, m) => Number(h || 0) > 9 ? 'Hours can be 9 at most.' : Number(m || 0) > 60 ? 'Minutes can’t be more than 60.' : '';
    const dtErr = dtErrOf(st.dtH, st.dtM);
    const addDayTask = () => {
      const s2 = this.state, text = (s2.dtText || '').trim();
      if (!text || dtErrOf(s2.dtH, s2.dtM)) return;
      const mins = Number(s2.dtH != null ? s2.dtH : 0) * 60 + Number(s2.dtM != null ? s2.dtM : 30), future = s2.cur > today;
      this.setState({ tasks: (s2.tasks || []).concat([{ id: 'n' + Date.now(), text, done: false, plan: mins ? mins * 60 : 0, logged: 0, showFrom: future ? s2.cur : null }]),
        dtText: '', dtNote: future ? 'Added. It moves onto your Home to-do list on ' + longDate(s2.cur) + '.' : '' });
    };
    const removeTag = (id) => {
      const s2 = this.state, fix = (arr) => arr.map((b) => (b.kind === id ? { ...b, kind: 'other' } : b));
      this.setState({ customTags: (s2.customTags || []).filter((tg) => tg.id !== id), hiddenKinds: isCustom(id) ? (s2.hiddenKinds || []) : (s2.hiddenKinds || []).concat([id]), weekItems: fix(s2.weekItems), monthItems: fix(s2.monthItems), tasks: (s2.tasks || []).map((t) => (t.kind === id ? { ...t, kind: isCustom(id) ? 'other' : null } : t)),
        ed: s2.ed && s2.ed.kind === id ? { ...s2.ed, kind: s2.ed.mode === 'task' ? 'task' : 'other' } : s2.ed, wKind: s2.wKind === id ? 'other' : s2.wKind, mKind: s2.mKind === id ? 'other' : s2.mKind });
    };
    const addTag = (where) => {
      const m = where === 'm', DK = m ? 'mTagDraft' : 'tagDraft', EK = m ? 'mTagErr' : 'tagErr';
      const s2 = this.state, label = (s2[DK] || '').trim().replace(/\s+/g, ' ');
      const pickIt = (id) => m ? { mKind: id } : { ed: s2.ed ? { ...s2.ed, kind: id } : s2.ed };
      if (!label) return this.setState({ [EK]: 'Type a tag name.' });
      const builtin = [['class', 'Class'], ['social', 'Social'], ['deadline', 'Deadline']].find((k) => k[1].toLowerCase() === label.toLowerCase());
      if (builtin && (s2.hiddenKinds || []).includes(builtin[0])) return this.setState({ hiddenKinds: s2.hiddenKinds.filter((h) => h !== builtin[0]), [DK]: null, [EK]: '', ...pickIt(builtin[0]) });
      if (KINDS.some((k) => k[1].toLowerCase() === label.toLowerCase())) return this.setState({ [EK]: 'You already have that tag.' });
      const used = (s2.customTags || []).map((tg) => tg.color), color = [0, 1, 2, 3, 4, 5].sort((a, b) => used.filter((u) => u === a).length - used.filter((u) => u === b).length)[0];
      const id = 'c' + Date.now();
      this.setState({ customTags: (s2.customTags || []).concat([{ id, label, color }]), [DK]: null, [EK]: '', ...pickIt(id) });
    };
    // ---- month: its own items
    const first = new Date(curD.getFullYear(), curD.getMonth(), 1);
    const daysIn = new Date(curD.getFullYear(), curD.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= daysIn; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);
    const monthCells = cells.map((d) => {
      if (!d) return { blank: true, sel: false, num: '', label: '', bw: 0, border: 'transparent', bg: 'transparent', weight: 400, numColor: '#2B2A27', cursor: 'default', items: [], more: '', pick: () => {} };
      const ds = iso(new Date(curD.getFullYear(), curD.getMonth(), d)), isT = ds === today, sel = ds === st.cur;
      const evs = st.monthItems.filter((b) => b.date === ds);
      const items = evs.slice(0, 3).map((b) => { const p = pal[b.kind] || pal.other; return { t: b.title, bg: p[0], accent: p[1] }; });
      return { blank: false, sel, num: d, bw: sel || isT ? 2 : 1, border: sel ? '#2B2A27' : (isT ? '#E8A838' : '#ECE6DA'), bg: sel ? '#FBF3D9' : (isT ? '#FFFBEA' : '#FFFFFF'), weight: isT || sel ? 700 : 400, numColor: isT ? '#B5562E' : '#2B2A27', cursor: 'pointer', items, more: evs.length > 3 ? '+' + (evs.length - 3) + ' more' : '', label: MON[curD.getMonth()] + ' ' + d + ': ' + (evs.length ? evs.length + (evs.length === 1 ? ' item' : ' items') : 'nothing added'), pick: () => this.setState({ cur: ds, mErr: '' }) };
    });
    const mList = st.monthItems.filter((b) => b.date === st.cur).map((b) => { const p = pal[b.kind] || pal.other; return { title: b.title, sub: kindLabel(b.kind), accent: p[1], bg: p[0], removeLabel: 'Delete ' + b.title, remove: () => this.setState({ monthItems: this.state.monthItems.filter((x) => x.id !== b.id) }) }; });
    // ---- week editor
    const ed = st.ed;
    const setEd = (o) => this.setState({ ed: { ...this.state.ed, ...o } });
    const edMins = ed ? toMin(ed.to) - toMin(ed.from) : 0;
    const pushTaskEdit = (taskId, text, planSec, note, kind) => {
      this.setState({ tasks: this.state.tasks.map((t) => t.id === taskId ? { ...t, text, plan: planSec, note: note != null ? note : t.note, kind: kind !== undefined ? kind : (t.kind || null) } : t) });
    };
    const parts = (v) => { const m0 = toMin(v); const mm = isNaN(m0) ? 540 : m0; const h = Math.floor(mm / 60); return { h12: ((h + 11) % 12) + 1, m: mm % 60, pm: h >= 12 }; };
    const build = (h12, m, pm) => (h12 % 12 + (pm ? 12 : 0)) * 60 + m;
    const parseTyped = (txt) => { const x = String(txt || '').trim().toLowerCase().replace(/\s+/g, '').replace(/\./g, ''); const r = x.match(/^(\d{1,2})(?::?(\d{2}))?(a|p|am|pm)?$/); if (!r) return NaN; let h = Number(r[1]); const m = r[2] ? Number(r[2]) : 0; if (m > 59) return NaN; if (r[3]) { if (h < 1 || h > 12) return NaN; h = h % 12 + (r[3][0] === 'p' ? 12 : 0); } else if (h > 23) return NaN; return h * 60 + m; };
    const timeEd = (cur, key, mins) => {
      const v = hhmm(Math.max(0, Math.min(23 * 60 + 59, mins)));
      if (key !== 'from') return { ...cur, to: v, err: '' };
      const len = toMin(cur.to) - toMin(cur.from), keep = isNaN(len) || len <= 0 ? 60 : len;
      return { ...cur, from: v, to: hhmm(Math.min(23 * 60 + 59, toMin(v) + keep)), err: '' };
    };
    const setTime = (key, mins) => { const cur = this.state.ed; if (cur) this.setState({ ed: timeEd(cur, key, mins) }); };
    const mkCol = (key, kind, p, label) => {
      const vals = kind === 'h' ? [p.h12 - 2, p.h12 - 1, p.h12, p.h12 + 1, p.h12 + 2].map((h) => ((h - 1 + 120) % 12) + 1)
        : kind === 'm' ? [-10, -5, 0, 5, 10].map((d) => (p.m + d + 60) % 60)
        : kind === 'p' ? (p.pm ? [null, 'AM', 'PM', null, null] : [null, null, 'AM', 'PM', null])
        : kind === 'lh' ? [-2, -1, 0, 1, 2].map((d) => { const h = p.lh + d; return h < 0 || h > 12 ? null : h; })
        : kind === 'lm' ? [-10, -5, 0, 5, 10].map((d) => (p.lm + d + 60) % 60)
        : [null, null, label, null, null];
      const stepBy = (n) => {
        if (!n) return;
        const q = parts(this.state.ed[key]);
        if (kind === 'h') { const cm = toMin(this.state.ed[key]); setTime(key, (((isNaN(cm) ? 540 : cm) + 60 * n) % 1440 + 1440) % 1440); }
        else if (kind === 'm') { const base = n > 0 ? Math.floor(q.m / 5) * 5 : Math.ceil(q.m / 5) * 5; const m = ((base + 5 * n) % 60 + 60) % 60; setTime(key, build(q.h12, m, q.pm)); }
        else if (kind === 'p') { const pm = n > 0; if (pm !== q.pm) setTime(key, build(q.h12, q.m, pm)); }
        else if (kind === 'lh' || kind === 'lm') {
          const cur = this.state.ed, f = toMin(cur.from), len0 = toMin(cur.to) - f, len = isNaN(len0) || len0 < 0 ? 60 : len0;
          let h = Math.floor(len / 60), m = len % 60;
          if (kind === 'lh') h = Math.max(0, Math.min(12, h + n));
          else { const base = n > 0 ? Math.floor(m / 5) * 5 : Math.ceil(m / 5) * 5; m = ((base + 5 * n) % 60 + 60) % 60; }
          setTime('to', f + Math.max(5, h * 60 + m));
        }
      };
      const items = vals.map((v, i) => { const dist = Math.abs(i - 2); return { t: v === null ? '' : (kind === 'm' || kind === 'lm' ? String(v).padStart(2, '0') : String(v)), op: dist === 0 ? 1 : dist === 1 ? 0.55 : 0.25, fs: kind === 'p' || kind === 's' && label !== ':' ? (dist ? 13 : 14) : (dist ? 17 : 22), fw: dist ? 400 : 600, font: kind === 'p' || kind === 's' && label !== ':' ? 'Karla, sans-serif' : 'Newsreader, serif', pick: () => { if (this.wheelMoved) return; stepBy(i - 2); } }; });
      if (kind === 's') return { role: 'presentation', tab: '-1', aria: '', valText: '', w: label === ':' ? 8 : label === 'h' ? 16 : 28, cursor: 'default', items, wheel: () => {}, down: () => {}, move: () => {}, up: () => {}, key: () => {} };
      const valText = kind === 'h' ? String(p.h12) : kind === 'm' ? String(p.m).padStart(2, '0') : kind === 'lh' ? p.lh + ' hours' : kind === 'lm' ? p.lm + ' minutes' : (p.pm ? 'PM' : 'AM');
      return {
        role: 'spinbutton', tab: '0', aria: label, valText, w: kind === 'p' ? 42 : kind === 'lh' ? 34 : 40, cursor: 'ns-resize', items,
        wheel: (e) => { this.wacc = (this.wacc || 0) + e.deltaY; const n = Math.trunc(this.wacc / 40); if (n) { this.wacc -= n * 40; stepBy(n); } },
        down: (e) => { this.wd = { id: key + kind, y: e.clientY, acc: 0, el: e.currentTarget, pid: e.pointerId }; this.wheelMoved = false; },
        move: (e) => { const d = this.wd; if (!d || d.id !== key + kind) return; d.acc += d.y - e.clientY; d.y = e.clientY; if (!this.wheelMoved && Math.abs(d.acc) > 4) { this.wheelMoved = true; try { d.el.setPointerCapture(d.pid); } catch (er) {} } const n = Math.trunc(d.acc / 26); if (n) { d.acc -= n * 26; stepBy(n); } },
        up: () => { this.wd = null; setTimeout(() => { this.wheelMoved = false; }, 0); },
        key: (e) => { if (e.key === 'ArrowUp') { e.preventDefault(); stepBy(-1); } else if (e.key === 'ArrowDown') { e.preventDefault(); stepBy(1); } }
      };
    };
    const parseClock = (txt) => { const x = String(txt || '').trim(); let r = x.match(/^(\d{1,2}):(\d{2})$/); if (!r) { r = x.match(/^(\d{1,2})(\d{2})$/); } if (!r) return NaN; const h = Number(r[1]), m = Number(r[2]); return m > 59 ? NaN : h * 60 + m; };
    const parseLen = (txt) => parseClock(txt);
    const lenOf = (e) => { const l = toMin(e.to) - toMin(e.from); return isNaN(l) || l < 0 ? 60 : l; };
    const edPickers = !ed ? [] : [['from', 'START'], ['len', 'LENGTH']].map(([key, label]) => {
      const isLen = key === 'len', typing = !!(ed.typing && ed.typing[key]);
      const pf = parts(ed.from);
      const shown = isLen ? hhmm(lenOf(ed)) : String(pf.h12).padStart(2, '0') + ':' + String(pf.m).padStart(2, '0');
      const nice = isLen ? dur(lenOf(ed)) : tm(toMin(ed.from));
      const txt = ed.text && ed.text[key] !== undefined ? ed.text[key] : shown;
      const pm = ed.period ? ed.period === 'PM' : parts(ed.from).pm;
      const to24 = (n, isPm) => { if (isNaN(n)) return NaN; const h = Math.floor(n / 60), m = n % 60; if (h < 1 || h > 12) return NaN; return (h % 12 + (isPm ? 12 : 0)) * 60 + m; };
      const parsed = isLen ? parseLen(txt) : to24(parseClock(txt), pm), bad = typing && txt.trim() !== '' && (isNaN(parsed) || (isLen && (parsed < 5 || parsed > 720)));
      const setTyping = (on) => { const cur = this.state.ed; this.setState({ ed: { ...cur, typing: { ...(cur.typing || {}), [key]: on }, text: { ...(cur.text || {}), [key]: on ? (isLen ? hhmm(lenOf(cur)) : (() => { const q = parts(cur.from); return String(q.h12).padStart(2, '0') + ':' + String(q.m).padStart(2, '0'); })()) : undefined }, period: on && !isLen ? (parts(cur.from).pm ? 'PM' : 'AM') : cur.period } }); };
      const p = isLen ? { lh: Math.floor(lenOf(ed) / 60), lm: lenOf(ed) % 60 } : parts(ed.from);
      return {
        label, typing, wheels: !typing,
        typeText: typing ? 'Scroll' : 'Type', notTyping: !typing, typeAria: typing ? 'Back to the scroll wheel for ' + label.toLowerCase() : 'Type the ' + label.toLowerCase(),
        typeBg: '#FFFFFF', typeBorder: '#D8D1C2',
        toggleType: () => setTyping(!typing),
        text: txt, inputAria: isLen ? 'Length in hours and minutes, 00:00' : 'Start time, 00:00',
        showPeriod: !isLen, period: pm ? 'PM' : 'AM',
        onPeriod: (e) => { const isPm = e.target.value === 'PM', cur = this.state.ed; let next = { ...cur, period: isPm ? 'PM' : 'AM', err: '' }; const t0 = next.text && next.text.from !== undefined ? next.text.from : ''; const n = to24(parseClock(t0), isPm); const q = parts(cur.from); next = timeEd(next, 'from', !isNaN(n) ? n : build(q.h12, q.m, isPm)); this.setState({ ed: next }); }, placeholder: '00:00',
        inputBorder: bad ? '#C8553D' : '#B8B0A0', note: bad ? (isLen ? (isNaN(parsed) ? 'Use 00:00, e.g. 01:30 for 90 min' : parsed > 720 ? 'Length can be up to 12:00' : 'Length needs to be at least 00:05') : (isNaN(parseClock(txt)) ? 'Use 00:00, e.g. 02:30' : 'Hours go from 01 to 12')) : (txt.trim() ? (isLen ? (lenOf(ed) >= 60 ? lenOf(ed) + ' min · ' : '') + nice : nice) : ''), noteColor: bad ? '#B5562E' : '#6B655A',
        onText: (e) => { const v = e.target.value, cur = this.state.ed; let next = { ...cur, text: { ...(cur.text || {}), [key]: v }, err: '' };
          if (isLen) { const n = parseLen(v); if (!isNaN(n) && n >= 5 && n <= 720) next = timeEd(next, 'to', toMin(next.from) + n); }
          else { const n = to24(parseClock(v), pm); if (!isNaN(n)) next = timeEd(next, 'from', n); }
          this.setState({ ed: next }); },
        onKey: (e) => { if (e.key === 'Enter') { e.preventDefault(); setTyping(false); } },
        cols: isLen ? [mkCol('to', 'lh', p, 'Length hours'), mkCol('to', 's', p, 'h'), mkCol('to', 'lm', p, 'Length minutes'), mkCol('to', 's', p, 'min')]
          : [mkCol('from', 'h', parts(ed.from), 'Start hour'), mkCol('from', 's', p, ':'), mkCol('from', 'm', parts(ed.from), 'Start minutes'), mkCol('from', 'p', parts(ed.from), 'Start AM or PM')]
      };
    });
    const edVals = {
      edNoteOn: !!ed && ed.mode === 'task', edNote: ed ? ed.note || '' : '', edOnNote: (e) => setEd({ note: e.target.value }),
      edOn: !!ed, edPickers, edHeading: !ed ? '' : ed.mode === 'new' ? 'Add to your week' : ed.mode === 'task' ? 'Edit to-do task' : 'Edit item',
      edDate: ed ? longDate(ed.date) : '',
      edTitle: ed ? ed.title : '', edOnTitle: (e) => setEd({ title: e.target.value, err: '' }),
      edKey: (e) => { if (e.key !== 'Enter' || e.isComposing) return; if (e.preventDefault) e.preventDefault(); this.renderVals().edSave(); },
      tagAddOn: st.tagDraft != null, tagAddOff: st.tagDraft == null, tagDraft: st.tagDraft || '',
      tagOpen: () => this.setState({ tagDraft: '', tagErr: '' }), tagCancel: () => this.setState({ tagDraft: null, tagErr: '' }),
      tagOnDraft: (e) => this.setState({ tagDraft: e.target.value, tagErr: '' }), tagAdd: () => addTag('ed'),
      tagKey: (e) => { if (e.key === 'Escape') return this.setState({ tagDraft: null, tagErr: '' }); if (e.key !== 'Enter' || e.isComposing) return; if (e.preventDefault) e.preventDefault(); addTag(); },
      tagErrOn: !!st.tagErr, tagErr: st.tagErr || '',
      mTagAddOn: st.mTagDraft != null, mTagAddOff: st.mTagDraft == null, mTagDraft: st.mTagDraft || '',
      mTagOpen: () => this.setState({ mTagDraft: '', mTagErr: '' }), mTagCancel: () => this.setState({ mTagDraft: null, mTagErr: '' }),
      mTagOnDraft: (e) => this.setState({ mTagDraft: e.target.value, mTagErr: '' }), mTagAdd: () => addTag('m'),
      mTagKey: (e) => { if (e.key === 'Escape') return this.setState({ mTagDraft: null, mTagErr: '' }); if (e.key !== 'Enter' || e.isComposing) return; if (e.preventDefault) e.preventDefault(); addTag('m'); },
      mTagErrOn: !!st.mTagErr, mTagErr: st.mTagErr || '',
      edFrom: ed ? ed.from : '', edOnFrom: (e) => setEd({ from: e.target.value, err: '' }),
      edTo: ed ? ed.to : '', edOnTo: (e) => setEd({ to: e.target.value, err: '' }),
      edAllotted: ed && edMins > 0 ? tm(toMin(ed.from)) + ' – ' + tm(toMin(ed.to)) + ' · ' + dur(edMins) : '',
      edShowKinds: !!ed, edKinds: ed ? kindChips(ed.kind, null) : [],
      edTodoOn: !!ed && ed.mode === 'new' && trayFor(ed.date).length > 0,
      edTodo: !ed ? [] : trayFor(ed.date).map((t) => ({ title: t.title, sub: t.mins ? dur(t.mins) : '30 min', label: 'Add ' + t.title + ' at ' + ed.from,
        pick: () => { const s0 = toMin(ed.from); if (isNaN(s0)) return setEd({ err: 'Pick a From time first.' }); const d = durOf(t), s3 = Math.max(START, Math.min(s0, END - d)); this.setState({ dayPlan: this.state.dayPlan.filter((b) => !(b.taskId === t.id && b.date === ed.date)).concat([{ id: 'p' + t.id + '-' + Date.now(), date: ed.date, start: s3, taskId: t.id }]), ed: null, tagDraft: null, tagErr: '' }); } })),
      edErrOn: !!(ed && ed.err), edErr: ed ? ed.err : '',
      edCanDelete: !!ed && ed.mode !== 'new', edDeleteLabel: ed && ed.mode === 'task' ? 'Remove from day' : 'Delete',
      edDelete: () => { if (!ed) return; if (ed.mode === 'task') this.setState({ dayPlan: st.dayPlan.filter((b) => b.id !== ed.id), ed: null, tagDraft: null, tagErr: '' }); else this.setState({ weekItems: st.weekItems.filter((b) => b.id !== ed.id), ed: null, tagDraft: null, tagErr: '' }); },
      edClose: () => this.setState({ ed: null, tagDraft: null, tagErr: '' }), edStop: (e) => { if (e && e.stopPropagation) e.stopPropagation(); },
      edSave: () => {
        if (!ed) return;
        const title = ed.title.trim(), s0 = toMin(ed.from), e0 = toMin(ed.to);
        if (!title) return setEd({ err: 'Give it a name first.' });
        if (isNaN(s0) || isNaN(e0)) return setEd({ err: 'Pick a start and end time.' });
        if (e0 <= s0) return setEd({ err: 'End time needs to be after the start time.' });
        if (ed.mode === 'new') return this.setState({ weekItems: st.weekItems.concat([{ id: 'w' + Date.now(), date: ed.date, start: s0, dur: e0 - s0, title, kind: ed.kind }]), ed: null, tagDraft: null, tagErr: '' });
        if (ed.mode === 'item') return this.setState({ weekItems: st.weekItems.map((b) => b.id === ed.id ? { ...b, title, start: s0, dur: e0 - s0, kind: ed.kind } : b), ed: null, tagDraft: null, tagErr: '' });
        this.setState({ dayPlan: st.dayPlan.map((b) => b.id === ed.id ? { ...b, start: s0 } : b), ed: null, tagDraft: null, tagErr: '' });
        pushTaskEdit(ed.taskId, title, (e0 - s0) * 60, (ed.note || '').trim(), ed.kind && ed.kind !== 'task' ? ed.kind : null);
      }
    };
    // ---- nav
    const step = st.view === 'day' ? 1 : st.view === 'week' ? 7 : 0;
    const shiftMonth = (n) => { const d = new Date(curD.getFullYear(), curD.getMonth() + n, 1); return iso(d); };
    const wsD = parse(weekStart), weD = parse(addDays(weekStart, 6));
    const rangeLabel = st.view === 'day' ? (st.cur === today ? 'Today' : DOW[curD.getDay()] + ', ' + MON[curD.getMonth()].slice(0, 3) + ' ' + curD.getDate())
      : st.view === 'week' ? MON[wsD.getMonth()].slice(0, 3) + ' ' + wsD.getDate() + ' – ' + (wsD.getMonth() !== weD.getMonth() ? MON[weD.getMonth()].slice(0, 3) + ' ' : '') + weD.getDate()
      : MON[curD.getMonth()] + ' ' + curD.getFullYear();
    return {
      views: [['day', 'DAY'], ['week', 'WEEK'], ['month', 'MONTH']].map(([id, label]) => { const on = st.view === id; return { label, on, bg: on ? '#2B2A27' : '#FFFFFF', fg: on ? '#FAF8F3' : '#2B2A27', pick: () => this.setState({ view: id, selTask: null }) }; }),
      isDay: st.view === 'day', isWeek: st.view === 'week', isMonth: st.view === 'month',
      rangeLabel, prevLabel: 'Previous ' + st.view, nextLabel: 'Next ' + st.view,
      goPrev: () => this.setState({ cur: step ? addDays(st.cur, -step) : shiftMonth(-1), selTask: null }),
      goNext: () => this.setState({ cur: step ? addDays(st.cur, step) : shiftMonth(1), selTask: null }),
      goToday: () => this.setState({ cur: today, selTask: null }),
      openDay: () => this.setState({ view: 'day' }),
      taskChips, noTasks: !trayFor(st.cur).length,
      trayFrom: st.cur === today ? 'From your Home to-do list.' : 'Tasks added for this day.',
      noTasksText: st.cur === today ? (tasks.some((t) => !t.done && placedIds.has(t.id)) ? 'Everything on your to-do list is scheduled.' : 'Your to-do list on Home is empty.') : 'Nothing added for this day yet.',
      dtText: st.dtText || '', dtOnText: (e) => this.setState({ dtText: e.target.value, dtNote: '' }),
      // How long: whole hours (0–9) and minutes (0–60), typed in.
      dtH: st.dtH != null ? st.dtH : '0', dtM: st.dtM != null ? st.dtM : '30',
      dtOnH: (e) => this.setState({ dtH: String(e.target.value).replace(/[^0-9]/g, '').slice(0, 1), dtNote: '' }),
      dtOnM: (e) => this.setState({ dtM: String(e.target.value).replace(/[^0-9]/g, '').slice(0, 2), dtNote: '' }),
      dtErrOn: !!dtErr, dtErr, dtHBorder: dtErr && dtErr.indexOf('Hours') === 0 ? '#C8553D' : '#D8D1C2', dtMBorder: dtErr && dtErr.indexOf('Minutes') === 0 ? '#C8553D' : '#D8D1C2',
      dtPlaceholder: st.cur === today ? 'Add a task for today' : 'Add a task for ' + MON[curD.getMonth()].slice(0, 3) + ' ' + curD.getDate(),
      dtAdd: () => addDayTask(), dtKey: (e) => { if (e.key !== 'Enter' || e.isComposing) return; if (e.preventDefault) e.preventDefault(); addDayTask(); },
      dtNoteOn: !!st.dtNote, dtNote: st.dtNote || '',
      unscheduledCount: trayFor(st.cur).length + ' to schedule',
      selTaskOn: !!selTaskObj, selTaskText: selTaskObj ? 'Now tap a time on the day for “' + selTaskObj.title + '”' : '',
      cancelSel: () => this.setState({ selTask: null }),
      dayTitle: longDate(st.cur),
      daySummary: [fixed.length ? fixed.length + (fixed.length === 1 ? ' item' : ' items') : '', dayRaw.length ? dayRaw.length + (dayRaw.length === 1 ? ' task' : ' tasks') + ' · ' + dur(planned) + ' planned' : 'No tasks planned'].filter(Boolean).join(' · '),
      dayAll: monthChips(st.cur), dayAllOn: monthChips(st.cur).length > 0,
      gridH, hourLines, dayBlocks: allBlocks,
      gridCursor: selTaskObj ? 'copy' : 'default', gridBg: selTaskObj ? '#FFFDF4' : 'transparent',
      gridClick: (e) => { if (!selTaskObj) return; if (e.target.closest && e.target.closest('[data-block]')) return; const r = e.currentTarget.getBoundingClientRect(); place(selTaskObj, fromY(e.clientY, r)); },
      showNow: st.cur === today && nowMin > START && nowMin < END, nowTop: minToPx(nowMin),
      hasPreview: !!st.preview, pvTop: st.preview ? minToPx(st.preview.start) : 0, pvH: st.preview ? Math.max(22, minToPx(st.preview.start + st.preview.dur) - minToPx(st.preview.start)) : 0,
      pvText: st.preview ? 'Drop · ' + tm(st.preview.start) + '–' + tm(st.preview.start + st.preview.dur) : '',
      ghostOn: !!st.ghost, ghostX: st.ghost ? st.ghost.x : 0, ghostY: st.ghost ? st.ghost.y : 0, ghostTitle: st.ghost ? st.ghost.title : '',
      weekDays, weekAllOn: weekDays.some((w) => w.allDay.length > 0), weekHours, weekH, weekHour: WHOUR, weekHourM1: WHOUR - 1,
      wPanelTitle: longDate(st.cur), wList, wEmpty: !wList.length, wTodo, wTodoOn: wTodo.length > 0,
      wTitle: st.wTitle, wOnTitle: (e) => this.setState({ wTitle: e.target.value, wErr: '' }),
      wStart: st.wStart, onWStart: (e) => this.setState({ wStart: e.target.value, wErr: '' }),
      wEnd: st.wEnd, onWEnd: (e) => this.setState({ wEnd: e.target.value, wErr: '' }),
      wKinds: kindChips(st.wKind, 'wKind'), wErrOn: !!st.wErr, wErr: st.wErr,
      wAdd: () => {
        const title = st.wTitle.trim(), s = toMin(st.wStart), e = toMin(st.wEnd);
        if (!title) return this.setState({ wErr: 'Add a title first.' });
        if (isNaN(s) || isNaN(e)) return this.setState({ wErr: 'Pick a start and end time.' });
        if (e <= s) return this.setState({ wErr: 'End time needs to be after the start time.' });
        this.setState({ weekItems: st.weekItems.concat([{ id: 'w' + Date.now(), date: st.cur, start: s, dur: e - s, title, kind: st.wKind }]), wTitle: '', wErr: '' });
      },
      noteDays: [0, 1, 2, 3, 4, 5, 6].map((i) => { const ds = addDays(weekStart, i), d = parse(ds), sel = ds === st.cur, has = !!((st.notes || {})[ds] || '').trim(); return { dow: DOW[i].toUpperCase(), num: d.getDate(), sel, has, label: DOWL[i] + ' ' + MON[d.getMonth()] + ' ' + d.getDate() + (has ? ', has notes' : ''), bg: sel ? '#2B2A27' : '#FFFFFF', fg: sel ? '#FAF8F3' : '#2B2A27', border: sel ? '#2B2A27' : '#D8D1C2', pick: () => this.setState({ cur: ds }) }; }),
      noteDayLabel: longDate(st.cur), noteAria: 'Notes for ' + longDate(st.cur),
      noteText: (st.notes || {})[st.cur] || '',
      onNote: (e) => this.setState({ notes: { ...(this.state.notes || {}), [this.state.cur]: e.target.value } }),
      ...edVals,
      monthDow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((t) => ({ t })), monthCells,
      mPanelTitle: longDate(st.cur), mList, mEmpty: !mList.length,
      mTitle: st.mTitle, mOnTitle: (e) => this.setState({ mTitle: e.target.value, mErr: '' }),
      mKinds: kindChips(st.mKind, 'mKind').map((k) => ({ ...k, rowBg: k.on ? '#FBF3D9' : 'transparent', pick: () => { k.pick(); closeMTag(); } })),
      mTagMenu: !!st.mTagMenu, mTagChev: st.mTagMenu ? 0 : 180,
      mKindLabel: kindLabel(st.mKind), mKindDot: (pal[st.mKind] || pal.other)[1], mKindAria: 'Tag: ' + kindLabel(st.mKind) + '. Change tag',
      mTagToggle: () => { if (this.state.mTagMenu) return closeMTag(); this.setState({ mTagMenu: true }); setTimeout(() => {
        this._mTagAway = (ev) => { if (ev.target && ev.target.closest && ev.target.closest('.mtagwrap')) return; closeMTag(); };
        document.addEventListener('click', this._mTagAway, true); }, 0); }, mErrOn: !!st.mErr, mErr: st.mErr,
      mAdd: () => {
        const title = st.mTitle.trim();
        if (!title) return this.setState({ mErr: 'Add a title first.' });
        this.setState({ monthItems: st.monthItems.concat([{ id: 'm' + Date.now(), date: st.cur, title, kind: st.mKind }]), mTitle: '', mErr: '' });
      }
    };
  }
}

