// GENERATED from MainMobile.dc.html by tools/board2react.py. Don't edit by hand.
// @ts-nocheck
import { DCLogic } from "../runtime/dc";

export default class MainMobileLogic extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { myPosts: [], myDoodles: [], myCount: 0, boardPop: null, bpText: '', bpStrokes: [], bpCur: null, bpFile: '', quickNote: '', focusToday: 4840, starToast: false, starLog: (() => { const n = new Date(), y = n.getFullYear(), m = n.getMonth(), d = n.getDate(), o = {}; [[2, 1], [3, 2], [5, 1], [8, 1], [9, 3]].forEach(([back, k]) => { if (d - back >= 1) o[y + '-' + m + '-' + (d - back)] = k; }); return o; })(), selected: null, deleted: {}, undoId: null, undoKind: '', pos: {}, z: {}, zTop: 10, dragging: null, saved: {}, tmode: 'countdown', cdLength: 1500, pomoFocus: 1500, pomoShort: 300, pomoLong: 900, pomoRounds: 4, autoBreak: false, autoFocus: false, pomoEditOpen: false, pd: null, phase: 'focus', pomoCount: 0, pomoMsg: '', length: 1500, left: 1500, elapsed: 0, running: false, active: null, sound: true, timeUp: false, upTask: null, editing: false, customMin: '', draft: '', newPlan: null, planCustomOpen: false, planCustom: '', tasks: [ { id: 1, text: 'Read chapter 4', done: true, logged: 2710, plan: 2700, counted: true }, { id: 2, text: 'Problem set 3', done: false, logged: 1500, plan: 3000, pomoLogged: 1500, pomos: 1 }, { id: 3, text: 'Essay outline', done: false, logged: 630, plan: 1800 }, { id: 4, text: 'Email study group', done: false, logged: 0 }, { id: 5, text: 'Flashcards, ch. 5', done: false, logged: 0, plan: 900 }, { id: 6, text: 'Review lecture 7 slides', done: false, logged: 0, plan: 1500 }, { id: 7, text: 'Lab report intro', done: false, logged: 0, plan: 2700 } ], incoming: [{ id: 201, name: 'Alex R.', username: 'alexr' }, { id: 202, name: 'Nina T.', username: 'nina.t' }], outgoing: [], removedFriends: [], addedFriends: [], fAdd: false, fQuery: '', fConfirm: null, fToast: '', friendsModal: false, ep: null, profName: '[Name]', profUser: '[username]', myColor: ['#FBF3D9', '#F2F5EE', '#F3EEF7', '#FBE9E2', '#EEF2F7', '#F5F1E6', '#EAF3F2', '#F8ECF2'][Math.floor(Math.random() * 8)], kept: {}, settingsOpen: false, allowPosts: true, friendsOpen: false, composeFor: null, composeKind: null, draftMsg: '', miniStrokes: [], miniCols: [], miniCur: null, photoPicked: false, sentTo: {} };
  }
  playStarFx() {
    clearTimeout(this.fxStart); clearTimeout(this.fxTimer); clearTimeout(this.popTimer);
    this.setState({ starFx: false, starPop: false });
    this.fxStart = setTimeout(() => this.setState({ starFx: true }), 30);
    this.fxTimer = setTimeout(() => this.setState({ starFx: false, starPop: true }), 4530);
    this.popTimer = setTimeout(() => this.setState({ starPop: false }), 5530);
  }
  componentDidMount() {
    this._unlock = () => this.unlockAudio();
    document.addEventListener('pointerdown', this._unlock, true); document.addEventListener('keydown', this._unlock, true);
    this.iv = setInterval(() => {
      const s = this.state;
      if (!s.running) return;
      if (s.tmode !== 'pomodoro' || s.phase === 'focus') {
        const before = s.focusToday || 0, after = before + 1;
        if (Math.floor(after / 14400) > Math.floor(before / 14400)) { clearTimeout(this.starTimer); this.starTimer = setTimeout(() => this.setState({ starToast: false }), 5000); this.playStarFx(); this.setState({ focusToday: after, starToast: true }); }
        else this.setState({ focusToday: after });
      }
      const tasks = s.active == null ? s.tasks : s.tasks.map((t) => t.id === s.active ? { ...t, logged: t.logged + 1 } : t);
      if (s.tmode === 'pomodoro') {
        const logTasks = s.phase === 'focus' && s.active != null ? s.tasks.map((t) => t.id === s.active ? { ...t, logged: t.logged + 1, pomoLogged: (t.pomoLogged || 0) + 1 } : t) : s.tasks;
        const left = s.left - 1;
        if (left > 0) { this.setState({ left, tasks: logTasks }); return; }
        let count = s.pomoCount, next, msg;
        if (s.phase === 'focus') { count += 1; next = count % s.pomoRounds === 0 ? 'long' : 'short'; msg = next === 'long' ? s.pomoRounds + ' sessions done. Take a long break.' : 'focus session done. Take a short break.'; }
        else { next = 'focus'; msg = 'break’s over. Ready for the next focus session?'; }
        const len = next === 'focus' ? s.pomoFocus : next === 'short' ? s.pomoShort : s.pomoLong;
        const doneTasks = s.phase === 'focus' && s.active != null ? logTasks.map((t) => t.id === s.active ? { ...t, pomos: (t.pomos || 0) + 1 } : t) : logTasks;
        const auto = next === 'focus' ? s.autoFocus : s.autoBreak;
        this.setState({ left: len, length: len, phase: next, pomoCount: count, running: auto, timeUp: true, pomoMsg: auto ? msg.replace('Take a', 'Starting your').replace('Ready for the next focus session?', 'Next focus session starting.') : msg, tasks: doneTasks });
        if (s.sound) this.chime();
        return;
      }
      if (s.tmode === 'countdown') {
        const left = s.left - 1;
        if (left <= 0) {
          this.setState({ left: 0, running: false, timeUp: true, upTask: s.active, tasks });
          if (s.sound) this.chime();
        } else {
          this.setState({ left, tasks });
        }
      } else {
        this.setState({ elapsed: s.elapsed + 1, tasks });
      }
    }, 1000);
  }
  componentWillUnmount() { document.removeEventListener('pointerdown', this._unlock, true); document.removeEventListener('keydown', this._unlock, true); clearInterval(this.iv); clearTimeout(this.undoTimer); clearTimeout(this.starTimer); }
  removeItem(id, kind) {
    clearTimeout(this.undoTimer);
    this.setState({ deleted: { ...(this.state.deleted || {}), [id]: true }, undoId: id, undoKind: kind, selected: null });
    this.undoTimer = setTimeout(() => this.setState({ undoId: null }), 5000);
  }
  unlockAudio() {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      if (!this._ac) this._ac = new C();
      if (this._ac.state === 'suspended') this._ac.resume();
      if (!this._acPrimed) { const o = this._ac.createOscillator(), g = this._ac.createGain(); g.gain.value = 0.0001; o.connect(g); g.connect(this._ac.destination); o.start(); o.stop(this._ac.currentTime + 0.03); this._acPrimed = true; }
    } catch (e) {}
  }
  chime() {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!this._ac && C) this._ac = new C();
      const ctx = this._ac;
      if (ctx.state === 'suspended') ctx.resume();
      [660, 880, 990].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.28;
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.start(t); o.stop(t + 0.55);
      });
    } catch (e) {}
  }
  renderVals() {
    const v = this._renderVals();
    const lampN = (v.friends || []).filter((f) => f.act === 'running' || f.act === 'paused' || f.act === 'online').length;
    return { ...v, lampGlow: lampN ? 1 : 0, lampInk: lampN ? '#2B2A27' : '#A39C8E', lampOff: lampN === 0, lampTip: !this.state.friendsOpen, lampOn: lampN > 0, lampHead: lampN + ' online now', lampMoreOn: false, lampMore: '', lampList: [['[Friend 1]', 'Focusing', '#E8A838'], ['[Friend 2]', 'Online now', '#8FB07E'], ['[Friend 3]', 'Timer paused', '#F2D59A']].map(([name, when, dot]) => ({ name, when, dot, whenFg: dot === '#6B655A' ? '#A39C8E' : '#E3DDD0' })) };
  }

  _renderVals() {
    const roster0 = this.ext.roster0();
    const directory = [
      { id: 101, name: 'Maya K.', username: 'maya.k' }, { id: 102, name: 'Jordan P.', username: 'jordan_p' },
      { id: 103, name: 'Sam Lee', username: 'sam.lee' }, { id: 104, name: 'Priya S.', username: 'priya' },
      { id: 105, name: 'Marcus D.', username: 'marcusd' }, { id: 1, name: '[Friend 1]', username: 'friend1' }
    ];
    const allFriends = roster0.filter((f) => !(this.state.removedFriends || []).includes(f.id)).concat(this.state.addedFriends || []);
    // Lamp shows only friends with a timer running or paused, or active in the last 30 minutes.
    const fhm = (m) => m >= 60 ? Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm' : m + 'm';
    const roster = allFriends.filter((f) => f.act === 'running' || f.act === 'paused' || f.act === 'online' || (f.act === 'recent' && f.ago <= 30))
      .map((f) => ({ ...f, online: f.act !== 'recent',
        doing: f.act === 'running' ? 'Focusing · ' + fhm(f.mins) + ' in' : f.act === 'paused' ? 'Paused · ' + fhm(f.mins) + ' in' : f.act === 'online' ? 'Online now' : 'Active ' + f.ago + ' min ago',
        note: f.act === 'running' ? 'Focused on work · timer going' : f.act === 'paused' ? 'Timer paused' : f.act === 'online' ? 'Not focusing · no timer going' : 'Not online right now',
        noteFg: f.act === 'running' ? '#9A6A12' : '#8A8478' }));
    const tints = ['#FBF3D9', '#F2F5EE', '#F3EEF7', '#FBE9E2', '#EEF2F7', '#F5F1E6'];
    const st = this.state;
    const acceptReq = (p) => {
      clearTimeout(this.fToastT); this.fToastT = setTimeout(() => this.setState({ fToast: '' }), 3000);
      this.setState({ incoming: this.state.incoming.filter((x) => x.id !== p.id), outgoing: this.state.outgoing.filter((x) => x.id !== p.id),
        addedFriends: (this.state.addedFriends || []).concat([{ id: p.id, name: p.name, act: 'away', ago: 9999, initial: p.name.charAt(0).toUpperCase() }]),
        removedFriends: (this.state.removedFriends || []).filter((x) => x !== p.id), fToast: '✓ You and ' + p.name + ' are now friends' });
    };
    const fQ = (st.fQuery || '').trim().toLowerCase().replace(/^@/, '');
    const fMatches = fQ.length < 2 ? [] : this.ext.search(fQ);
    const friends = roster.map((f, i) => {
      const composing = st.composeFor === f.id;
      return {
        ...f,
        initial: f.initial,
        tint: f.tint || tints[i % tints.length],
        status: f.doing + (f.closed ? ' · not taking posts' : ''),
        dot: f.act === 'running' ? '#E8A838' : f.act === 'paused' ? '#F2D59A' : f.act === 'online' ? '#8FB07E' : '#C9C2B4',
        glow: f.act === 'running' ? '0 0 6px 2px rgba(232, 168, 56, 0.55)' : 'none',
        nameColor: f.online ? '#2B2A27' : '#6B655A',
        rowBg: composing ? '#FFFBF0' : 'transparent',
        composing,
        sent: !!st.sentTo[f.id] && !composing,
        sentKind: st.sentTo[f.id] || '',
        inputId: 'msg-' + f.id,
        composeLabel: f.closed ? f.name + ' isn’t taking whiteboard posts' : 'Post on ' + f.name + '’s whiteboard',
        btnBg: composing ? '#2B2A27' : '#FFFFFF',
        btnFg: composing ? '#FAF8F3' : '#2B2A27',
        btnBorder: composing ? '#2B2A27' : '#D8D1C2',
        btnOpacity: f.closed ? 0.4 : 1,
        btnCursor: f.closed ? 'not-allowed' : 'pointer',
        closed: !!f.closed,
        compose: () => f.closed ? null : this.setState({ composeFor: f.id, composeKind: null, draftMsg: '', miniStrokes: [], miniCols: [], miniCur: null, photoPicked: false, photoCaption: '' })
      };
    });
    const play = 'M7 4l13 8-13 8z', pause = 'M6 4h4v16H6zM14 4h4v16h-4z';
    const fmtClock = (sec) => { const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), x = sec % 60; const mm = String(m).padStart(2, '0'), ss = String(x).padStart(2, '0'); return h ? h + ':' + mm + ':' + ss : mm + ':' + ss; };
    const fmtDur = (sec) => { if (!sec) return 'not started'; const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60); if (h) return h + 'h ' + String(m).padStart(2, '0') + 'm'; if (m) return m + ' min'; return sec + ' sec'; };
    const isPomo = st.tmode === 'pomodoro';
    const cd = st.tmode === 'countdown' || isPomo;
    const phaseLen = (ph) => ph === 'focus' ? st.pomoFocus : ph === 'short' ? st.pomoShort : st.pomoLong;
    const activeTask = st.tasks.find((t) => t.id === st.active);
    const resetT = isPomo ? { running: false, left: phaseLen(st.phase), length: phaseLen(st.phase), timeUp: false } : { running: false, left: st.length, elapsed: 0, timeUp: false };
    const sKey = (id, mode) => (id == null ? 'none' : id) + ':' + mode;
    const snapNow = { left: st.left, length: st.length, elapsed: st.elapsed, phase: st.phase, pomoCount: st.pomoCount };
    const savedNow = () => ({ ...(st.saved || {}), [sKey(st.active, st.tmode)]: snapNow, ['last:' + (st.active == null ? 'none' : st.active)]: st.tmode });
    const getSaved = (id, mode) => (st.saved || {})[sKey(id, mode)];
    const lastMode = (id) => (st.saved || {})['last:' + (id == null ? 'none' : id)];
    const trueCd = (t, r) => {
      if (!t || !t.plan) return null;
      const rem = t.plan - t.logged;
      if (rem <= 0) return null;
      return { left: rem, length: r && r.length >= rem ? r.length : rem };
    };
    const freshFor = (mode, t) => {
      if (mode === 'pomodoro') return { phase: 'focus', pomoCount: 0, left: st.pomoFocus, length: st.pomoFocus };
      if (mode === 'stopwatch') return { elapsed: 0 };
      const rem = t && t.plan ? t.plan - t.logged : 0;
      if (rem > 0) return { left: rem, length: rem };
      return { left: st.cdLength || 1500, length: st.cdLength || 1500 };
    };
    const tmodes = [['countdown', 'COUNTDOWN'], ['pomodoro', 'POMODORO'], ['stopwatch', 'STOPWATCH']].map(([id, label]) => {
      const on = st.tmode === id;
      return { label, on, bg: on ? '#2B2A27' : '#FFFFFF', fg: on ? '#FAF8F3' : '#2B2A27', pick: () => { if (on) return; const r = getSaved(st.active, id); const at = st.tasks.find((x) => x.id === st.active); const tc = id === 'countdown' ? trueCd(at, r) : null; this.setState({ tmode: id, running: false, timeUp: false, editing: false, ...(r || freshFor(id, at)), ...(tc || {}), saved: savedNow() }); } };
    });
    const presetMins = [25, 50, 15];
    const isPreset = presetMins.includes(st.length / 60) || (activeTask && activeTask.plan);
    const presets = presetMins.map((m) => ({ label: m + ' min', on: st.length === m * 60 && !st.editing, bg: st.length === m * 60 && !st.editing ? '#FBF3D9' : '#FFFFFF', border: st.length === m * 60 && !st.editing ? '#2B2A27' : '#D8D1C2', pick: () => this.setState({ length: m * 60, left: m * 60, cdLength: m * 60, running: false, timeUp: false, editing: false }) }))
      .concat([{ label: (!isPreset ? (st.length / 60) + ' min · ' : '') + 'Custom', on: st.editing || !isPreset, bg: st.editing || !isPreset ? '#FBF3D9' : '#FFFFFF', border: st.editing || !isPreset ? '#2B2A27' : '#D8D1C2', pick: () => this.setState({ editing: true, customMin: '' }) }]);
    const lengthMin = Math.round(st.length / 60);
    const pct = cd ? Math.round((1 - st.left / st.length) * 1000) / 10 : Math.round(((st.elapsed % 3600) / 3600) * 1000) / 10;
    const steps = cd ? 5 : 6;
    const rulerLabels = Array.from({ length: steps + 1 }, (_, i) => ({ t: cd ? (Math.round(lengthMin * i / steps)) + (i === steps ? ' min' : '') : (i * 10) + (i === steps ? ' min' : '') }));
    const timerFor = (t) => {
      const remaining = t.plan ? t.plan - t.logged : 0;
      if (isPomo) return {};
      if (t.plan && remaining > 0) return { tmode: 'countdown', length: remaining, left: remaining, elapsed: 0, editing: false };
      if (t.plan) return { tmode: 'stopwatch', elapsed: 0, editing: false };
      return {};
    };
    const restoreFor = (t) => {
      const lm = lastMode(t.id);
      if (lm) { const r = getSaved(t.id, lm); if (r) return { tmode: lm, ...r, ...((lm === 'countdown' && trueCd(t, r)) || {}) }; }
      if (isPomo) return {};
      if (t.plan) return timerFor(t);
      return { ...freshFor(st.tmode, t) };
    };
    const selectTask = (t) => { if (st.active === t.id) return; this.setState({ saved: savedNow(), active: t.id, running: false, timeUp: false, editing: false, ...restoreFor(t) }); };
    const startTask = (t) => {
      if (st.active !== t.id) { const r = restoreFor(t); this.setState({ saved: savedNow(), active: t.id, running: true, timeUp: false, editing: false, ...r, ...(r.tmode === 'countdown' || (!r.tmode && cd) ? ((r.left !== undefined ? r.left : st.left) <= 0 ? { left: r.length || st.length } : {}) : {}) }); return; }
      const remaining = t.plan ? t.plan - t.logged : 0;
      if (isPomo) this.setState({ active: t.id, running: true, timeUp: false, left: st.left <= 0 ? phaseLen(st.phase) : st.left });
      else if (t.plan && remaining > 0) this.setState({ active: t.id, running: true, timeUp: false, tmode: 'countdown', length: remaining, left: remaining, elapsed: 0, editing: false });
      else if (t.plan) this.setState({ active: t.id, running: true, timeUp: false, tmode: 'stopwatch', elapsed: 0, editing: false });
      else this.setState({ active: t.id, running: true, timeUp: false, elapsed: cd ? st.elapsed : 0, left: cd && st.left <= 0 ? st.length : st.left });
    };
    const mins = (sec) => Math.round(sec / 60);
    // Crossed-off tasks sit at the bottom.
    const tasks = st.tasks.filter((t) => !t.done).concat(st.tasks.filter((t) => t.done)).map((t) => {
      const isActive = st.active === t.id, isRunning = isActive && st.running;
      return {
        ...t,
        deco: t.done ? 'line-through' : 'none', color: t.done ? '#8A8478' : '#2B2A27',
        sub: (t.plan ? Math.floor(t.logged / 60) + ' of ' + mins(t.plan) + ' min' + (t.logged >= t.plan ? ' · planned time done' : ' · ' + Math.ceil((t.plan - t.logged) / 60) + ' left') : (t.logged ? fmtDur(t.logged) + ' logged' : 'Not started') + ' · no planned time') + (isRunning ? ' · timing' : (isActive ? ((cd ? st.left < st.length : st.elapsed > 0) ? ' · paused' : ' · selected') : '')),
        hasPlan: !!t.plan,
        planPct: t.plan ? Math.min(100, Math.round(t.logged / t.plan * 100)) : 0,
        pomoPct: t.plan ? Math.min(100, Math.round((t.pomoLogged || 0) / t.plan * 100)) : 0,
        regPct: t.plan ? Math.max(0, Math.min(100, Math.round(t.logged / t.plan * 100)) - Math.min(100, Math.round((t.pomoLogged || 0) / t.plan * 100))) : 0,
        hasPomo: (t.pomos || 0) > 0,
        pomos: t.pomos || 0,
        pomoTitle: (t.pomos || 0) + ' Pomodoro session' + ((t.pomos || 0) === 1 ? '' : 's') + ' · ' + Math.floor((t.pomoLogged || 0) / 60) + ' min in Pomodoro',
        planColor: t.plan && t.logged >= t.plan ? '#6B8A5E' : '#B5562E',
        rowBg: isActive ? 'rgba(232, 168, 56, 0.14)' : 'transparent',
        btnBg: isRunning ? '#2B2A27' : (isActive ? '#FBF3D9' : 'transparent'),
        btnIcon: isRunning ? '#FAF8F3' : '#2B2A27',
        icon: isRunning ? pause : play,
        playLabel: (isRunning ? 'Pause ' : 'Start ') + t.text,
        stopLabel: 'Stop timing ' + t.text,
        stopOff: !isActive, stopBorder: isActive ? '#2B2A27' : '#D8D1C2', stopIcon: isActive ? '#2B2A27' : '#C9C2B4', stopCursor: isActive ? 'pointer' : 'default',
        isActive,
        select: () => selectTask(t),
        selectLabel: 'Select ' + t.text + (t.plan ? ' — sets the timer to its time remaining' : ''),
        toggle: () => this.setState({ tasks: st.tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x) }),
        removeLabel: 'Delete ' + t.text,
        remove: () => { const patch = { tasks: this.state.tasks.filter((x) => x.id !== t.id) }; if (this.state.active === t.id) Object.assign(patch, { active: null, ...resetT }); this.setState(patch); },
        play: () => { if (isRunning) this.setState({ running: false }); else if (isActive) this.setState({ running: true, timeUp: false, left: cd && st.left <= 0 ? st.length : st.left }); else startTask(t); },
        stop: () => { if (isActive) { const sv = { ...(st.saved || {}) }; delete sv[sKey(st.active, st.tmode)]; this.setState({ active: null, ...resetT, saved: sv }); } }
      };
    });
    const upTask = st.tasks.find((t) => t.id === st.upTask);
    const activeStarted = cd ? st.left < st.length : st.elapsed > 0;
    const basePosts = this.ext.posts();
    const left = [18, 6, 22, 2, 11];
    const dragHandlers = (id, label) => {
      const pos = (this.state.pos || {})[id];
      return {
        down: (e) => {
          if (e.target.closest && e.target.closest('button')) return;
          const el = e.currentTarget, board = el.parentElement;
          const r = board.getBoundingClientRect();
          const scale = r.width / board.offsetWidth || 1;
          if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
          const top = (this.state.zTop || 10) + 1;
          this.drag = { id, moved: false, sx: e.clientX, sy: e.clientY, ox: el.offsetLeft, oy: el.offsetTop, scale, maxX: board.clientWidth - el.offsetWidth, maxY: board.clientHeight - el.offsetHeight };
          this.setState({ zTop: top, z: { ...(this.state.z || {}), [id]: top }, dragging: id });
        },
        move: (e) => {
          const d = this.drag; if (!d || d.id !== id) return;
          if (!d.moved && Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) < 4) return;
          d.moved = true;
          const x = Math.max(0, Math.min(d.maxX, Math.round(d.ox + (e.clientX - d.sx) / d.scale)));
          const y = Math.max(0, Math.min(d.maxY, Math.round(d.oy + (e.clientY - d.sy) / d.scale)));
          this.setState({ pos: { ...(this.state.pos || {}), [id]: [x, y] } });
        },
        up: () => { const d = this.drag; if (d && d.id === id) { this.drag = null; this.setState({ dragging: null, ...(d.moved ? { selected: id } : { selected: this.state.selected === id ? null : id }) }); } },
        key: (e) => {
          if ((e.key === 'Delete' || e.key === 'Backspace') && this.state.selected === id) { e.preventDefault(); this.removeItem(id, label); return; }
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.setState({ selected: this.state.selected === id ? null : id }); return; }
          if (e.key === 'Escape') { this.setState({ selected: null }); return; }
          const k = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
          if (!k) return;
          e.preventDefault();
          const el = e.currentTarget, board = el.parentElement;
          const x = Math.max(0, Math.min(board.clientWidth - el.offsetWidth, el.offsetLeft + k[0]));
          const y = Math.max(0, Math.min(board.clientHeight - el.offsetHeight, el.offsetTop + k[1]));
          this.setState({ pos: { ...(this.state.pos || {}), [id]: [x, y] } });
        }
      };
    };
    const initP = [[2, 8], [150, 2], [2, 250], [150, 262], [70, 420]];
    const initD = [[10, 500, 150, 52], [220, 500, 56, 56], [180, 205, 80, 40]];
    const doodleShapes = this.ext.doodles();
    const allShapes = doodleShapes.concat((st.myDoodles || []).map((m) => ({ label: 'Your drawing', vb: '0 0 300 170', paths: m.paths || [{ d: m.d, color: '#2B2A27' }] })));
    // Friends' drawings go after 24 h, like notes, unless kept.
    const doodleKeep = (g, id) => {
      const canKeep = g.canKeep != null ? !!g.canKeep : !!g.by;
      const kept = (st.kept || {})[id] !== undefined ? !!(st.kept || {})[id] : !!g.kept;
      const h = g.hoursLeft != null ? g.hoursLeft : 18;
      return { canKeep, kept, timeText: kept ? 'Kept' : h + 'h left', timeColor: kept ? '#3E6B33' : (h <= 3 ? '#9A3B1C' : '#6B655A'),
        keepText: kept ? 'KEPT' : 'KEEP', keepLabel: kept ? 'Stop keeping this drawing (it will disappear after 24 hours)' : 'Keep this drawing on your whiteboard',
        keepBg: kept ? '#2B2A27' : 'transparent', keepFg: kept ? '#FAF8F3' : '#2B2A27', pinFill: kept ? '#FAF8F3' : 'none',
        toggleKeep: () => this.setState({ kept: { ...(this.state.kept || {}), [id]: !kept } }) };
    };
    const doodles = allShapes.map((g, i) => ({ g, i })).filter(({ g, i }) => !(st.deleted || {})[g.bid ? 'b:' + g.bid : 'd' + i]).map(({ g, i }) => {
      const id = g.bid ? 'b:' + g.bid : 'd' + i, dim = g.bid ? [g.x, g.y, g.w, g.h] : (initD[i] || [16, 16, 160, 92]), p = (st.pos || {})[id] || [dim[0], dim[1]];
      return { ...g, paths: g.paths || [{ d: g.d, color: g.color }], by: g.by || '', byOn: !!g.by, ...dragHandlers(id, 'Drawing'), id, selected: st.selected === id, outline: st.selected === id ? '2px dashed #2B2A27' : 'none', remove: () => this.removeItem(id, 'Drawing'), removeLabel: 'Delete this drawing', label: g.label + ' — drag or use arrow keys to move. Press Enter to select, Delete to remove.', x: p[0], y: p[1], w: dim[2], h: dim[3], z: (st.z || {})[id] || 1, cursor: st.dragging === id ? 'grabbing' : 'grab', bg: st.dragging === id ? 'rgba(232, 168, 56, 0.10)' : 'transparent', ...doodleKeep(g, id) };
    });
    const allPosts = basePosts.map((b, bi) => (b.mine ? b : { ...b, paper: '#FAF4E2', tape: ['#F08C7E', '#6FC2A8', '#F5C04A', '#8FA8E8'][bi % 4] })).concat((st.myPosts || []).map((m) => ({ text: m.text, img: !!m.img, paper: m.color || '#D6E8F7', tape: m.tape || '#E8B8A6', rot: m.rot != null ? m.rot : -1.5, mine: true })));
    const posts = allPosts.map((n, i) => {
      const PID = n.bid ? 'b:' + n.bid : 'p' + i;
      const kept = n.bid ? ((st.kept || {})[PID] !== undefined ? !!(st.kept || {})[PID] : !!n.kept) : !!(st.kept || {})[i];
      const h = n.hoursLeft != null ? n.hoursLeft : left[i % left.length];
      return {
        ...n, kept,
        ...dragHandlers(PID, n.img ? 'Picture' : 'Note'),
        pid: PID,
        selected: st.selected === PID,
        outline: st.selected === PID ? '2px dashed #2B2A27' : 'none',
        remove: () => this.removeItem(PID, n.img ? 'Picture' : 'Note'),
        removeLabel: 'Delete this ' + (n.img ? 'picture' : 'note'),
        x: ((st.pos || {})[PID] || (n.bid ? [n.x, n.y] : initP[i % initP.length]) || [16, 16])[0],
        y: ((st.pos || {})[PID] || (n.bid ? [n.x, n.y] : initP[i % initP.length]) || [16, 16])[1],
        z: (st.z || {})[PID] || n.z || 2,
        cursor: st.dragging === PID ? 'grabbing' : 'grab',
        shadow: st.dragging === PID ? '0 10px 22px rgba(43, 42, 39, 0.22)' : '0 1px 2px rgba(43, 42, 39, 0.08)',
        author: n.mine ? 'Me' : (n.author || '[Friend]'), noImg: !n.imgUrl,
        canKeep: !n.mine,
        mine: !!n.mine, foldBg: n.foldBg || 'transparent',
        dragLabel: 'Note: ' + n.text + ' — drag or use arrow keys to move. Press Enter to select, Delete to remove.',
        timeText: n.mine ? (n.img ? 'Your picture' : 'Your note') : (kept ? 'Kept' : h + 'h left'),
        timeColor: n.mine ? '#6B655A' : (kept ? '#3E6B33' : (h <= 3 ? '#9A3B1C' : '#6B655A')),
        keepText: kept ? 'KEPT' : 'KEEP',
        keepLabel: kept ? 'Stop keeping this post (it will disappear after 24 hours)' : 'Keep this post on your whiteboard',
        keepBg: kept ? '#2B2A27' : 'transparent',
        keepFg: kept ? '#FAF8F3' : '#2B2A27',
        keepBorder: '#2B2A27',
        pinFill: kept ? '#FAF8F3' : 'none',
        toggleKeep: () => this.setState({ kept: { ...(this.state.kept || {}), [n.bid ? PID : i]: !kept } })
      };
    });
    const visiblePosts = posts.filter((n) => !(st.deleted || {})[n.pid]);
    const bpPt = (e) => { const r = e.currentTarget.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * 300), Math.round((e.clientY - r.top) / r.height * 170)]; };
    const PENS = [['#2B2A27', 'Ink'], ['#B5562E', 'Rust'], ['#3E6FB0', 'Blue'], ['#4F7D3F', 'Green'], ['#D9952A', 'Gold'], ['#8A4F9E', 'Plum']];
    const penChips = (cur, key) => PENS.map(([hex, nm]) => { const on = (cur || '#2B2A27') === hex; return { hex, on, label: nm + ' pen', ring: on ? '#2B2A27' : '#E3DDD0', pick: () => this.setState({ [key]: hex }) }; });
    const withCols = (strokes, cols, cur, pen) => (strokes || []).map((m, k) => ({ m, c: (cols || [])[k] || '#2B2A27' })).concat(cur ? [{ m: cur, c: pen || '#2B2A27' }] : []).filter((x) => x.m.length > 1);
    const bpAll = withCols(st.bpStrokes, st.bpCols, st.bpCur, st.bpPen);
    const bpKind = st.boardPop;
    const bpReady = bpKind === 'note' ? !!(st.bpText || '').trim() : bpKind === 'draw' ? (st.bpStrokes || []).length > 0 : bpKind === 'photo' ? !!st.bpFile : false;
    // New items go into the first empty spot on the board (left to right, top to bottom), not on top of others.
    const freeSpot = (w, h) => {
      try {
        const board = Array.prototype.slice.call(document.querySelectorAll('[aria-label="Board"]')).find((e) => e.offsetParent);
        if (!board) return null;
        // Stay inside the area both the computer (1000×720) and phone (640×840) boards show, so items never pile up on the other device.
        const BW = Math.min(board.offsetWidth, 640), BH = Math.min(board.offsetHeight, 720), gap = 12;
        const taken = Array.prototype.slice.call(board.children).filter((c) => c.offsetWidth && getComputedStyle(c).position === 'absolute')
          .map((c) => [c.offsetLeft, c.offsetTop, c.offsetWidth, c.offsetHeight]);
        const free = (x, y) => !taken.some(([tx, ty, tw, th]) => x < tx + tw + gap && x + w + gap > tx && y < ty + th + gap && y + h + gap > ty);
        // Prefer a spot inside the part of the board you can see, so nothing has to scroll.
        const view = board.parentElement, vx = view ? view.scrollLeft : 0, vy = view ? view.scrollTop : 0;
        const vw = view ? view.clientWidth : BW, vh = view ? view.clientHeight : BH;
        for (let y = Math.max(16, Math.ceil(vy / 16) * 16); y + h <= Math.min(BH - 8, vy + vh - 8); y += 16)
          for (let x = Math.max(16, Math.ceil(vx / 16) * 16); x + w <= Math.min(BW - 8, vx + vw - 8); x += 16) if (free(x, y)) return [x, y];
        for (let y = 16; y + h <= BH - 8; y += 16) for (let x = 16; x + w <= BW - 8; x += 16) if (free(x, y)) return [x, y];
      } catch (e) {}
      return null;
    };
    const placeNew = (id, extra) => {
      const n = (st.myCount || 0);
      const top = (st.zTop || 10) + 1;
      const last = (extra.myPosts || []).slice(-1)[0];
      const size = id.charAt(0) === 'd' ? [170, 96] : last && last.img ? [170, 200] : [170, 130];
      const at = freeSpot(size[0], size[1]) || [16 + (n % 5) * 18, 16 + (n % 5) * 18];
      if (extra.myPosts && extra.myPosts.length) extra = { ...extra, myPosts: extra.myPosts.slice(0, -1).concat([{ ...extra.myPosts[extra.myPosts.length - 1], at }]) };
      if (extra.myDoodles && extra.myDoodles.length) extra = { ...extra, myDoodles: extra.myDoodles.slice(0, -1).concat([{ ...extra.myDoodles[extra.myDoodles.length - 1], at }]) };
      this.setState({ ...extra, myCount: n + 1, zTop: top, z: { ...(st.z || {}), [id]: top }, pos: { ...(st.pos || {}), [id]: at }, selected: id });
    };
    const target = allFriends.find((f) => f.id === st.composeFor);
    const k = st.composeKind;
    const pt = (e) => { const r = e.currentTarget.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * 300), Math.round((e.clientY - r.top) / r.height * 170)]; };
    const allMini = withCols(st.miniStrokes, st.miniCols, st.miniCur, st.miniPen);
    const ready = k === 'note' ? !!st.draftMsg.trim() : k === 'draw' ? st.miniStrokes.length > 0 : k === 'photo' ? st.photoPicked : false;
    const kindName = { note: 'Note', draw: 'Drawing', photo: 'Picture' };
    const stdSets = [[1500, 300, 900, '25 / 5'], [3000, 600, 1200, '50 / 10']];
    const isStdPomo = stdSets.some((x) => st.pomoFocus === x[0] && st.pomoShort === x[1] && st.pomoLong === x[2]) && st.pomoRounds === 4;
    const pomoSets = stdSets.map((x) => {
      const on = st.pomoFocus === x[0] && st.pomoShort === x[1] && st.pomoLong === x[2] && st.pomoRounds === 4 && !st.pomoEditOpen;
      return { label: x[3], on: on, bg: on ? '#FBF3D9' : '#FFFFFF', border: on ? '#2B2A27' : '#D8D1C2', pick: () => this.setState({ pomoFocus: x[0], pomoShort: x[1], pomoLong: x[2], pomoRounds: 4, pomoEditOpen: false, phase: 'focus', pomoCount: 0, running: false, left: x[0], length: x[0], timeUp: false }) };
    });
    const custOn = st.pomoEditOpen || !isStdPomo;
    pomoSets.push({ label: !isStdPomo && !st.pomoEditOpen ? (st.pomoFocus / 60) + ' / ' + (st.pomoShort / 60) + ' · Custom' : 'Customize', on: custOn, bg: custOn ? '#FBF3D9' : '#FFFFFF', border: custOn ? '#2B2A27' : '#D8D1C2',
      pick: () => this.setState({ pomoEditOpen: !st.pomoEditOpen, pd: { f: st.pomoFocus / 60, s: st.pomoShort / 60, l: st.pomoLong / 60, r: st.pomoRounds, ab: st.autoBreak, af: st.autoFocus } }) });
    let pomoInfo;
    {
        const R = st.pomoRounds, c = st.pomoCount;
        const cur = st.phase === 'focus' ? 2 * (c % R) : st.phase === 'short' ? 2 * ((c - 1) % R) + 1 : 2 * R - 1;
        const segs = [];
        for (let r = 0; r < R; r++) { segs.push({ kind: 'focus', len: st.pomoFocus }); segs.push({ kind: r === R - 1 ? 'long' : 'short', len: r === R - 1 ? st.pomoLong : st.pomoShort }); }
        const nm = { focus: 'Focus', short: 'Short break', long: 'Long break' };
        const nextKind = st.phase === 'focus' ? ((c + 1) % R === 0 ? 'long' : 'short') : 'focus';
        const nextLen = nextKind === 'focus' ? st.pomoFocus : nextKind === 'short' ? st.pomoShort : st.pomoLong;
        const nextFocusNo = st.phase === 'long' ? 1 : (c % R) + 1;
        pomoInfo = {
          roundSegs: segs.map((g, i) => {
            const isCur = i === cur, done = i < cur, f = g.kind === 'focus';
            return { grow: Math.max(1, Math.round(g.len / 60)), h: isCur ? 14 : 10, bw: isCur ? 2 : 1,
              border: isCur ? '#2B2A27' : (f ? '#C8553D' : '#6B8A5E'),
              bg: done ? (f ? '#C8553D' : '#9DB58F') : (isCur ? (f ? '#F4C9BC' : '#D5E3CB') : (f ? '#FBE9E2' : '#EEF3E8')) };
          }),
          nowText: nm[st.phase] + (st.phase === 'focus' ? ' · ' + ((c % R) + 1) + ' of ' + R : '') + ' · ' + Math.round(phaseLen(st.phase) / 60) + ' min',
          nextText: nm[nextKind] + (nextKind === 'focus' ? ' · ' + nextFocusNo + ' of ' + R : '') + ' · ' + Math.round(nextLen / 60) + ' min',
          roundLabel: 'This round: ' + segs.map((g) => nm[g.kind]).join(', ') + '. You are on ' + nm[st.phase] + '.',
          sessionLine: (st.phase === 'focus' ? 'Focus session ' + ((c % R) + 1) + ' of ' + R : nm[st.phase]) + '  ·  next: ' + nm[nextKind].toLowerCase() + ' (' + Math.round(nextLen / 60) + ' min)'
        };
    }
    const nowD = new Date();
    const calY = st.calY != null ? st.calY : nowD.getFullYear();
    const calM = st.calM != null ? st.calM : nowD.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const todayKey = nowD.getFullYear() + '-' + nowD.getMonth() + '-' + nowD.getDate();
    const focusSec = st.focusToday || 0;
    const STAR = 14400;
    const starLog = { ...(st.starLog || {}) };
    starLog[todayKey] = Math.floor(focusSec / STAR);
    const firstDow = new Date(calY, calM, 1).getDay();
    const daysIn = new Date(calY, calM + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysIn; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);
    let monthStarCount = 0;
    const calDays = cells.map((d) => {
      if (!d) return { t: '', label: '', bw: 0, border: 'transparent', bg: 'transparent', numColor: 'transparent', weight: 400, hasSticker: false, hasMulti: false, n: 0, rot: 0, anim: 'none' };
      const key = calY + '-' + calM + '-' + d;
      const isToday = key === todayKey;
      const n = starLog[key] || 0;
      monthStarCount += n;
      return {
        t: String(d),
        label: monthNames[calM] + ' ' + d + (isToday ? ' (today)' : '') + ': ' + (n ? n + (n === 1 ? ' star' : ' stars') : 'no stars'),
        anim: isToday && st.starPop ? 'scoinPop 700ms cubic-bezier(.3,.8,.3,1) both' : 'none',
        bw: isToday ? 2 : 1,
        border: isToday ? '#E0A030' : '#D8D1C2',
        bg: n ? '#FFFBEA' : '#FFFFFF',
        numColor: isToday ? '#2B2A27' : '#8A8478', weight: isToday ? 700 : 400,
        hasSticker: n > 0, hasMulti: n > 1, n, rot: ((d * 37) % 30) - 15
      };
    });
    const toNextSec = STAR - (focusSec % STAR);
    const hm = (sec) => { const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60); return h ? h + 'h ' + String(m).padStart(2, '0') + 'm' : m + 'm'; };
    return { friends, friendCount: roster.length, onlineCount: roster.filter((f) => f.online).length,
      settingsOpen: !!st.settingsOpen,
      toggleSettings: () => this.setState({ settingsOpen: !st.settingsOpen, friendsOpen: false, fAdd: false, fQuery: '', fConfirm: null }),
      closeSettings: () => this.setState({ settingsOpen: false }),
      allowPosts: st.allowPosts,
      toggleAllow: () => this.setState({ allowPosts: !st.allowPosts }),
      allowHelp: st.allowPosts ? 'Friends can send you notes, drawings and pictures.' : 'Off — friends will see that you’re not taking posts right now.',
      switchBg: st.allowPosts ? '#2B2A27' : '#E3DDD0',
      switchBorder: st.allowPosts ? '#2B2A27' : '#B8B0A0',
      knobLeft: st.allowPosts ? 26 : 3,
      avatarBg: st.settingsOpen ? '#FBF3D9' : 'transparent',
      boardStatus: st.allowPosts ? 'Friends can post here' : 'Friend posts off',
      boardDot: st.allowPosts ? '#6B8A5E' : '#B8B0A0',
      fAddMode: !!st.fAdd, fAddText: st.fAdd ? 'Done' : 'Add',
      fAddBg: st.fAdd ? '#2B2A27' : '#FFFFFF', fAddFg: st.fAdd ? '#FAF8F3' : '#2B2A27', fAddBorder: st.fAdd ? '#2B2A27' : '#D8D1C2',
      fAddToggle: () => this.setState({ fAdd: !st.fAdd, fQuery: '', fConfirm: null }),
      fQuery: st.fQuery, fOnQuery: (e) => this.setState({ fQuery: e.target.value }),
      fResults: fMatches.map((p, i) => {
        const isFriend = allFriends.some((f) => f.id === p.id), sent = st.outgoing.some((o) => o.id === p.id), theyAsked = st.incoming.some((o) => o.id === p.id);
        const btn = isFriend ? 'FRIENDS' : sent ? 'REQUESTED' : theyAsked ? 'ACCEPT' : 'ADD', dark = btn === 'ADD' || btn === 'ACCEPT';
        return { ...p, initial: p.name.replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase() || '?', tint: tints[i % tints.length], btn,
          disabled: isFriend, cursor: isFriend ? 'default' : 'pointer', bg: dark ? '#2B2A27' : '#FFFFFF', fg: dark ? '#FAF8F3' : '#6B655A', border: dark ? '#2B2A27' : '#D8D1C2',
          actLabel: isFriend ? p.name + ' is already your friend' : sent ? 'Cancel request to ' + p.name : theyAsked ? 'Accept ' + p.name + '’s request' : 'Send ' + p.name + ' a friend request',
          act: () => { if (isFriend) return; if (sent) return this.setState({ outgoing: st.outgoing.filter((o) => o.id !== p.id) }); if (theyAsked) return acceptReq(p); this.setState({ outgoing: st.outgoing.concat([p]) }); } };
      }),
      fNoResults: fQ.length >= 2 && fMatches.length === 0,
      hasIncoming: st.incoming.length > 0,
      incomingTitle: 'FRIEND REQUESTS · ' + st.incoming.length,
      incoming: st.incoming.map((q) => ({ ...q, initial: q.name.charAt(0).toUpperCase(), acceptLabel: 'Accept friend request from ' + q.name, declineLabel: 'Decline friend request from ' + q.name,
        accept: () => acceptReq(q), decline: () => this.setState({ incoming: this.state.incoming.filter((x) => x.id !== q.id) }) })),
      hasOutgoing: st.outgoing.length > 0,
      outgoing: st.outgoing.map((o) => ({ ...o, cancelLabel: 'Cancel friend request to ' + o.name, cancel: () => this.setState({ outgoing: this.state.outgoing.filter((x) => x.id !== o.id) }) })),
      fToastOn: !!st.fToast, fToast: st.fToast,
      reqBadgeOn: st.incoming.length > 0, reqBadge: String(st.incoming.length), reqBadgeLabel: st.incoming.length + (st.incoming.length === 1 ? ' friend request' : ' friend requests'),
      pfCount: String(allFriends.length),
      pfFriends: allFriends.map((f, i) => ({ name: f.name, closed: !!f.closed, sent: !!st.sentTo[f.id] && st.composeFor !== f.id, sentKind: st.sentTo[f.id] || '',
        composeLabel: f.closed ? f.name + ' isn’t taking whiteboard posts' : 'Post on ' + f.name + '’s whiteboard',
        btnBg: st.composeFor === f.id ? '#2B2A27' : '#FFFFFF', btnFg: st.composeFor === f.id ? '#FAF8F3' : '#2B2A27', btnBorder: st.composeFor === f.id ? '#2B2A27' : '#D8D1C2', btnOpacity: f.closed ? 0.4 : 1, btnCursor: f.closed ? 'not-allowed' : 'pointer',
        compose: () => f.closed ? null : this.setState({ composeFor: f.id, composeKind: null, draftMsg: '', miniStrokes: [], miniCols: [], miniCur: null, photoPicked: false, photoCaption: '' }), initial: f.initial || ('F' + f.id), tint: f.tint || tints[i % tints.length], confirming: st.fConfirm === f.id,
        moreLabel: 'Remove ' + f.name + ' from friends',
        askRemove: () => this.setState({ fConfirm: st.fConfirm === f.id ? null : f.id }),
        keep: () => this.setState({ fConfirm: null }),
        remove: () => this.setState({ fConfirm: null, removedFriends: (this.state.removedFriends || []).concat([f.id]), addedFriends: (this.state.addedFriends || []).filter((x) => x.id !== f.id) }) })),
      noActive: roster.length === 0,
      lampSub: roster.filter((f) => f.act !== 'recent').length + ' online · ' + roster.filter((f) => f.act === 'running').length + ' focused on work',
      stopProp: (e) => { if (e && e.stopPropagation) e.stopPropagation(); },
      friendsModal: !!st.friendsModal,
      openFriendsModal: () => this.setState({ friendsModal: true, settingsOpen: false, fAdd: false, fQuery: '', fConfirm: null }),
      friendsModalClose: () => this.setState({ friendsModal: false, fAdd: false, fQuery: '', fConfirm: null }),
      editProfile: !!st.ep,
      openEditProfile: () => this.setState({ settingsOpen: false, ep: { name: st.profName, user: st.profUser.replace(/^\[|\]$/g, '') === 'username' ? '' : st.profUser } }),
      editProfileClose: () => this.setState({ ep: null }),
      profName: st.profName, profUser: st.profUser,
      ...(() => {
        const ep = st.ep || { name: '', user: '', photo: '' };
        const taken = this.ext.takenList(ep.user.trim());
        const u = ep.user.trim(), validFmt = /^[A-Za-z0-9_.]{3,24}$/.test(u), isTaken = taken.includes(u.toLowerCase()), same = u === st.profUser;
        const nameOk = ep.name.trim().length > 0;
        const ok = nameOk && validFmt && !isTaken;
        const note = !u ? 'Pick a username friends can find you by.' : !validFmt ? '3–24 letters, numbers, dots or underscores.' : isTaken ? 'That username is taken.' : same ? '' : '✓ Available';
        const bad = !!u && (!validFmt || isTaken);
        return {
          epName: ep.name, epOnName: (e) => this.setState({ ep: { ...this.state.ep, name: e.target.value } }),
          epUser: ep.user, epOnUser: (e) => this.setState({ ep: { ...this.state.ep, user: e.target.value.replace(/^@/, '') } }),
          epUserNote: note, epUserColor: bad ? '#9A3B1C' : note.startsWith('✓') ? '#3E6B33' : '#6B655A', epUserBorder: bad ? '#C8553D' : '#B8B0A0',
          epInitial: (ep.name.trim().replace(/^\[|\]$/g, '').charAt(0) || '?').toUpperCase(), epTint: '#FBF3D9',
          epSaveBg: ok ? '#2B2A27' : '#A39C8E', epSaveCursor: ok ? 'pointer' : 'not-allowed',
          epSave: () => { if (!ok) return; this.setState({ profName: ep.name.trim(), profUser: u, ep: null }); }
        };
      })(),
      myColor: st.myColor, myInitial: ((st.profName || '').replace(/[^A-Za-z]/g, '').charAt(0) || 'N').toUpperCase(),
      friendsOpen: st.friendsOpen,
      // Hover opens the friends list; on touch screens the tap that follows mustn't close it again.
      lampEnter: () => { clearTimeout(this._lampLeaveT); if (this.state.friendsOpen) return; this._hoverOpenAt = Date.now(); this.renderVals().toggleFriends(); },
      lampLeave: () => { clearTimeout(this._lampLeaveT); this._lampLeaveT = setTimeout(() => { const s2 = this.state; if (!s2.friendsOpen || s2.composeFor != null) return; this.renderVals().closeFriends(); }, 250); },
      toggleFriends: () => {
        if (this.state.friendsOpen && Date.now() - (this._hoverOpenAt || 0) < 600) return;
        const open = !this.state.friendsOpen;
        if (this._friendsAway) { document.removeEventListener('click', this._friendsAway, true); this._friendsAway = null; }
        this.setState({ friendsOpen: open, composeFor: null, settingsOpen: false });
        // A click anywhere outside the lamp and its friends list closes it.
        if (open) setTimeout(() => {
          this._friendsAway = (ev) => { if (ev.target && ev.target.closest && ev.target.closest('.lampwrap')) return; document.removeEventListener('click', this._friendsAway, true); this._friendsAway = null; this.setState({ friendsOpen: false, composeFor: null }); };
          document.addEventListener('click', this._friendsAway, true);
        }, 0);
      },
      closeFriends: () => { if (this._friendsAway) { document.removeEventListener('click', this._friendsAway, true); this._friendsAway = null; } this.setState({ friendsOpen: false, composeFor: null }); },
      draftMsg: st.draftMsg,
      onMsg: (e) => this.setState({ draftMsg: e.target.value }),
      popOpen: !!target,
      popTitle: target ? (k ? kindName[k] + ' for ' + target.name : 'Post on ' + target.name + '’s whiteboard') : '',
      kindChoose: !k, kindNote: k === 'note', kindDraw: k === 'draw', kindPhoto: k === 'photo', kindChosen: !!k,
      pickNote: () => this.setState({ composeKind: 'note' }),
      pickDraw: () => this.setState({ composeKind: 'draw' }),
      pickPhoto: () => this.setState({ composeKind: 'photo' }),
      backPop: () => this.setState({ composeKind: null }),
      closePop: () => this.setState({ composeFor: null, composeKind: null }),
      miniStrokes: allMini.map((x) => ({ d: 'M' + x.m.map((q) => q[0] + ' ' + q[1]).join(' L'), color: x.c })),
      dDown: (e) => { if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); this.setState({ miniCur: [pt(e)] }); },
      dMove: (e) => { const c = this.state.miniCur; if (!c) return; this.setState({ miniCur: c.concat([pt(e)]) }); },
      dUp: () => { const c = this.state.miniCur; if (!c) return; this.setState({ miniCur: null, miniStrokes: this.state.miniStrokes.concat([c]), miniCols: (this.state.miniCols || []).concat([this.state.miniPen || '#2B2A27']) }); },
      clearMini: () => this.setState({ miniStrokes: [], miniCols: [], miniCur: null }),
      pickFile: () => this.setState({ photoPicked: true }),
      photoBg: st.photoPicked ? '#E3DDD0' : '#FFFDF6',
      photoCaption: st.photoCaption || '', onPhotoCaption: (e) => this.setState({ photoCaption: e.target.value }),
      photoLabel: st.photoPicked ? (this.ext.fileName('friend') || 'Photo') + ' ready to send — tap to change' : 'Choose a photo',
      sendBg: ready ? '#2B2A27' : '#A39C8E',
      sendPop: () => {
        if (!ready || !target) return;
        this.setState({ composeFor: null, composeKind: null, draftMsg: '', miniStrokes: [], photoPicked: false, sentTo: { ...st.sentTo, [target.id]: kindName[k] }, photoCaption: '' });
      },
      tmodes, isCountdown: st.tmode === 'countdown', isPomo,
      phaseLabel: st.phase === 'focus' ? 'FOCUS · ' + ((st.pomoCount % st.pomoRounds) + 1) + ' of ' + st.pomoRounds : st.phase === 'short' ? 'SHORT BREAK' : 'LONG BREAK',
      phaseBg: st.phase === 'focus' ? '#FBE9E2' : '#EEF3E8',
      phaseDot: st.phase === 'focus' ? '#C8553D' : '#6B8A5E',
      cycleLabel: (st.pomoCount % st.pomoRounds) + ' of ' + st.pomoRounds + ' focus sessions done this round',
      cycleDots: Array.from({ length: st.pomoRounds }, (_, d) => d).map((d) => ({ bg: d < (st.pomoCount % st.pomoRounds) || (st.phase === 'long' && st.pomoCount > 0) ? '#B5562E' : 'transparent' })),
      pomoSets: pomoSets,
      pomoEditOpen: st.pomoEditOpen,
      showPomoEdit: isPomo && st.pomoEditOpen,
      doodles,
      ...(() => { const ad = this.adminInfo ? this.adminInfo() : { on: true, pending: 2 }; return { adminOn: ad.on, adminBadgeOn: ad.pending > 0, adminBadge: ad.pending }; })(),
      ...(() => {
        const nb = this.newBoard ? this.newBoard() : (st.newSeen ? { count: 0, names: [] } : { count: 2, names: ['[Friend]'], at: [300, 360] });
        const one = nb.names.length === 1;
        return {
          newOn: nb.count > 0 && !st.boardPop,
          newText: nb.count === 1 ? 'New post from ' + nb.names[0] : nb.count + ' new posts from ' + (one ? nb.names[0] : 'friends'),
          seeNew: () => {
            try { const v = Array.prototype.slice.call(document.querySelectorAll('.boardview')).find((e) => e.offsetParent); if (v && nb.at) v.scrollTo({ left: Math.max(0, nb.at[0] - 40), top: Math.max(0, nb.at[1] - 50), behavior: 'smooth' }); } catch (e) {}
            if (nb.seen) nb.seen(); else this.setState({ newSeen: true });
          },
          dismissNew: () => { if (nb.seen) nb.seen(); else this.setState({ newSeen: true }); },
        };
      })(),
      openBoardNote: () => this.setState({ boardPop: 'note', bpText: '' }),
      openBoardDraw: () => this.setState({ boardPop: 'draw', bpStrokes: [], bpCols: [], bpCur: null }),
      openBoardPhoto: () => this.setState({ boardPop: 'photo', bpFile: '', bpCaption: '' }),
      bpCaption: st.bpCaption || '', onBpCaption: (e) => this.setState({ bpCaption: e.target.value }),
      closeBoardPop: () => this.setState({ boardPop: null }),
      boardPopOpen: !!bpKind,
      boardPopTitle: bpKind === 'note' ? 'Add a note' : bpKind === 'draw' ? 'Add a drawing' : bpKind === 'photo' ? 'Add a picture' : '',
      bpIsNote: bpKind === 'note', bpIsDraw: bpKind === 'draw', bpIsPhoto: bpKind === 'photo',
      bpText: st.bpText || '', onBpText: (e) => this.setState({ bpText: e.target.value }),
      bpStrokes: bpAll.map((x) => ({ d: 'M' + x.m.map((q) => q[0] + ' ' + q[1]).join(' L'), color: x.c })), bpPens: penChips(st.bpPen, 'bpPen'), miniPens: penChips(st.miniPen, 'miniPen'),
      bpDown: (e) => { if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); this.setState({ bpCur: [bpPt(e)] }); },
      bpMove: (e) => { const c = this.state.bpCur; if (!c) return; this.setState({ bpCur: c.concat([bpPt(e)]) }); },
      bpUp: () => { const c = this.state.bpCur; if (!c) return; this.setState({ bpCur: null, bpStrokes: (this.state.bpStrokes || []).concat([c]), bpCols: (this.state.bpCols || []).concat([this.state.bpPen || '#2B2A27']) }); },
      bpClear: () => this.setState({ bpStrokes: [], bpCols: [], bpCur: null }),
      bpPickFile: (e) => { const f = e.target.files && e.target.files[0]; if (f) { this.ext.stashFile('board', f); this.setState({ bpFile: f.name }); } try { e.target.value = ''; } catch (err) {} },
      bpFileLabel: st.bpFile ? st.bpFile + ' ready' : 'Pick a picture from your device',
      bpAddBg: bpReady ? '#2B2A27' : '#A39C8E',
      bpColors: [['#D6E8F7', 'Blue'], ['#FFDCC6', 'Peach'], ['#CDEDDB', 'Mint'], ['#F9D6E0', 'Pink']].map(([hex, name]) => { const on = (st.bpColor || '#D6E8F7') === hex; return { hex, on, label: name + ' note', ring: on ? '#2B2A27' : '#E3DDD0', pick: () => this.setState({ bpColor: hex }) }; }),
      addBoardItem: () => {
        if (!bpReady) return;
        const uid = Date.now();
        if (bpKind === 'draw') {
          const paths = withCols(st.bpStrokes, st.bpCols, null).map((x) => ({ d: 'M' + x.m.map((q) => q[0] + ' ' + q[1]).join(' L'), color: x.c }));
          const d = paths.map((p) => p.d).join(' ');
          const idx = doodleShapes.length + (st.myDoodles || []).length;
          placeNew('d' + idx, { boardPop: null, myDoodles: (st.myDoodles || []).concat([{ id: uid, d, paths }]) });
        } else {
          const idx = basePosts.length + (st.myPosts || []).length;
          const item = bpKind === 'note' ? { id: uid, text: st.bpText.trim(), color: st.bpColor || '#D6E8F7', tape: ['#E8B8A6', '#B9CBB0', '#E8D18A', '#C9BEE6'][(st.myPosts || []).length % 4], rot: [-1.5, 1.5, -1, 2][(st.myPosts || []).length % 4] } : { id: uid, img: true, text: (st.bpCaption || '').trim(), color: st.bpColor || '#D6E8F7', tape: ['#E8B8A6', '#B9CBB0', '#E8D18A', '#C9BEE6'][(st.myPosts || []).length % 4], rot: [-1.5, 1.5, -1, 2][(st.myPosts || []).length % 4] };
          placeNew('p' + idx, { boardPop: null, myPosts: (st.myPosts || []).concat([item]) });
        }
      },
      quickNote: st.quickNote || '', onQuickNote: (e) => this.setState({ quickNote: e.target.value }),
      quickBg: (st.quickNote || '').trim() ? '#2B2A27' : '#A39C8E',
      quickNoteKey: (e) => { if (e.key === 'Enter') { e.preventDefault(); const t = (this.state.quickNote || '').trim(); if (!t) return; const idx = basePosts.length + (st.myPosts || []).length; placeNew('p' + idx, { quickNote: '', myPosts: (st.myPosts || []).concat([{ id: Date.now(), text: t, color: ['#D6E8F7', '#FFDCC6', '#CDEDDB', '#F9D6E0'][(st.myPosts || []).length % 4], tape: ['#E8B8A6', '#B9CBB0', '#E8D18A', '#C9BEE6'][(st.myPosts || []).length % 4], rot: [-1.5, 1.5, -1, 2][(st.myPosts || []).length % 4] }]) }); } },
      postQuickNote: () => { const t = (st.quickNote || '').trim(); if (!t) return; const idx = basePosts.length + (st.myPosts || []).length; placeNew('p' + idx, { quickNote: '', myPosts: (st.myPosts || []).concat([{ id: Date.now(), text: t, color: ['#D6E8F7', '#FFDCC6', '#CDEDDB', '#F9D6E0'][(st.myPosts || []).length % 4], tape: ['#E8B8A6', '#B9CBB0', '#E8D18A', '#C9BEE6'][(st.myPosts || []).length % 4], rot: [-1.5, 1.5, -1, 2][(st.myPosts || []).length % 4] }]) }); },
      panCursor: st.panning ? 'grabbing' : 'grab',
      panDown: (e) => {
        if (e.target !== e.currentTarget || e.pointerType === 'touch') return;
        const view = e.currentTarget.parentElement;
        const r = view.getBoundingClientRect();
        const scale = r.width / view.offsetWidth || 1;
        this.pan = { sx: e.clientX, sy: e.clientY, l: view.scrollLeft, t: view.scrollTop, scale, view };
        if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
        this.setState({ panning: true, selected: null });
      },
      panMove: (e) => { const p = this.pan; if (!p) return; p.view.scrollLeft = p.l - (e.clientX - p.sx) / p.scale; p.view.scrollTop = p.t - (e.clientY - p.sy) / p.scale; },
      panUp: () => { if (this.pan) { this.pan = null; this.setState({ panning: false }); } },
      calTitle: monthNames[calM] + ' ' + calY,
      calDow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((t) => ({ t })),
      calDays,
      calPrev: () => this.setState({ calM: calM === 0 ? 11 : calM - 1, calY: calM === 0 ? calY - 1 : calY }),
      calNext: () => this.setState({ calM: calM === 11 ? 0 : calM + 1, calY: calM === 11 ? calY + 1 : calY }),
      monthStars: monthStarCount + (monthStarCount === 1 ? ' star' : ' stars') + ' in ' + monthNames[calM],
      focusToday: hm(focusSec % STAR) + ' of 4h focused' + (Math.floor(focusSec / STAR) ? ' (+' + Math.floor(focusSec / STAR) + ' earned today)' : ' today'),
      focusToNext: hm(toNextSec) + ' to your next star',
      focusPct: Math.round((focusSec % STAR) / STAR * 1000) / 10,
      starToast: !!st.starToast,
      starFx: !!st.starFx,
      starFxSub: 'Well done! You have completed 4 hours of focused time and earned yourself a star',
      starFxDone: () => { clearTimeout(this.fxTimer); this.setState({ starFx: false, starPop: true }); clearTimeout(this.popTimer); this.popTimer = setTimeout(() => this.setState({ starPop: false }), 1000); },
      replayStar: () => this.playStarFx(),
      roundSegs: pomoInfo.roundSegs, nowText: pomoInfo.nowText, nextText: pomoInfo.nextText, roundLabel: pomoInfo.roundLabel,
      sessionLine: pomoInfo.sessionLine,
      pomoFields: st.pd ? [['f', 'Focus', 5, 120, 5, ' min'], ['s', 'Short break', 1, 30, 1, ' min'], ['l', 'Long break', 5, 60, 5, ' min'], ['r', 'Sessions before long break', 2, 8, 1, '']].map(([k, label, min, max, step, unit]) => ({
        label, value: st.pd[k] + unit,
        decLabel: 'Less ' + label.toLowerCase(), incLabel: 'More ' + label.toLowerCase(),
        dec: () => this.setState({ pd: { ...this.state.pd, [k]: Math.max(min, this.state.pd[k] - step) } }),
        inc: () => this.setState({ pd: { ...this.state.pd, [k]: Math.min(max, this.state.pd[k] + step) } })
      })) : [],
      pomoToggles: st.pd ? [['ab', 'Start breaks automatically'], ['af', 'Start next focus session automatically']].map(([k, label]) => ({
        id: 'pt-' + k, label, on: !!st.pd[k], bg: st.pd[k] ? '#2B2A27' : '#E3DDD0', border: st.pd[k] ? '#2B2A27' : '#B8B0A0', knob: st.pd[k] ? 22 : 2,
        flip: () => this.setState({ pd: { ...this.state.pd, [k]: !this.state.pd[k] } })
      })) : [],
      cancelPomoEdit: () => this.setState({ pomoEditOpen: false }),
      savePomoEdit: () => { const d = st.pd; this.setState({ pomoFocus: d.f * 60, pomoShort: d.s * 60, pomoLong: d.l * 60, pomoRounds: d.r, autoBreak: d.ab, autoFocus: d.af, pomoEditOpen: false, phase: 'focus', pomoCount: 0, running: false, left: d.f * 60, length: d.f * 60, timeUp: false }); },
      soundPill: st.sound ? '#2B2A27' : '#FFFFFF', soundPillFg: st.sound ? '#FAF8F3' : '#2B2A27', soundShort: st.sound ? 'Sound on' : 'Sound off', presets, editing: st.editing,
      customMin: st.customMin, onCustom: (e) => this.setState({ customMin: e.target.value }),
      applyCustom: () => { const m = Math.round(Number(st.customMin)); if (!m || m < 1 || m > 240) return; this.setState({ length: m * 60, left: m * 60, cdLength: m * 60, running: false, timeUp: false, editing: false }); },
      cancelCustom: () => this.setState({ editing: false }),
      sound: st.sound, toggleSound: () => { const on = !st.sound; this.setState({ sound: on }); if (on) { this.unlockAudio(); this.chime(); } },
      soundBg: st.sound ? '#2B2A27' : '#E3DDD0', soundBorder: st.sound ? '#2B2A27' : '#B8B0A0', soundKnob: st.sound ? 22 : 2,
      soundWave: st.sound ? 'M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11' : 'M16 9l5 6M21 9l-5 6',
      clock: cd ? fmtClock(st.left) : fmtClock(st.elapsed),
      statusLine: activeTask ? (st.running ? 'Timing · ' : (activeStarted ? 'Paused · ' : 'Selected · ')) + activeTask.text : '', statusOn: !!activeTask,
      timeUp: st.timeUp, timeUpText: isPomo ? st.pomoMsg : upTask && upTask.plan ? 'planned time done for ' + upTask.text + '.' : mins(st.length) + ' min' + (upTask ? ' logged to ' + upTask.text : ' done') + '.',
      pct, rulerLabels,
      mainLabel: st.running ? 'PAUSE' : ((cd ? st.left < st.length && st.left > 0 : st.elapsed > 0) ? 'RESUME' : 'START'),
      mainToggle: () => { if (st.running) this.setState({ running: false }); else this.setState({ running: true, timeUp: false, left: cd && st.left <= 0 ? st.length : st.left }); },
      stopAll: () => { const sv = { ...(st.saved || {}) }; delete sv[sKey(st.active, st.tmode)]; this.setState({ active: null, ...resetT, saved: sv }); },
      tasks, totalLogged: fmtDur(st.tasks.reduce((a, t) => a + t.logged, 0)).replace('not started', '0 min'),
      draft: st.draft, onDraft: (e) => this.setState({ draft: e.target.value }),
      onDraftKey: (e) => { if (e.key !== 'Enter' || e.isComposing) return; if (e.preventDefault) e.preventDefault(); this.renderVals().addTask(); },
      addTask: () => {
        const text = st.draft.trim(); if (!text) return;
        let plan = st.newPlan;
        if (st.planCustomOpen) { const m = Math.round(Number(st.planCustom)); plan = m > 0 ? m * 60 : null; }
        this.setState({ draft: '', planCustomOpen: false, planCustom: '', tasks: st.tasks.concat([{ id: Date.now(), text, done: false, logged: 0, plan: plan || undefined }]) });
      },
      planChips: [[null, 'No time'], [900, '15 min'], [1500, '25 min'], [3000, '50 min'], ['c', 'Custom']].map(([v, label]) => {
        const on = v === 'c' ? st.planCustomOpen : (!st.planCustomOpen && st.newPlan === v);
        return { label, on, bg: on ? '#FBF3D9' : '#FFFFFF', border: on ? '#2B2A27' : '#D8D1C2', pick: () => v === 'c' ? this.setState({ planCustomOpen: true }) : this.setState({ newPlan: v, planCustomOpen: false }) };
      }),
      planCustomOpen: st.planCustomOpen, planCustom: st.planCustom,
      onPlanCustom: (e) => this.setState({ planCustom: e.target.value }),
      posts: visiblePosts,
      showUndo: !!st.undoId, undoText: (st.undoKind || 'Item') + ' removed',
      undoDelete: () => { clearTimeout(this.undoTimer); this.setState({ deleted: { ...(st.deleted || {}), [st.undoId]: false }, undoId: null }); } };
  }
}

