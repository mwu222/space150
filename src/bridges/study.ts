// @ts-nocheck — wraps the generated Study board logic with backend sync.
// Offline: the decks, quizzes and subjects are kept on this device. Changes made without a
// connection are saved here too and sent when the connection is back (the latest change wins).
import { sb, myId, storedUserId, isOfflineError } from "../lib/supabase";
import * as St from "../lib/api/study";
import { headerVals } from "./header";

// Saved rows have a bare UUID; ids made on the page (e.g. "p<task uuid>-<time>") do not.
const isServerId = (id) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const pick = (s) => ({ subjectList: s.subjectList || [], quizzes: s.quizzes || [], sets: s.sets || [] });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const cacheKey = (uid) => "space150:study:" + uid;

export function makeStudy(Base) {
  return class StudyBridge extends Base {
    constructor(props) {
      super(props);
      Object.assign(this.state, { quizzes: [], sets: [], files: [], subjectList: [] });
      this.subjects = []; this.cardIds = {}; this.timers = {};
      // What the server is known to hold. Local changes are what differs from it.
      this.base = pick(this.state);
      this.rev = 0; this.running = false; this.again = false;
      this.onOnline = () => { void this.resume(); };
    }
    componentDidMount() {
      super.componentDidMount?.();
      this.uid = storedUserId();
      this.readCache();
      window.addEventListener("online", this.onOnline);
      void this.resume();
    }
    componentWillUnmount() { super.componentWillUnmount?.(); window.removeEventListener("online", this.onOnline); this.gone = true; }
    renderVals() { return { ...super.renderVals(), ...headerVals(this.props.ctx), toggleLamp: () => this.props.ctx?.current.openFriends?.(), lampOpen: false, lampTipClass: "lamptip" }; }
    serverSet(p) { this.syncing = true; try { super.setState(p); } finally { this.syncing = false; } }
    fail(e) { console.error(e); }
    subjId(name) { return this.subjects.find((s) => s.name.toLowerCase() === String(name || "").toLowerCase())?.id; }

    // ── kept on this device ──
    readCache() {
      if (!this.uid) return;
      try {
        const c = JSON.parse(localStorage.getItem(cacheKey(this.uid)) || "null");
        if (!c || !c.state) return;
        this.subjects = c.subjects || []; this.cardIds = c.cardIds || {}; this.base = c.base || pick(c.state);
        this.serverSet({ ...pick(c.state), ...(c.setSubject ? { setSubject: c.setSubject } : {}) });
      } catch { /* ignore a damaged copy */ }
    }
    writeCache() {
      if (!this.uid) return;
      try {
        localStorage.setItem(cacheKey(this.uid), JSON.stringify({ state: pick(this.state), base: this.base, setSubject: this.state.setSubject,
          subjects: this.subjects, cardIds: this.cardIds, savedAt: new Date().toISOString() }));
      } catch { /* storage full or private mode: still works while online */ }
    }
    pending() { return !same(pick(this.state), this.base); }

    // On open and whenever the connection comes back: send what's waiting, then refresh.
    async resume() {
      if (this.pending()) await this.kick(); else await this.loadAll();
    }

    async loadAll() {
      const rev = this.rev;
      try {
        const [subs, quizzes, decks] = await Promise.all([St.listSubjects(), St.listQuizzes(), St.listDecks()]);
        if (this.gone) return;
        if (this.rev !== rev || this.running) { this.needLoad = true; void this.kick(); return; }   // changed meanwhile: send that first
        this.subjects = subs;
        const nameOf = (id) => subs.find((s) => s.id === id)?.name || "General";
        this.cardIds = {};
        const sets = decks.map((d) => { const cards = d.cards || []; this.cardIds[d.id] = cards.map((c) => c.id);
          return { id: d.id, name: d.name, subject: nameOf(d.subject_id), known: cards.map((c, i) => (c.known ? i : -1)).filter((i) => i >= 0), cards: cards.map((c) => [c.front, c.back]) }; });
        const patch = {
          subjectList: subs.map((s) => ({ id: s.id, name: s.name, dot: s.dot, p1: s.paper, p2: s.paper2 })),
          quizzes: quizzes.map((q) => ({ id: q.id, name: q.name, subject: nameOf(q.subject_id), best: q.best_score != null ? q.best_score + " of " + q.best_total : "", items: (q.quiz_items || []).map((i) => [i.question, i.answer]) })),
          sets,
        };
        if (subs.length && !subs.some((s) => s.name === this.state.setSubject)) patch.setSubject = subs[0].name;
        this.base = pick(patch);
        this.serverSet(patch);
        this.writeCache();
      } catch (e) { if (!isOfflineError(e)) this.fail(e); }
    }

    setState(patch) {
      super.setState(patch);
      if (this.syncing) return;
      this.rev++;
      this.writeCache();
      void this.kick();
    }

    // One sync at a time; changes made during a sync are sent right after it.
    async kick() {
      if (this.running) { this.again = true; return; }
      this.running = true;
      let changed = false, offline = false;
      try {
        do { this.again = false; if (await this.push()) changed = true; } while (this.again);
      } catch (e) {
        if (isOfflineError(e)) offline = true;   // kept on this device; sent when back online
        else { this.fail(e); changed = true; }
      } finally { this.running = false; this.writeCache(); }
      if (!offline && (changed || !this.loaded || this.needLoad)) { this.loaded = true; this.needLoad = false; await this.loadAll(); }
    }

    // Send every difference between what the server holds (this.base) and the page.
    // this.base is updated after each step, so a sync cut off part-way never repeats a step.
    async push() {
      const B = this.base, next = pick(this.state);
      let changed = false;
      const swap = (list, item) => list.map((x) => (x.id === item.id ? item : x));
      // Subjects first, so new quizzes/decks can be filed under them.
      if (!same(B.subjectList, next.subjectList)) {
        const pn = new Set(B.subjectList.map((s) => s.name)), nn = new Set(next.subjectList.map((s) => s.name));
        for (const s of next.subjectList) if (!pn.has(s.name)) {
          const user_id = await myId();
          const { data, error } = await sb().from("subjects").insert({ user_id, name: s.name, dot: s.dot, paper: s.p1, paper2: s.p2, position: Date.now() % 1000000 }).select().single();
          if (error) throw error; this.subjects.push(data); B.subjectList = B.subjectList.concat([s]); changed = true;
        }
        for (const s of B.subjectList.slice()) if (!nn.has(s.name)) {
          const id = this.subjId(s.name); if (id) await St.deleteSubject(id);   // deleting moves items to General on the server too
          B.subjectList = B.subjectList.filter((x) => x.name !== s.name); changed = true;
        }
        B.subjectList = next.subjectList;
      }
      if (!same(B.quizzes, next.quizzes)) {
        const pm = new Map(B.quizzes.map((q) => [q.id, q]));
        for (const q of next.quizzes) {
          const o = pm.get(q.id);
          if (!o && !isServerId(q.id)) {
            const id = await St.saveQuiz(null, q.name, await this.ensureSubject(q.subject), q.items.map(([question, answer]) => ({ question, answer })));
            B.quizzes = B.quizzes.concat([{ ...q, best: "" }]); changed = true;
            // Taken before it reached the server (e.g. made and taken offline): send that score too.
            const m = String(q.best || "").match(/^(\d+) of (\d+)$/);
            if (m && id) { await St.recordQuizAttempt(id, Number(m[1]), Number(m[2])); B.quizzes = swap(B.quizzes, q); }
          }
          else if (o && isServerId(q.id) && o.best !== q.best && q.best) { const m = q.best.match(/^(\d+) of (\d+)$/); if (m) await St.recordQuizAttempt(q.id, Number(m[1]), Number(m[2])); B.quizzes = swap(B.quizzes, q); }
        }
        for (const o of B.quizzes.slice()) if (isServerId(o.id) && !next.quizzes.some((q) => q.id === o.id)) { await St.deleteQuiz(o.id); B.quizzes = B.quizzes.filter((x) => x.id !== o.id); changed = true; }
        B.quizzes = next.quizzes;
      }
      if (!same(B.sets, next.sets)) {
        const pm = new Map(B.sets.map((d) => [d.id, d]));
        for (const d of next.sets) {
          const o = pm.get(d.id);
          const toCards = () => d.cards.map(([front, back], i) => ({ front, back, known: d.known.includes(i) }));
          if (!o && !isServerId(d.id)) { await St.saveDeck(null, d.name, await this.ensureSubject(d.subject), toCards()); B.sets = B.sets.concat([d]); changed = true; }
          else if (o && isServerId(d.id)) {
            if (o.name !== d.name || o.subject !== d.subject || !same(o.cards, d.cards)) { await St.saveDeck(d.id, d.name, await this.ensureSubject(d.subject), toCards()); changed = true; }
            else if (!same(o.known, d.known)) {
              const ids = this.cardIds[d.id] || [];
              for (let i = 0; i < d.cards.length; i++) { const k = d.known.includes(i); if (k !== o.known.includes(i) && ids[i]) await St.markCard(ids[i], k); }
            }
            B.sets = swap(B.sets, d);
          }
        }
        for (const o of B.sets.slice()) if (isServerId(o.id) && !next.sets.some((d) => d.id === o.id)) { await St.deleteDeck(o.id); B.sets = B.sets.filter((x) => x.id !== o.id); changed = true; }
        B.sets = next.sets;
      }
      return changed;
    }
    async ensureSubject(name) {
      const id = this.subjId(name); if (id) return id;
      const subs = await St.listSubjects(); this.subjects = subs;
      return this.subjId(name) || subs[0]?.id;
    }
  };
}
