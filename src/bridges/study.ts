// @ts-nocheck — wraps the generated Study board logic with backend sync.
import { sb, myId } from "../lib/supabase";
import * as St from "../lib/api/study";
import { headerVals } from "./header";

// Saved rows have a bare UUID; ids made on the page (e.g. "p<task uuid>-<time>") do not.
const isServerId = (id) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function makeStudy(Base) {
  return class StudyBridge extends Base {
    constructor(props) {
      super(props);
      Object.assign(this.state, { quizzes: [], sets: [], files: [], subjectList: [] });
      this.subjects = []; this.cardIds = {}; this.timers = {};
    }
    componentDidMount() { super.componentDidMount?.(); void this.loadAll(); }
    renderVals() { return { ...super.renderVals(), ...headerVals(this.props.ctx), toggleLamp: () => this.props.ctx?.current.openFriends?.(), lampOpen: false, lampTipClass: "lamptip" }; }
    serverSet(p) { this.syncing = true; try { super.setState(p); } finally { this.syncing = false; } }
    fail(e) { console.error(e); }
    subjId(name) { return this.subjects.find((s) => s.name.toLowerCase() === String(name || "").toLowerCase())?.id; }

    async loadAll() {
      try {
        const [subs, quizzes, decks] = await Promise.all([St.listSubjects(), St.listQuizzes(), St.listDecks()]);
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
        this.serverSet(patch);
      } catch (e) { this.fail(e); }
    }

    setState(patch) {
      const prev = this.state;
      super.setState(patch);
      if (this.syncing) return;
      void this.observe(prev, this.state).catch((e) => this.fail(e));
    }

    async observe(prev, next) {
      let changed = false;
      // Subjects first, so new quizzes/decks can be filed under them.
      if (prev.subjectList !== next.subjectList) {
        const pn = new Set((prev.subjectList || []).map((s) => s.name)), nn = new Set((next.subjectList || []).map((s) => s.name));
        for (const s of next.subjectList || []) if (!pn.has(s.name)) {
          const user_id = await myId();
          const { data, error } = await sb().from("subjects").insert({ user_id, name: s.name, dot: s.dot, paper: s.p1, paper2: s.p2, position: Date.now() % 1000000 }).select().single();
          if (error) throw error; this.subjects.push(data); changed = true;
        }
        for (const s of prev.subjectList || []) if (!nn.has(s.name)) { const id = this.subjId(s.name); if (id) { await St.deleteSubject(id); changed = true; } }
        if (changed) { await this.loadAll(); return; }   // deleting moves items to General on the server too
      }
      if (prev.quizzes !== next.quizzes) {
        const pm = new Map((prev.quizzes || []).map((q) => [q.id, q]));
        for (const q of next.quizzes || []) {
          const o = pm.get(q.id);
          if (!o && !isServerId(q.id)) { await St.saveQuiz(null, q.name, await this.ensureSubject(q.subject), q.items.map(([question, answer]) => ({ question, answer }))); changed = true; }
          else if (o && isServerId(q.id) && o.best !== q.best && q.best) { const m = q.best.match(/(\d+) of (\d+)/); if (m) await St.recordQuizAttempt(q.id, Number(m[1]), Number(m[2])); }
        }
        for (const o of prev.quizzes || []) if (isServerId(o.id) && !(next.quizzes || []).some((q) => q.id === o.id)) { await St.deleteQuiz(o.id); changed = true; }
      }
      if (prev.sets !== next.sets) {
        const pm = new Map((prev.sets || []).map((d) => [d.id, d]));
        for (const d of next.sets || []) {
          const o = pm.get(d.id);
          const toCards = () => d.cards.map(([front, back], i) => ({ front, back, known: d.known.includes(i) }));
          if (!o && !isServerId(d.id)) { await St.saveDeck(null, d.name, await this.ensureSubject(d.subject), toCards()); changed = true; }
          else if (o && isServerId(d.id)) {
            if (o.name !== d.name || o.subject !== d.subject || JSON.stringify(o.cards) !== JSON.stringify(d.cards)) { await St.saveDeck(d.id, d.name, await this.ensureSubject(d.subject), toCards()); changed = true; }
            else if (JSON.stringify(o.known) !== JSON.stringify(d.known)) {
              const ids = this.cardIds[d.id] || [];
              for (let i = 0; i < d.cards.length; i++) { const k = d.known.includes(i); if (k !== o.known.includes(i) && ids[i]) await St.markCard(ids[i], k); }
            }
          }
        }
        for (const o of prev.sets || []) if (isServerId(o.id) && !(next.sets || []).some((d) => d.id === o.id)) { await St.deleteDeck(o.id); changed = true; }
      }
      if (changed) await this.loadAll();
    }
    async ensureSubject(name) {
      const id = this.subjId(name); if (id) return id;
      const subs = await St.listSubjects(); this.subjects = subs;
      return this.subjId(name) || subs[0]?.id;
    }
  };
}
