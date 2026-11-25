// @ts-nocheck — wraps the generated Home board logic (plain JS) with backend calls.
// The board keeps its own state exactly as designed; this layer loads real data into
// that state and turns state changes into Supabase calls.
import * as T from "../lib/api/tasks";
import * as B from "../lib/api/board";
import * as F from "../lib/api/friends";
import { focusForDay, getTimerSettings, logFocus, saveTimerSettings, starCalendar } from "../lib/api/timer";
import { logOut, updateMyProfile, usernameAvailable } from "../lib/api/auth";
import { localDay } from "../lib/supabase";
import { headerVals } from "./header";
import { isAdmin, listAccessRequests } from "../lib/api/access";

// Saved rows have a bare UUID; ids made on the page (e.g. "p<task uuid>-<time>") do not.
// Tasks planned for a future day (from the Schedule) join the to-do list on that day.
const shownToday = (t) => !t.show_from || t.show_from <= localDay();
const isServerId = (id) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const WASHI = ["#F08C7E", "#6FC2A8", "#F5C04A", "#8FA8E8"];
const initial = (name) => ((name || "").replace(/[^\p{L}]/gu, "").charAt(0) || "?").toUpperCase();
const hashIdx = (id, n) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % n; };
const pathToStrokes = (d, color = "#2B2A27") => d.split("M").map((seg) => seg.trim()).filter(Boolean)
  .map((seg) => ({ color, width: 3, points: seg.split("L").map((p) => p.trim().split(/\s+/).map(Number)).filter((p) => p.length === 2 && !p.some(isNaN)) }))
  .filter((s) => s.points.length > 1);
const strokesToPath = (strokes) => (strokes || []).map((s) => "M" + s.points.map((p) => p[0] + " " + p[1]).join(" L")).join(" ");

export function makeHome(Base, board: { w: number; h: number }) {
  return class HomeBridge extends Base {
    constructor(props) {
      super(props);
      this.ctx = props.ctx as { current: Ctx };
      const p = this.ctx.current.profile;
      Object.assign(this.state, {
        tasks: [], focusToday: 0, starLog: {}, incoming: [], outgoing: [], addedFriends: [], removedFriends: [],
        profName: p.display_name, profUser: p.username, myColor: p.avatar_color, allowPosts: p.allow_board_posts,
        myPosts: [], myDoodles: [], kept: {}, sentTo: {},
      });
      this.items = []; this.urls = {}; this.files = {}; this.search = new Map(); this.taken = new Map();
      this.pending = null; this.status = ""; this.timers = {};
      const self = this;
      this.ext = {
        roster0: () => self.roster(),
        search: (q) => self.searchPeople(q),
        takenList: (u) => self.takenFor(u),
        posts: () => self.posts(),
        doodles: () => self.doodles(),
        stashFile: (k, f) => { self.files[k] = f; },
        fileName: (k) => self.files[k]?.name || "",
      };
    }

    // ── loading ──
    componentDidMount() {
      super.componentDidMount?.();
      void this.loadAll();
      void this.loadAdmin();
      this.offTasks = T.onTasksChange(() => void this.loadTasks());
      this.offBoard = B.onBoardChange(this.ctx.current.profile.id, () => void this.loadBoard());
      this.flushIv = setInterval(() => void this.flush("tick"), 120000);
      this.onHide = () => { if (document.visibilityState === "hidden") void this.flush("hide"); };
      document.addEventListener("visibilitychange", this.onHide);
      this.onFriends = () => this.syncFriends();
      // The lamp on Schedule/Study brings you here with the friends list open.
      this.onOpenFriends = () => {
        if (!window.__space150OpenFriends) return;
        window.__space150OpenFriends = false;
        if (!this.state.friendsOpen) this.renderVals().toggleFriends();
      };
      window.addEventListener("space150:open-friends", this.onOpenFriends);
      setTimeout(this.onOpenFriends, 0);
      window.addEventListener("space150:friends", this.onFriends);
    }
    componentWillUnmount() {
      super.componentWillUnmount?.();
      this.offTasks?.(); this.offBoard?.(); clearInterval(this.flushIv);
      document.removeEventListener("visibilitychange", this.onHide);
      window.removeEventListener("space150:open-friends", this.onOpenFriends);
      window.removeEventListener("space150:friends", this.onFriends);
      void this.flush("leave");
    }
    serverSet(patch) { this.syncing = true; try { super.setState(patch); } finally { this.syncing = false; } }
    fail(e) { console.error(e); }

    async loadAll() {
      try {
        const [tasks, focus, settings] = await Promise.all([T.listTasks(), focusForDay(), getTimerSettings()]);
        const s = settings;
        const patch = {
          tasks: tasks.filter(shownToday).map((t) => this.mapTask(t)), focusToday: focus.focus_sec,
          pomoFocus: s.pomo_focus_sec, pomoShort: s.pomo_short_sec, pomoLong: s.pomo_long_sec, pomoRounds: s.pomo_rounds,
          autoBreak: s.auto_break, autoFocus: s.auto_focus, sound: s.sound, cdLength: s.countdown_sec,
        };
        if (!this.state.running && this.state.tmode === "countdown" && this.state.active == null) Object.assign(patch, { length: s.countdown_sec, left: s.countdown_sec });
        if (!this.state.running && this.state.tmode === "pomodoro") Object.assign(patch, { length: s.pomo_focus_sec, left: s.pomo_focus_sec });
        this.serverSet(patch);
      } catch (e) { this.fail(e); }
      void this.loadBoard(); void this.loadStars(); this.syncFriends();
    }
    mapTask(t) {
      const pend = this.pending && this.pending.task === t.id ? this.pending.sec : 0;
      const local = (this.state.tasks || []).find((x) => x.id === t.id);
      return { id: t.id, text: t.text, done: t.done, logged: t.logged_sec + pend, plan: t.plan_sec || undefined, pomos: t.pomodoros, pomoLogged: local?.pomoLogged || 0 };
    }
    async loadTasks() {
      try {
        if (this.taskWrites) { setTimeout(() => void this.loadTasks(), 400); return; }
        const rev = this.taskRev || 0;
        const rows = await T.listTasks();
        if (rev !== (this.taskRev || 0) || this.taskWrites) { setTimeout(() => void this.loadTasks(), 400); return; }   // edited while loading
        const localOnly = (this.state.tasks || []).filter((t) => !isServerId(t.id));
        this.serverSet({ tasks: rows.filter(shownToday).map((t) => this.mapTask(t)).concat(localOnly) });
      } catch (e) { this.fail(e); }
    }
    async loadStars() {
      const now = new Date(), y = this.state.calY ?? now.getFullYear(), m = this.state.calM ?? now.getMonth();
      try {
        const rows = await starCalendar(y, m + 1);
        const log = {};
        for (const r of rows) { const d = new Date(r.day + "T00:00"); log[d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate()] = r.coins; }
        this.serverSet({ starLog: { ...(this.state.starLog || {}), ...log } });
      } catch (e) { this.fail(e); }
    }
    async loadBoard() {
      try {
        this.items = await B.listBoard(this.ctx.current.profile.id);
        await Promise.all(this.items.filter((i) => i.kind === "photo" && i.image_path && !this.urls[i.image_path])
          .map(async (i) => { try { this.urls[i.image_path] = await B.photoUrl(i.image_path); } catch { /* ignore */ } }));
        this.serverSet({});
      } catch (e) { this.fail(e); }
    }

    // ── data the board reads ──
    roster() {
      const { friends, online } = this.ctx.current.social;
      return friends.filter((f) => f.status === "accepted").map((f) => {
        const p = online.get(f.id);
        const seenMin = f.last_seen_at ? Math.round((Date.now() - new Date(f.last_seen_at).getTime()) / 60000) : 99999;
        // Website open → "online"; with a timer going → "running" (or "paused").
        const act = p?.status === "focusing" ? "running" : p?.status === "paused" ? "paused" : p ? "online" : seenMin <= 30 ? "recent" : "away";
        const mins = p ? Math.max(0, Math.round((Date.now() - new Date(p.since).getTime()) / 60000)) : 0;
        return { id: f.id, name: f.display_name, username: f.username, act, doing: "Focusing", mins, ago: p ? 0 : seenMin,
          closed: !f.allow_board_posts, initial: initial(f.display_name), tint: f.avatar_color };
      });
    }
    searchPeople(q) {
      const hit = this.search.get(q);
      if (hit) return hit;
      this.search.set(q, []);
      F.searchPeople(q).then((rows) => { this.search.set(q, rows.map((r) => ({ id: r.id, name: r.display_name, username: r.username, tint: r.avatar_color }))); this.serverSet({}); }).catch(() => {});
      return [];
    }
    takenFor(u) {
      const me = this.ctx.current.profile.username;
      if (!/^[A-Za-z0-9_.]{3,24}$/.test(u) || u.toLowerCase() === me.toLowerCase()) return [];
      const k = u.toLowerCase();
      if (this.taken.has(k)) return this.taken.get(k) ? [k] : [];
      this.taken.set(k, false);
      usernameAvailable(u).then((ok) => { this.taken.set(k, !ok); this.serverSet({}); }).catch(() => {});
      return [];
    }
    clamp(x, y, w, h) { return [Math.max(0, Math.min(board.w - w, x)), Math.max(0, Math.min(board.h - h, y))]; }
    posts() {
      const me = this.ctx.current.profile.id, nameOf = (id) => this.ctx.current.social.friends.find((f) => f.id === id)?.display_name;
      return this.items.filter((i) => i.kind !== "drawing").map((i) => {
        const mine = i.author_id === me, [x, y] = this.clamp(i.x, i.y, 170, 130);
        return { bid: i.id, text: i.kind === "photo" ? (i.caption || "") : i.body, img: i.kind === "photo", imgUrl: i.image_path ? this.urls[i.image_path] : undefined,
          mine, paper: mine ? (i.color || "#D6E8F7") : "#FAF4E2", tape: WASHI[hashIdx(i.id, 4)], rot: [-1.5, 1.5, -1, 2][hashIdx(i.id + "r", 4)],
          x, y, z: i.z || 2, author: mine ? "Me" : (nameOf(i.author_id) || "A friend"), kept: i.kept, hoursLeft: B.hoursLeft(i) };
      });
    }
    doodles() {
      return this.items.filter((i) => i.kind === "drawing").map((i) => {
        const [x, y] = this.clamp(i.x, i.y, 170, 96);
        const mine = i.author_id === this.ctx.current.profile.id;
        const who = mine ? "" : (this.ctx.current.social.friends.find((f) => f.id === i.author_id)?.display_name || "a friend");
        return { bid: i.id, label: mine ? "Your drawing" : "Drawing from " + who, by: mine ? "" : "From " + who, vb: "0 0 300 170",
          paths: (i.strokes || []).map((st) => ({ d: strokesToPath([st]), color: st.color || "#2B2A27" })), x, y, w: 170, h: 96,
          canKeep: !mine, kept: i.kept, hoursLeft: B.hoursLeft(i) };
      });
    }

    // Site owner: link to Access requests with the number waiting.
    adminInfo() { return this.admin || { on: false, pending: 0 }; }
    async loadAdmin() {
      try {
        if (!(await isAdmin())) return;
        const rows = await listAccessRequests();
        this.admin = { on: true, pending: rows.filter((r) => r.status === "pending").length };
        this.serverSet({});
      } catch (e) { /* not the owner, or the feature isn't set up yet */ }
    }
    // Posts friends left since you last looked (remembered per account on this device).
    newBoard() {
      const me = this.ctx.current.profile.id, key = "space150:boardSeen:" + me;
      let seen = 0; try { seen = Number(localStorage.getItem(key) || 0); } catch (e) { seen = this.seenAt || 0; }
      seen = Math.max(seen, this.seenAt || 0);
      const fresh = (this.items || []).filter((i) => i.author_id !== me && new Date(i.created_at).getTime() > seen)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const nameOf = (id) => this.ctx.current.social.friends.find((f) => f.id === id)?.display_name || "a friend";
      const names = [...new Set(fresh.map((i) => nameOf(i.author_id)))];
      const top = fresh[0];
      return { count: fresh.length, names, at: top ? this.clamp(top.x, top.y, 170, 120) : null,
        seen: () => { this.seenAt = Date.now(); try { localStorage.setItem(key, String(this.seenAt)); } catch (e) {} this.serverSet({}); } };
    }

    renderVals() {
      const v = { ...super.renderVals(), ...headerVals(this.props.ctx) };
      v.lampTip = !this.state.friendsOpen;
      v.logOut = (e) => { e?.preventDefault?.(); void this.flush("leave").finally(() => void logOut()); };
      v.pickFileReal = (e) => { const f = e.target.files && e.target.files[0]; if (f) { this.files.friend = f; this.setState({ photoPicked: true }); } };
      return v;
    }

    // ── state changes → backend ──
    setState(patch) {
      const prev = this.state;
      super.setState(patch);
      if (this.syncing) return;
      const next = this.state;
      try { this.observe(prev, next); } catch (e) { this.fail(e); }
    }
    debounce(key, ms, fn) { clearTimeout(this.timers[key]); this.timers[key] = setTimeout(fn, ms); }

    observe(prev, next) {
      // Focus time (feeds tasks, star coins and the calendar).
      const d = (next.focusToday || 0) - (prev.focusToday || 0);
      const mode = next.tmode, task = next.active;
      if (this.pending && (this.pending.task !== prev.active || this.pending.mode !== prev.tmode)) void this.flush("switch", prev);
      if (d > 0 && d < 5) {
        if (!this.pending) this.pending = { sec: 0, task: prev.active, mode: prev.tmode, started: new Date() };
        this.pending.sec += d;
      }
      if (prev.tmode === "pomodoro" && prev.phase === "focus" && next.phase !== "focus" && (next.pomoCount || 0) > (prev.pomoCount || 0)) void this.flush("pomo-done", prev);
      else if (prev.running && !next.running && mode !== "pomodoro") void this.flush("pause");
      if (prev.calM !== next.calM || prev.calY !== next.calY) void this.loadStars();

      // Friends see whether you're focusing.
      const activeT = (next.tasks || []).find((t) => t.id === task);
      const started = mode === "stopwatch" ? next.elapsed > 0 : next.left < next.length;
      const status = next.running && (mode !== "pomodoro" || next.phase === "focus") ? "focusing" : (task != null || started) && !next.running && started ? "paused" : "online";
      // Friends see only whether you're focusing — never which task.
      if (status !== this.status) { this.status = status; this.ctx.current.social.setTimerStatus(status); }

      if (prev.tasks !== next.tasks) this.taskRev = (this.taskRev || 0) + 1;
      if (prev.tasks !== next.tasks) this.syncTasks(prev.tasks || [], next.tasks || []);

      const SET = { pomoFocus: "pomo_focus_sec", pomoShort: "pomo_short_sec", pomoLong: "pomo_long_sec", pomoRounds: "pomo_rounds", autoBreak: "auto_break", autoFocus: "auto_focus", sound: "sound", cdLength: "countdown_sec" };
      const sp = {}; for (const [k, col] of Object.entries(SET)) if (prev[k] !== next[k] && next[k] != null) sp[col] = next[k];
      if (Object.keys(sp).length) { this.settingsPatch = { ...(this.settingsPatch || {}), ...sp }; this.debounce("settings", 600, () => { const p = this.settingsPatch; this.settingsPatch = null; saveTimerSettings(p).catch((e) => this.fail(e)); }); }

      if (prev.allowPosts !== next.allowPosts) updateMyProfile({ allow_board_posts: next.allowPosts }).then(() => this.ctx.current.refreshProfile()).catch((e) => this.fail(e));
      if (prev.profName !== next.profName || prev.profUser !== next.profUser) {
        const p = this.ctx.current.profile, patch = {};
        if (next.profName !== p.display_name) patch.display_name = next.profName;
        if (next.profUser !== p.username) patch.username = next.profUser;
        if (Object.keys(patch).length) updateMyProfile(patch).then(() => this.ctx.current.refreshProfile()).catch((e) => { this.fail(e); this.serverSet({ profName: p.display_name, profUser: p.username }); });
      }

      this.syncFriendActions(prev, next);
      this.syncBoard(prev, next);
      this.syncFriendPosts(prev, next);
    }

    async flush(_why, s = this.state) {
      const p = this.pending; if (!p || p.sec < 1) { this.pending = null; return; }
      this.pending = null;
      const pomoDone = _why === "pomo-done";
      try {
        await logFocus({ task_id: isServerId(p.task) ? p.task : null, mode: p.mode === "pomodoro" && !pomoDone ? "countdown" : p.mode, phase: "focus", started_at: p.started, seconds: p.sec });
        if (_why !== "leave") { void this.loadTasks(); void this.loadStars(); }
      } catch (e) { this.fail(e); }
      void s;
    }

    trackTask(p) {
      this.taskWrites = (this.taskWrites || 0) + 1;
      const done = () => { this.taskWrites--; };
      p.then(done, done);
      return p;
    }
    syncTasks(prevT, nextT) {
      const pm = new Map(prevT.map((t) => [t.id, t])), nm = new Map(nextT.map((t) => [t.id, t]));
      for (const t of nextT) {
        const o = pm.get(t.id);
        if (!o) {
          if (isServerId(t.id)) continue;
          this.trackTask(T.addTask(t.text, t.plan ? t.plan / 60 : null)).then((row) => {
            const dup = this.state.tasks.some((x) => x.id === row.id);
            this.serverSet({ tasks: dup ? this.state.tasks.filter((x) => x.id !== t.id) : this.state.tasks.map((x) => (x.id === t.id ? { ...x, id: row.id } : x)), active: this.state.active === t.id ? row.id : this.state.active });
          }).catch((e) => this.fail(e));
        } else if (isServerId(t.id) && (o.text !== t.text || o.done !== t.done || (o.plan || null) !== (t.plan || null))) {
          this.trackTask(T.updateTask(t.id, { text: t.text, done: t.done, plan_sec: t.plan || null })).catch((e) => this.fail(e));
        }
      }
      for (const t of prevT) if (!nm.has(t.id) && isServerId(t.id)) this.trackTask(T.deleteTask(t.id)).catch((e) => this.fail(e));
    }

    syncFriends() {
      const fr = this.ctx.current.social.friends;
      this.serverSet({
        incoming: fr.filter((f) => f.status === "pending" && f.incoming).map((f) => ({ id: f.id, name: f.display_name, username: f.username })),
        outgoing: fr.filter((f) => f.status === "pending" && !f.incoming).map((f) => ({ id: f.id, name: f.display_name, username: f.username })),
        addedFriends: [], removedFriends: [],
      });
    }
    syncFriendActions(prev, next) {
      const reload = () => this.ctx.current.social.reloadFriends();
      const ids = (a) => new Set((a || []).map((x) => x.id));
      const added = ids(next.addedFriends), pin = ids(prev.incoming), nin = ids(next.incoming), pout = ids(prev.outgoing), nout = ids(next.outgoing);
      for (const id of pin) if (!nin.has(id)) F.respondToRequest(id, added.has(id)).then(reload).catch((e) => this.fail(e));
      for (const o of next.outgoing || []) if (!pout.has(o.id)) F.sendFriendRequest(o.username).then(reload).catch((e) => this.fail(e));
      for (const id of pout) if (!nout.has(id) && !added.has(id)) F.removeFriend(id).then(reload).catch((e) => this.fail(e));
      const prem = new Set(prev.removedFriends || []);
      for (const id of next.removedFriends || []) if (!prem.has(id)) F.removeFriend(id).then(reload).catch((e) => this.fail(e));
    }

    syncBoard(prev, next) {
      const me = this.ctx.current.profile.id;
      // New items made with the board pop-up or the quick note bar.
      const baseLen = this.items.filter((i) => i.kind !== "drawing").length;
      const prevIds = new Set((prev.myPosts || []).map((m) => m.id));
      (next.myPosts || []).forEach((m, k) => {
        if (prevIds.has(m.id)) return;
        const key = "p" + (baseLen + k), at = m.at || (next.pos || {})[key] || [16, 16];
        const done = () => B.listBoard(me).then((rows) => { this.items = rows; this.serverSet({ myPosts: (this.state.myPosts || []).filter((x) => x.id !== m.id) }); return this.loadBoard(); });
        const job = m.img && this.files.board
          ? B.postPhoto(me, this.files.board, m.text || "", { x: at[0], y: at[1] })
          : B.postNote(me, m.text || " ", { x: at[0], y: at[1] }, m.color);
        job.then(done).catch((e) => this.fail(e));
      });
      const prevD = new Set((prev.myDoodles || []).map((m) => m.id));
      const dBase = this.items.filter((i) => i.kind === "drawing").length;
      (next.myDoodles || []).forEach((m, k) => {
        if (prevD.has(m.id)) return;
        const at = m.at || (next.pos || {})["d" + (dBase + k)] || [16, 16];
        const strokes = m.paths ? m.paths.flatMap((p) => pathToStrokes(p.d, p.color)) : pathToStrokes(m.d);
        B.postDrawing(me, strokes, { x: at[0], y: at[1] })
          .then(() => B.listBoard(me)).then((rows) => { this.items = rows; this.serverSet({ myDoodles: (this.state.myDoodles || []).filter((x) => x.id !== m.id) }); })
          .catch((e) => this.fail(e));
      });
      // Moves (drag or arrow keys).
      for (const [k, p] of Object.entries(next.pos || {})) {
        if (!k.startsWith("b:") || (prev.pos || {})[k] === p || next.dragging === k) continue;
        this.debounce("mv" + k, 500, () => B.moveItem(k.slice(2), p[0], p[1], (this.state.z || {})[k]).catch((e) => this.fail(e)));
      }
      if (prev.dragging && prev.dragging.startsWith("b:") && !next.dragging) {
        const k = prev.dragging, p = (next.pos || {})[k];
        if (p) { clearTimeout(this.timers["mv" + k]); B.moveItem(k.slice(2), p[0], p[1], (next.z || {})[k]).catch((e) => this.fail(e)); }
      }
      // Deletes go through after the undo window closes.
      if (prev.undoId && prev.undoId !== next.undoId && (next.deleted || {})[prev.undoId]) this.commitDelete(prev.undoId);
      // Keep / un-keep friends' posts.
      for (const [k, v] of Object.entries(next.kept || {})) {
        if (!k.startsWith("b:") || (prev.kept || {})[k] === v) continue;
        (v ? B.keepItem(k.slice(2)) : B.unkeepItem(k.slice(2))).catch((e) => this.fail(e));
      }
    }
    commitDelete(id) {
      if (!id.startsWith("b:")) return;
      const it = this.items.find((i) => i.id === id.slice(2));
      if (it) B.deleteItem(it).then(() => this.loadBoard()).catch((e) => this.fail(e));
    }

    syncFriendPosts(prev, next) {
      for (const [fid, kindName] of Object.entries(next.sentTo || {})) {
        if ((prev.sentTo || {})[fid] === kindName) continue;
        const at = { x: 40 + Math.random() * (board.w - 260), y: 40 + Math.random() * (board.h - 220) };
        const k = prev.composeKind;
        let job;
        if (k === "note") job = B.postNote(fid, prev.draftMsg || "", at);
        else if (k === "draw") job = B.postDrawing(fid, (prev.miniStrokes || []).map((pts, k) => ({ color: (prev.miniCols || [])[k] || "#2B2A27", width: 3, points: pts })).filter((x) => x.points.length > 1), at);
        else if (k === "photo" && this.files.friend) job = B.postPhoto(fid, this.files.friend, prev.photoCaption || "", at);
        job?.catch((e) => { this.fail(e); const s = { ...(this.state.sentTo || {}) }; delete s[fid]; this.serverSet({ sentTo: s }); });
        if (k === "photo") this.files.friend = null;
      }
    }
  };
}
