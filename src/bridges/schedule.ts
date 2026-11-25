// @ts-nocheck — wraps the generated Schedule board logic with backend sync.
import { sb } from "../lib/supabase";
import * as T from "../lib/api/tasks";
import * as S from "../lib/api/schedule";
import { headerVals } from "./header";
import { updateMyProfile } from "../lib/api/auth";

// Saved rows have a bare UUID; ids made on the page (e.g. "p<task uuid>-<time>") do not.
const isServerId = (id) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const FROM = "1900-01-01", TO = "2999-12-31";
const BUILTIN = ["class", "social", "deadline", "other"];
// Board kinds: a built-in kind, "t:<uuid>" for a saved custom tag, or a local id while the tag is being saved.
const boardKind = (row) => (row.tag_id ? "t:" + row.tag_id : row.kind);

export function makeSchedule(Base) {
  return class ScheduleBridge extends Base {
    constructor(props) {
      super(props);
      Object.assign(this.state, { tasks: [], dayPlan: [], weekItems: [], monthItems: [], notes: {}, customTags: [], hiddenKinds: props.ctx?.current?.profile?.hidden_kinds || [] });
      this.tagPending = new Map();
      this.timers = {}; this.waiting = new Set(); this.inflight = 0; this.rev = 0;
    }
    componentDidMount() {
      super.componentDidMount?.();
      void this.loadAll();
      this.ch = sb().channel("schedule-board-" + Math.random().toString(36).slice(2))
        .on("postgres_changes", { event: "*", schema: "public", table: "schedule_items" }, () => this.soon())
        .on("postgres_changes", { event: "*", schema: "public", table: "task_placements" }, () => this.soon())
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => this.soon())
        .on("postgres_changes", { event: "*", schema: "public", table: "schedule_tags" }, () => this.soon())
        .subscribe();
    }
    componentWillUnmount() { super.componentWillUnmount?.(); if (this.ch) void sb().removeChannel(this.ch); }
    soon() { this.debounce("reload", 400, () => void this.loadAll(), false); }
    renderVals() { return { ...super.renderVals(), ...headerVals(this.props.ctx), toggleLamp: () => this.props.ctx?.current.openFriends?.(), lampOpen: false, lampTipClass: "lamptip" }; }
    serverSet(p) { this.syncing = true; try { super.setState(p); } finally { this.syncing = false; } }
    // Writes waiting or in flight. A reload that overlaps one would show old positions for a moment, so it waits.
    debounce(k, ms, fn, write = true) {
      clearTimeout(this.timers[k]);
      if (write) this.waiting.add(k);
      this.timers[k] = setTimeout(() => { this.waiting.delete(k); const r = fn(); if (write) this.track(r); }, ms);
    }
    track(p) {
      if (!p || !p.then) return p;
      this.inflight++;
      const done = () => { this.inflight--; };
      p.then(done, done);
      return p;
    }
    busy() { return this.inflight > 0 || this.waiting.size > 0; }
    fail(e) { console.error(e); }

    async loadAll() {
      if (this.state.movingId || this.wdrag || this.bd || this.td || this.busy()) { this.soon(); return; }   // don't jump mid-drag or mid-save
      const rev = this.rev;
      try {
        const [tasks, items, plans, months, notes, tags] = await Promise.all([T.listTasks(), S.listScheduleItems(FROM, TO), S.listPlacements(FROM, TO), S.listMonthItems(FROM, TO), S.listNotes(FROM, TO), S.listTags()]);
        const keepLocal = (arr) => (arr || []).filter((x) => !isServerId(x.id));
        if (rev !== this.rev || this.busy()) { this.soon(); return; }   // something changed while loading
        const noteMap = {}; for (const n of notes) noteMap[n.day] = n.body;
        this.serverSet({
          tasks: tasks.map((t) => ({ id: t.id, text: t.text, done: t.done, plan: t.plan_sec || 0, logged: t.logged_sec, showFrom: t.show_from || null, note: t.note || "", kind: t.kind || t.tag_id ? boardKind(t) : null })).concat(keepLocal(this.state.tasks)),
          weekItems: items.map((i) => ({ id: i.id, date: i.day, start: i.start_min, dur: i.duration_min, title: i.title, kind: boardKind(i) })).concat(keepLocal(this.state.weekItems)),
          dayPlan: plans.map((p) => ({ id: p.id, date: p.day, start: p.start_min, taskId: p.task_id })).concat(keepLocal(this.state.dayPlan)),
          monthItems: months.map((m) => ({ id: m.id, date: m.day, title: m.title, kind: boardKind(m) })).concat(keepLocal(this.state.monthItems)),
          hiddenKinds: this.props.ctx?.current?.profile?.hidden_kinds || this.state.hiddenKinds || [],
          customTags: tags.map((t) => ({ id: "t:" + t.id, label: t.label, color: t.color })).concat((this.state.customTags || []).filter((t) => !t.id.startsWith("t:"))),
          notes: { ...noteMap, ...(this.dirtyNotes || {}) },
        });
      } catch (e) { this.fail(e); }
    }

    setState(patch) {
      const prev = this.state;
      super.setState(patch);
      if (this.syncing) return;
      this.rev++;
      try { this.observe(prev, this.state); } catch (e) { this.fail(e); }
    }

    observe(prev, next) {
      if (prev.tasks !== next.tasks) {
        const pm = new Map((prev.tasks || []).map((t) => [t.id, t]));
        // Tasks added on the Day view.
        for (const t of next.tasks || []) if (!pm.has(t.id) && !isServerId(t.id))
          this.track(T.addTask(t.text, t.plan ? t.plan / 60 : null, t.showFrom)).then((row) => {
            const st = this.state;
            this.serverSet({ tasks: st.tasks.map((x) => (x.id === t.id ? { ...x, id: row.id } : x)), dayPlan: st.dayPlan.map((b) => (b.taskId === t.id ? { ...b, taskId: row.id } : b)) });
            const waiting = (this.state.dayPlan || []).filter((b) => b.taskId === row.id && !isServerId(b.id));
            for (const b of waiting) this.track(S.placeTask(row.id, b.date, b.start)).then((pr) => this.serverSet({ dayPlan: this.state.dayPlan.map((y) => (y.id === b.id ? { ...y, id: pr.id } : y)) })).catch((e) => this.fail(e));
          }).catch((e) => this.fail(e));
        for (const t of next.tasks || []) { const o = pm.get(t.id); if (o && isServerId(t.id) && (o.text !== t.text || (o.plan || 0) !== (t.plan || 0) || (o.note || "") !== (t.note || "") || (o.kind || null) !== (t.kind || null))) this.track((async () => T.updateTask(t.id, { text: t.text, plan_sec: t.plan || null, note: t.note || null, ...(t.kind ? await this.kindCols(t.kind) : { kind: null, tag_id: null }) }))()).catch((e) => this.fail(e)); }
      }
      if (prev.weekItems !== next.weekItems) this.syncList("w", prev.weekItems, next.weekItems, {
        create: async (x) => S.addScheduleItem({ day: x.date, start_min: x.start, duration_min: x.dur, title: x.title, ...(await this.kindCols(x.kind)) }),
        update: async (x) => S.updateScheduleItem(x.id, { day: x.date, start_min: x.start, duration_min: x.dur, title: x.title, ...(await this.kindCols(x.kind)) }),
        remove: (x) => S.deleteScheduleItem(x.id), list: "weekItems",
        same: (a, b) => a.date === b.date && a.start === b.start && a.dur === b.dur && a.title === b.title && a.kind === b.kind,
      });
      if (prev.hiddenKinds !== next.hiddenKinds) {
        const hidden_kinds = next.hiddenKinds || [];
        this.track(updateMyProfile({ hidden_kinds }).then(() => this.props.ctx?.current?.refreshProfile?.())).catch((e) => this.fail(e));
      }
      if (prev.customTags !== next.customTags) this.syncTags(prev.customTags || [], next.customTags || []);
      if (prev.dayPlan !== next.dayPlan) this.syncPlans(prev.dayPlan || [], next.dayPlan || []);
      if (prev.monthItems !== next.monthItems) this.syncList("m", prev.monthItems, next.monthItems, {
        create: async (x) => S.addMonthItem({ day: x.date, title: x.title, ...(await this.kindCols(x.kind)) }),
        update: async (x) => S.updateMonthItem(x.id, await this.kindCols(x.kind)), remove: (x) => S.deleteMonthItem(x.id), list: "monthItems", same: (a, b) => a.kind === b.kind,
      });
      if (prev.notes !== next.notes) {
        for (const [day, body] of Object.entries(next.notes || {})) {
          if ((prev.notes || {})[day] === body) continue;
          this.dirtyNotes = { ...(this.dirtyNotes || {}), [day]: body };
          this.debounce("note" + day, 600, () => S.saveNote(day, body).then(() => { delete this.dirtyNotes[day]; }).catch((e) => this.fail(e)));
        }
      }
    }

    syncList(prefix, prevL = [], nextL = [], api) {
      const pm = new Map(prevL.map((x) => [x.id, x])), nm = new Map(nextL.map((x) => [x.id, x]));
      for (const x of nextL) {
        const o = pm.get(x.id);
        if (!o && !isServerId(x.id)) {
          this.track(api.create(x)).then((row) => this.serverSet({ [api.list]: this.state[api.list].map((y) => (y.id === x.id ? { ...y, id: row.id } : y)) })).catch((e) => this.fail(e));
        } else if (o && isServerId(x.id) && !api.same(o, x)) {
          this.debounce(prefix + x.id, 450, () => api.update(this.state[api.list].find((y) => y.id === x.id) || x).catch((e) => this.fail(e)));
        }
      }
      for (const x of prevL) if (!nm.has(x.id) && isServerId(x.id)) this.track(api.remove(x)).catch((e) => this.fail(e));
    }

    // kind + tag_id columns for a board kind (waits for a brand-new tag to be saved first).
    async kindCols(kind) {
      if (BUILTIN.includes(kind)) return { kind, tag_id: null };
      if (kind && kind.startsWith("t:")) return { kind: "other", tag_id: kind.slice(2) };
      const p = this.tagPending.get(kind);
      return { kind: "other", tag_id: p ? await p.catch(() => null) : null };
    }

    syncTags(prevL, nextL) {
      const pm = new Set(prevL.map((t) => t.id)), nm = new Set(nextL.map((t) => t.id));
      for (const t of nextL) {
        if (pm.has(t.id) || t.id.startsWith("t:")) continue;
        const p = this.track(S.addTag(t.label, t.color || 0)).then((row) => {
          const nid = "t:" + row.id, fix = (arr) => (arr || []).map((b) => (b.kind === t.id ? { ...b, kind: nid } : b)), st = this.state;
          this.serverSet({
            customTags: (st.customTags || []).map((x) => (x.id === t.id ? { ...x, id: nid } : x)),
            weekItems: fix(st.weekItems), monthItems: fix(st.monthItems), tasks: fix(st.tasks),
            ed: st.ed && st.ed.kind === t.id ? { ...st.ed, kind: nid } : st.ed,
            wKind: st.wKind === t.id ? nid : st.wKind, mKind: st.mKind === t.id ? nid : st.mKind,
          });
          return row.id;
        });
        p.catch((e) => { this.fail(e); this.serverSet({ customTags: (this.state.customTags || []).filter((x) => x.id !== t.id) }); });
        this.tagPending.set(t.id, p);
      }
      for (const t of prevL) if (!nm.has(t.id) && t.id.startsWith("t:")) this.track(S.deleteTag(t.id.slice(2))).catch((e) => this.fail(e));
    }

    syncPlans(prevL, nextL) {
      const pm = new Map(prevL.map((x) => [x.id, x])), nm = new Map(nextL.map((x) => [x.id, x]));
      const added = nextL.filter((x) => !pm.has(x.id));
      for (const x of added) {
        if (isServerId(x.id) || !isServerId(x.taskId)) continue;
        this.track(S.placeTask(x.taskId, x.date, x.start)).then((row) => this.serverSet({ dayPlan: this.state.dayPlan.filter((y) => y.id !== row.id || y.id === x.id).map((y) => (y.id === x.id ? { ...y, id: row.id } : y)) })).catch((e) => this.fail(e));
      }
      for (const x of nextL) {
        const o = pm.get(x.id);
        if (o && isServerId(x.id) && (o.start !== x.start || o.date !== x.date))
          this.debounce("p" + x.id, 450, () => { const cur = this.state.dayPlan.find((y) => y.id === x.id) || x; return S.movePlacement(cur.id, cur.taskId, cur.date, cur.start).catch((e) => this.fail(e)); });
      }
      // A removed placement whose task was re-placed on the same day is the same row (upsert) — don't delete it.
      for (const x of prevL) if (!nm.has(x.id) && isServerId(x.id) && !added.some((a) => a.taskId === x.taskId && a.date === x.date)) this.track(S.unplaceTask(x.id)).catch((e) => this.fail(e));
    }
  };
}
