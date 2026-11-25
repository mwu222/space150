// GENERATED from StudySpace.dc.html by tools/board2react.py. Don't edit by hand.
// @ts-nocheck
import { DCLogic } from "../runtime/dc";

export default class StudyLogic extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      addQuizOpen: false, quizMenu: false, aqMode: 'import', aqRows: [], aqTried: false, aqName: '', aqSubject: null, aqTab: 'paste', aqText: '', aqFileText: '', aqFileName: '', aqDragHot: false, aqCopied: false,
      qz: null,
      quizzes: [
        { id: 1, name: 'Cell biology check', subject: 'General', best: '3 of 4', items: [['What does the mitochondria do?', 'Produces energy (ATP) for the cell through respiration'], ['What is the job of ribosomes?', 'They build proteins'], ['Where is DNA stored in a plant or animal cell?', 'In the nucleus'], ['What does the cell membrane control?', 'What enters and leaves the cell']] },
        { id: 2, name: 'Derivatives practice', subject: 'General', best: '', items: [['What is the derivative of x³?', '3x²'], ['State the product rule.', '(fg)′ = f′g + fg′'], ['What is the derivative of sin(x)?', 'cos(x)']] },
        { id: 3, name: 'Causes of WWI', subject: 'General', best: '', items: [['Name the four MAIN causes of WWI.', 'Militarism, alliances, imperialism, nationalism'], ['Whose assassination triggered WWI?', 'Archduke Franz Ferdinand'], ['In what year did WWI begin?', '1914']] }
      ],
      query: '', subject: 'All', uploadOpen: false, picked: [], upSubject: null, upTags: [], tagDraft: '', dragHot: false,
      files: [
        { name: 'Chapter 4 notes', subject: 'General', type: 'PDF', abbr: 'PDF', tags: ['notes', 'exam'] },
        { name: 'Cell structure diagram', subject: 'General', type: 'Image', abbr: 'IMG', tags: [] },
        { name: 'Problem set 3', subject: 'General', type: 'PDF', abbr: 'PDF', tags: ['homework'] },
        { name: 'Formula sheet', subject: 'General', type: 'Document', abbr: 'DOC', tags: ['exam'] },
        { name: 'Essay rubric', subject: 'General', type: 'Document', abbr: 'DOC', tags: [] },
        { name: 'Reading list', subject: 'General', type: 'Link', abbr: 'URL', tags: ['reading'] },
        { name: 'Lecture 7 slides', subject: 'General', type: 'Slides', abbr: 'PPT', tags: ['lecture'] }
      ], deckMenu: false, editor: null, sm: null, subjectList: [{ name: 'General', dot: '#8A8273', p1: '#F4F1EA', p2: '#E9E4D8' }], importOpen: false, importTab: 'paste', pasteText: '', fileLoaded: false,
      setName: '', setSubject: 'General', copied: false, studyId: null, order: [], idx: 0, flipped: false, roundKnown: [], roundLearning: [],
      sets: [
        { id: 1, name: 'Cell biology basics', subject: 'General', known: [0, 1], cards: [['Mitochondria', 'Makes energy (ATP) for the cell'], ['Ribosome', 'Builds proteins'], ['Nucleus', 'Holds the cell’s DNA'], ['Cell membrane', 'Controls what enters and leaves the cell'], ['Chloroplast', 'Where photosynthesis happens']] },
        { id: 2, name: 'Derivative rules', subject: 'General', known: [0], cards: [['Power rule', 'd/dx xⁿ = n·xⁿ⁻¹'], ['Product rule', '(fg)′ = f′g + fg′'], ['Chain rule', 'f(g(x))′ = f′(g(x))·g′(x)']] },
        { id: 3, name: 'Essay vocabulary', subject: 'General', known: [], cards: [['Thesis', 'The main claim of the essay'], ['Counterargument', 'An opposing view you address'], ['Synthesis', 'Combining sources into one argument']] }
      ]
    };
  }
  componentWillUnmount() { clearTimeout(this.ct); clearTimeout(this.aqt); }
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
    const dots = { Biology: '#6B8A5E', Math: '#8C7BC4', English: '#E8A838', History: '#C8553D' };
    const papers = { Biology: ['#F2F5EE', '#E6EDE0'], Math: ['#F3EEF7', '#E8E0F0'], English: ['#FBF3D9', '#F3E7BF'], History: ['#FBE9E2', '#F3D8CD'] };
    const NS_PAL = [['Teal', '#4E8C8A', '#EAF3F2', '#D9E9E7'], ['Blue', '#5B7DB8', '#EDF1F8', '#DCE4F1'], ['Pink', '#C46A93', '#F8ECF2', '#F0DCE6'], ['Brown', '#9A7552', '#F4EEE7', '#E9DFD3'], ['Slate', '#6E7681', '#EFF0F2', '#E1E3E7'], ['Olive', '#8E8A3E', '#F4F3E6', '#E8E6CF']];
    const SL = st.subjectList;
    SL.forEach((cs) => { dots[cs.name] = cs.dot; papers[cs.name] = [cs.p1, cs.p2]; });
    dots.General = dots.General || '#8A8273'; papers.General = papers.General || ['#F4F1EA', '#E9E4D8'];
    const allSubjects = SL.map((cs) => cs.name);
    const sm = st.sm || {};
    const deleteSubject = (name) => {
      const s0 = this.state;
      let list = s0.subjectList.filter((x) => x.name !== name);
      const usedBy = (arr) => (arr || []).some((x) => x.subject === name);
      const used = usedBy(s0.sets) || usedBy(s0.quizzes) || usedBy(s0.files);
      const fallback = used || !list.length ? 'General' : null;
      if (fallback && !list.some((x) => x.name === 'General')) list = list.concat([{ name: 'General', dot: '#8A8273', p1: '#F4F1EA', p2: '#E9E4D8' }]);
      const mv = (x) => x.subject === name ? { ...x, subject: 'General' } : x;
      const first = list[0] ? list[0].name : 'General';
      const next = { subjectList: list, sm: { ...s0.sm, confirm: null }, sets: s0.sets.map(mv), quizzes: s0.quizzes.map(mv) };
      ['files', 'materials'].forEach((k) => { if (Array.isArray(s0[k])) next[k] = s0[k].map(mv); });
      if (s0.subject === name) next.subject = 'All';
      if (s0.setSubject === name) next.setSubject = first;
      if (s0.upSubject === name) next.upSubject = null;
      if (s0.aqSubject === name) next.aqSubject = null;
      if (s0.editor && s0.editor.subject === name) next.editor = { ...s0.editor, subject: fallback || first };
      this.setState(next);
    };
    const mkSM = (ctx, P, cur, select) => {
      const here = sm.ctx === ctx, form = here ? sm.form : null, manage = here && !!sm.manage, confirm = here ? sm.confirm : null;
      const setSM = (o) => this.setState({ sm: { ctx, form: null, manage: false, confirm: null, ...(this.state.sm && this.state.sm.ctx === ctx ? this.state.sm : {}), ...o } });
      const add = () => {
        const f = this.state.sm && this.state.sm.form; if (!f) return;
        const name = f.name.trim().replace(/\s+/g, ' ');
        if (!name) return setSM({ form: { ...f, err: 'Type a subject name.' } });
        if (this.state.subjectList.some((x) => x.name.toLowerCase() === name.toLowerCase())) return setSM({ form: { ...f, err: 'You already have that subject.' } });
        const p = NS_PAL[f.color] || NS_PAL[0];
        this.setState({ subjectList: this.state.subjectList.concat([{ name, dot: p[1], p1: p[2], p2: p[3] }]), sm: { ctx, form: null, manage: false, confirm: null } });
        select(name);
      };
      const uses = (name) => { const n = st.sets.filter((x) => x.subject === name).length, q = st.quizzes.filter((x) => x.subject === name).length; const parts = []; if (n) parts.push(n + (n === 1 ? ' deck' : ' decks')); if (q) parts.push(q + (q === 1 ? ' quiz' : ' quizzes')); return parts.join(' and '); };
      const o = {};
      o[P + 'Chips'] = allSubjects.map((label) => { const on = cur === label; return { label, on, dot: dots[label], bg: on ? papers[label][0] : '#FFFFFF', border: on ? '#2B2A27' : '#D8D1C2', pick: () => select(label), showDel: manage, delLabel: 'Delete subject ' + label, del: () => setSM({ confirm: label, form: null }) }; });
      o[P + 'NewBtn'] = !form && !manage;
      o[P + 'Open'] = () => setSM({ form: { name: '', color: 0, err: '' }, manage: false, confirm: null });
      o[P + 'Manage'] = manage; o[P + 'ManageLabel'] = manage ? 'Done' : 'Edit subjects';
      o[P + 'ToggleManage'] = () => setSM({ manage: !manage, form: null, confirm: null });
      o[P + 'ConfirmOn'] = !!confirm;
      o[P + 'ConfirmText'] = confirm ? 'Delete “' + confirm + '”?' + (uses(confirm) ? ' Its ' + uses(confirm) + ' will move to General.' : '') : '';
      o[P + 'ConfirmNo'] = () => setSM({ confirm: null });
      o[P + 'ConfirmYes'] = () => { if (confirm) deleteSubject(confirm); };
      o[P + 'FormOn'] = !!form;
      o[P + 'Name'] = form ? form.name : ''; o[P + 'OnName'] = (e) => setSM({ form: { ...this.state.sm.form, name: e.target.value, err: '' } });
      o[P + 'Err'] = form ? form.err : '';
      o[P + 'Colors'] = NS_PAL.map(([label, dot, p1], i) => { const on2 = !!form && form.color === i; return { label, dot, paper: p1, on: on2, ring: on2 ? '#2B2A27' : 'transparent', pick: () => setSM({ form: { ...this.state.sm.form, color: i } }) }; });
      o[P + 'Key'] = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
      o[P + 'Add'] = add; o[P + 'Cancel'] = () => setSM({ form: null });
      return o;
    };
    const allFiles = st.files;
    const q = st.query.trim().toLowerCase();
    const files = allFiles.filter((f) => (st.subject === 'All' || f.subject === st.subject) && (!q || f.name.toLowerCase().includes(q) || (f.tags || []).some((t) => t.includes(q.replace(/^#/, '')))))
      .map((f) => ({ ...f, paper: papers[f.subject][0], hasTags: (f.tags || []).length > 0, tagList: (f.tags || []).map((t) => ({ t })) }));
    const subjects = ['All'].concat(allSubjects).map((label) => {
      const on = st.subject === label;
      return { label, on, bg: on ? '#FBF3D9' : '#FFFFFF', border: on ? '#2B2A27' : '#D8D1C2', dot: dots[label] || '#2B2A27', pick: () => this.setState({ subject: label }) };
    });

    const kindOf = (name) => {
      const ext = (name.split('.').pop() || '').toLowerCase();
      if (['pdf'].includes(ext)) return ['PDF', 'PDF'];
      if (['doc', 'docx', 'txt', 'rtf', 'odt', 'md'].includes(ext)) return ['Document', 'DOC'];
      if (['ppt', 'pptx', 'key', 'odp'].includes(ext)) return ['Slides', 'PPT'];
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'].includes(ext)) return ['Image', 'IMG'];
      if (['csv', 'xls', 'xlsx'].includes(ext)) return ['Spreadsheet', 'XLS'];
      return ['File', (ext || 'FILE').toUpperCase().slice(0, 4)];
    };
    const fmtSize = (b) => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
    const addFiles = (list) => {
      const arr = Array.from(list || []).map((f) => ({ key: f.name + ':' + f.size + ':' + Math.random(), name: f.name, size: f.size }));
      if (arr.length) this.setState({ picked: this.state.picked.concat(arr), dragHot: false });
    };
    const addTag = (raw) => {
      const t = String(raw || '').trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
      if (!t || this.state.upTags.includes(t)) { this.setState({ tagDraft: '' }); return; }
      this.setState({ upTags: this.state.upTags.concat([t]), tagDraft: '' });
    };
    const upReady = st.picked.length > 0 && !!st.upSubject;
    const qParse = (text) => {
      const ok = [], bad = [];
      String(text || '').split(/\r?\n/).map((l) => l.trim()).filter((l) => l).forEach((l) => {
        let parts = l.split(/\s*[|\t]\s*/);
        if (parts.length < 2 && l.indexOf(',') > -1) { const m = l.match(/^"?([^"]*?)"?\s*,\s*"?(.*?)"?$/); if (m) parts = [m[1], m[2]]; }
        if (parts.length >= 2 && parts[0] && parts.slice(1).join(' | ').trim()) ok.push([parts[0].trim(), parts.slice(1).join(' | ').trim()]); else bad.push(l);
      });
      return { ok, bad };
    };
    const aqSource = st.aqTab === 'paste' ? st.aqText : st.aqFileText;
    const aqParsed = qParse(aqSource);
    const aqCreate = st.aqMode === 'create';
    const aqRowsArr = st.aqRows || [];
    const aqHalf = aqCreate ? aqRowsArr.findIndex((r) => !!r.q.trim() !== !!r.a.trim()) : -1;
    const aqItems = aqCreate ? aqRowsArr.filter((r) => r.q.trim() && r.a.trim()).map((r) => [r.q.trim(), r.a.trim()]) : aqParsed.ok;
    const aqReady = aqItems.length > 0 && aqHalf < 0 && st.aqName.trim().length > 0 && !!st.aqSubject;
    const readFile = (file) => {
      if (!file) return;
      try {
        const r = new FileReader();
        r.onload = () => this.setState({ aqFileText: String(r.result || ''), aqFileName: file.name, aqDragHot: false, aqName: this.state.aqName || file.name.replace(/\.[^.]+$/, '') });
        r.readAsText(file);
      } catch (e) { this.setState({ aqFileName: file.name, aqDragHot: false }); }
    };
    const stop = new Set(['the', 'and', 'for', 'are', 'with', 'that', 'this', 'from', 'into', 'its', 'they', 'what', 'which', 'their', 'there', 'about', 'your']);
    const words = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9²³′\s]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !stop.has(w));
    const z = st.qz;
    const quiz = z ? st.quizzes.find((x) => x.id === z.id) : null;
    const qTotal = z ? z.order.length : 0;
    const qOn = !!quiz && z.idx < qTotal;
    const qItem = qOn ? quiz.items[z.order[z.idx]] : null;
    let overlap = 0;
    if (qItem && z.phase === 'review') { const key = Array.from(new Set(words(qItem[1]))); const mine = new Set(words(z.draft)); overlap = key.length ? Math.round(key.filter((w) => mine.has(w)).length / key.length * 100) : 0; }
    const startQuiz = (q, onlyIdx) => this.setState({ qz: { id: q.id, order: onlyIdx && onlyIdx.length ? onlyIdx : q.items.map((_, i) => i), idx: 0, phase: 'answer', draft: '', results: [] }, addQuizOpen: false });
    const grade = (mark) => {
      const res = z.results.concat([{ i: z.order[z.idx], mark, draft: z.draft, hlA: z.hlA || [], hlY: z.hlY || [] }]);
      const next = z.idx + 1;
      let quizzes = st.quizzes;
      if (next >= z.order.length && z.order.length === quiz.items.length) {
        const pts = res.reduce((a, r) => a + (r.mark === 'got' ? 1 : r.mark === 'partly' ? 0.5 : 0), 0);
        const prev = parseFloat(String(quiz.best || '0').split(' ')[0]) || 0;
        if (!quiz.best || pts > prev) quizzes = st.quizzes.map((x) => x.id === quiz.id ? { ...x, best: pts + ' of ' + quiz.items.length } : x);
      }
      this.setState({ quizzes, qz: { ...z, results: res, idx: next, phase: 'answer', draft: '', hlA: [], hlY: [] } });
    };
    const tok = (t) => String(t || '').split(/\s+/).filter((w) => w);
    const hlTokens = (text, key, kind) => {
      const set = (z && z[key]) || [];
      return tok(text).map((w, i) => {
        const on = set.includes(i);
        return {
          t: w, on,
          bg: on ? (kind === 'wrong' ? '#F7D7CC' : '#FCE7A8') : 'transparent',
          fg: '#2B2A27',
          deco: on && kind === 'wrong' ? 'line-through' : 'none',
          label: (on ? 'Remove highlight from ' : (kind === 'wrong' ? 'Mark as wrong: ' : 'Mark as missed: ')) + w,
          toggle: () => { const cur = this.state.qz; const s2 = (cur[key] || []); this.setState({ qz: { ...cur, [key]: on ? s2.filter((x) => x !== i) : s2.concat([i]) } }); }
        };
      });
    };
    const markInfo = { got: ['GOT IT', '#E5EEDF', '#3E6B33'], partly: ['PARTLY', '#FBF0D2', '#7A5200'], missed: ['MISSED', '#FBE9E2', '#9A3B1C'] };
    const qPts = z ? z.results.reduce((a, r) => a + (r.mark === 'got' ? 1 : r.mark === 'partly' ? 0.5 : 0), 0) : 0;
    const missedIdx = z ? z.results.filter((r) => r.mark !== 'got').map((r) => r.i) : [];
    const sample = 'Photosynthesis | Turning light into chemical energy\nStomata | Pores that let gases in and out\nXylem | Carries water up the plant\nPhloem | Carries sugars around the plant';
    const source = st.importTab === 'paste' ? st.pasteText : (st.fileLoaded ? sample : '');
    const lines = source.split('\n').map((l) => l.trim()).filter((l) => l);
    const parsed = [], bad = [];
    lines.forEach((l) => {
      const parts = l.split(/\s*[|\t]\s*/);
      if (parts.length >= 2 && parts[0] && parts.slice(1).join(' | ')) parsed.push([parts[0], parts.slice(1).join(' | ')]); else bad.push(l);
    });
    const ready = parsed.length > 0 && st.setName.trim().length > 0;

    const studySet = st.sets.find((s) => s.id === st.studyId);
    const ed = st.editor;
    const setEd = (o) => this.setState({ editor: { ...this.state.editor, ...o } });
    const openEdit = (s) => this.setState({ sm: null, deckMenu: false, importOpen: false, studyId: null, editor: { mode: 'edit', id: s.id, name: s.name, subject: s.subject, rows: s.cards.map((c, i) => ({ k: 'c' + i, f: c[0], b: c[1], oi: i })), err: '', confirmDel: false } });
    const edVals = {
      editorOpen: !!ed, edTitle: ed && ed.mode === 'edit' ? 'Edit deck' : 'Create a deck',
      edName: ed ? ed.name : '', edOnName: (e) => setEd({ name: e.target.value, err: '' }),
      edSubjects: allSubjects.map((label) => { const on = !!ed && ed.subject === label; return { label, on, dot: dots[label], bg: on ? papers[label][0] : '#FFFFFF', border: on ? '#2B2A27' : '#D8D1C2', pick: () => setEd({ subject: label }) }; }),
      edCount: ed ? (() => { const n = ed.rows.filter((r) => r.f.trim() && r.b.trim()).length; return n + (n === 1 ? ' card' : ' cards'); })() : '',
      edRows: !ed ? [] : ed.rows.map((r, i) => {
        const half = !!(r.f.trim()) !== !!(r.b.trim());
        const upd = (o) => setEd({ rows: this.state.editor.rows.map((x) => x.k === r.k ? { ...x, ...o } : x), err: '' });
        return { n: i + 1, f: r.f, b: r.b, border: half && ed.err ? '#C8553D' : '#D8D1C2', frontLabel: 'Card ' + (i + 1) + ' front', backLabel: 'Card ' + (i + 1) + ' back', removeLabel: 'Remove card ' + (i + 1),
          onF: (e) => upd({ f: e.target.value }), onB: (e) => upd({ b: e.target.value }),
          remove: () => setEd({ rows: this.state.editor.rows.filter((x) => x.k !== r.k), err: '' }) };
      }),
      edAddRow: () => { this.rk = (this.rk || 0) + 1; setEd({ rows: this.state.editor.rows.concat([{ k: 'a' + this.rk + '-' + Date.now(), f: '', b: '', oi: -1 }]) }); setTimeout(() => { try { const el = document.querySelector('.deckrows'); if (el) { el.scrollTop = el.scrollHeight; const ins = el.querySelectorAll('input'); if (ins.length > 1) ins[ins.length - 2].focus(); } } catch (e) {} }, 30); },
      ...mkSM('deck', 'ds', ed ? ed.subject : null, (name) => this.setState({ editor: { ...this.state.editor, subject: name } })),
      edErrOn: !!(ed && ed.err), edErr: ed ? ed.err : '',
      edCanDelete: !!ed && ed.mode === 'edit',
      edDelLabel: ed && ed.confirmDel ? 'TAP AGAIN TO DELETE' : 'DELETE DECK',
      edDelBg: ed && ed.confirmDel ? '#C8553D' : '#FFFFFF', edDelFg: ed && ed.confirmDel ? '#FFFFFF' : '#B5562E',
      edDelete: () => { if (!ed) return; if (!ed.confirmDel) return setEd({ confirmDel: true }); this.setState({ editor: null, sets: st.sets.filter((s) => s.id !== ed.id) }); },
      edCancel: () => this.setState({ editor: null }),
      edSave: () => {
        if (!ed) return;
        const name = ed.name.trim();
        if (!name) return setEd({ err: 'Give the deck a name.' });
        const halfIdx = ed.rows.findIndex((r) => !!(r.f.trim()) !== !!(r.b.trim()));
        if (halfIdx >= 0) return setEd({ err: 'Card ' + (halfIdx + 1) + ' needs both a front and a back, or remove it.' });
        const rows = ed.rows.filter((r) => r.f.trim() && r.b.trim());
        if (!rows.length) return setEd({ err: 'Add at least one card.' });
        const cards = rows.map((r) => [r.f.trim(), r.b.trim()]);
        if (ed.mode === 'create') return this.setState({ editor: null, sets: [{ id: Date.now(), name, subject: ed.subject, known: [], cards }].concat(st.sets) });
        const old = st.sets.find((s) => s.id === ed.id);
        const known = [];
        rows.forEach((r, i) => { if (old && r.oi >= 0 && old.known.indexOf(r.oi) >= 0 && old.cards[r.oi] && old.cards[r.oi][0] === cards[i][0] && old.cards[r.oi][1] === cards[i][1]) known.push(i); });
        this.setState({ editor: null, sets: st.sets.map((s) => s.id === ed.id ? { ...s, name, subject: ed.subject, cards, known } : s) });
      }
    };
    const total = st.order.length;
    const active = studySet && st.idx < total;
    const cur = active ? studySet.cards[st.order[st.idx]] : null;
    const startStudy = (set, onlyLearning) => {
      const idxs = set.cards.map((_, i) => i).filter((i) => !onlyLearning || !set.known.includes(i));
      this.setState({ studyId: set.id, order: idxs.length ? idxs : set.cards.map((_, i) => i), idx: 0, flipped: false, roundKnown: [], roundLearning: [], importOpen: false });
    };
    const mark = (knowIt) => {
      const i = st.order[st.idx];
      const sets = st.sets.map((s) => s.id !== st.studyId ? s : { ...s, known: knowIt ? Array.from(new Set(s.known.concat([i]))) : s.known.filter((k) => k !== i) });
      this.setState({ sets, idx: st.idx + 1, flipped: false, roundKnown: knowIt ? st.roundKnown.concat([i]) : st.roundKnown, roundLearning: knowIt ? st.roundLearning : st.roundLearning.concat([i]) });
    };

    return {
      uploadOpen: st.uploadOpen,
      openUpload: () => this.setState({ uploadOpen: true, picked: [], upSubject: st.subject !== 'All' ? st.subject : null, upTags: [], tagDraft: '' }),
      closeUpload: () => this.setState({ uploadOpen: false, dragHot: false }),
      pickFiles: (e) => { addFiles(e.target.files); try { e.target.value = ''; } catch (err) {} },
      dragOver: (e) => { e.preventDefault(); if (!st.dragHot) this.setState({ dragHot: true }); },
      dragLeave: () => this.setState({ dragHot: false }),
      dropFiles: (e) => { e.preventDefault(); addFiles(e.dataTransfer && e.dataTransfer.files); },
      dropBorder: st.dragHot ? '#E8A838' : '#B8B0A0', dropBg: st.dragHot ? '#FFF6DE' : '#FFFDF6',
      hasPicked: st.picked.length > 0,
      picked: st.picked.map((f) => ({ name: f.name, size: fmtSize(f.size), abbr: kindOf(f.name)[1], removeLabel: 'Remove ' + f.name, remove: () => this.setState({ picked: st.picked.filter((x) => x.key !== f.key) }) })),
      upSubjects: allSubjects.map((label) => { const on = st.upSubject === label; return { label, on, dot: dots[label], bg: on ? '#FBF3D9' : '#FFFFFF', border: on ? '#2B2A27' : '#D8D1C2', pick: () => this.setState({ upSubject: label }) }; }),
      upTags: st.upTags.map((t) => ({ label: t, removeLabel: 'Remove tag ' + t, remove: () => this.setState({ upTags: st.upTags.filter((x) => x !== t) }) })),
      tagDraft: st.tagDraft, onTagDraft: (e) => this.setState({ tagDraft: e.target.value }),
      tagKey: (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(st.tagDraft); } else if (e.key === 'Backspace' && !st.tagDraft && st.upTags.length) { this.setState({ upTags: st.upTags.slice(0, -1) }); } },
      tagSuggest: ['notes', 'exam', 'homework', 'lecture', 'reading'].filter((t) => !st.upTags.includes(t)).map((t) => ({ label: t, add: () => addTag(t) })),
      uploadHint: !st.picked.length ? 'Choose at least one file' : (!st.upSubject ? 'Pick a subject' : st.picked.length + (st.picked.length === 1 ? ' file' : ' files') + ' ready'),
      uploadBg: upReady ? '#2B2A27' : '#A39C8E',
      doUpload: () => {
        if (!upReady) return;
        const extra = st.tagDraft.trim() ? [st.tagDraft.trim().replace(/^#/, '').toLowerCase()] : [];
        const tags = st.upTags.concat(extra.filter((t) => !st.upTags.includes(t)));
        const added = st.picked.map((f) => { const k = kindOf(f.name); return { name: f.name.replace(/\.[^.]+$/, ''), subject: st.upSubject, type: k[0], abbr: k[1], tags }; });
        this.setState({ uploadOpen: false, files: added.concat(st.files), picked: [], upTags: [], tagDraft: '' });
      },
      quizCount: st.quizzes.length + (st.quizzes.length === 1 ? ' quiz' : ' quizzes'),
      showQuizList: !z, inQuiz: !!z,
      quizList: st.quizzes.filter((x) => (st.subject === 'All' || x.subject === st.subject) && (!st.query.trim() || x.name.toLowerCase().includes(st.query.trim().toLowerCase()))).map((x) => ({
        name: x.name, paper: papers[x.subject][0],
        meta: x.subject + ' · ' + x.items.length + (x.items.length === 1 ? ' question' : ' questions') + (x.best ? ' · best ' + x.best : ' · not tried yet'),
        startLabel: 'Start quiz: ' + x.name, start: () => startQuiz(x)
      })),
      noQuizzes: st.quizzes.filter((x) => (st.subject === 'All' || x.subject === st.subject) && (!st.query.trim() || x.name.toLowerCase().includes(st.query.trim().toLowerCase()))).length === 0,
      exitQuiz: () => this.setState({ qz: null }),
      qName: quiz ? quiz.name : '',
      qProgress: qOn ? 'Question ' + (z.idx + 1) + ' of ' + qTotal : (z ? 'Finished' : ''),
      qSegs: z ? z.order.map((_, i) => { const r = z.results[i]; return { bg: r ? markInfo[r.mark][2] : (i === z.idx ? '#2B2A27' : '#ECE6DA') }; }) : [],
      qActive: qOn, qDone: !!z && !qOn,
      qText: qItem ? qItem[0] : '', qAnswer: qItem ? qItem[1] : '',
      qAnswering: qOn && z.phase === 'answer', qReviewing: qOn && z.phase === 'review',
      qDraft: z ? z.draft : '', onQDraft: (e) => this.setState({ qz: { ...this.state.qz, draft: e.target.value } }),
      submitBg: z && z.draft.trim() ? '#2B2A27' : '#A39C8E',
      submitQ: () => { if (!z.draft.trim()) return; this.setState({ qz: { ...z, phase: 'review', hlA: [], hlY: [] } }); },
      skipQ: () => this.setState({ qz: { ...z, phase: 'review', draft: '', hlA: [], hlY: [] } }),
      yourAnswer: z && z.draft.trim() ? z.draft : '(skipped)', yourColor: z && z.draft.trim() ? '#2B2A27' : '#8A8478',
      matchText: !z || !z.draft.trim() ? 'No answer to compare' : overlap >= 70 ? 'Close match · ' + overlap + '% of the key words' : overlap >= 35 ? 'Partly matches · ' + overlap + '% of the key words' : 'Few key words in common · ' + overlap + '% match',
      matchColor: !z || !z.draft.trim() ? '#8A8478' : overlap >= 70 ? '#3E6B33' : overlap >= 35 ? '#7A5200' : '#9A3B1C',
      gradeGot: () => grade('got'), gradePartly: () => grade('partly'), gradeMissed: () => grade('missed'),
      answeredQ: !!(z && z.draft.trim()), skippedQ: !!(z && !z.draft.trim()),
      ansTokens: qItem ? hlTokens(qItem[1], 'hlA', 'missed') : [],
      hasHighlights: !!(z && (z.hlA || []).length),
      clearHighlights: () => this.setState({ qz: { ...this.state.qz, hlA: [], hlY: [] } }),
      qScoreText: z ? (qPts % 1 ? qPts.toFixed(1) : qPts) + ' of ' + qTotal + ' correct' : '',
      qBreakdown: z ? ['got', 'partly', 'missed'].map((m) => z.results.filter((r) => r.mark === m).length + ' ' + markInfo[m][0].toLowerCase()).join(' · ') : '',
      qResults: z && quiz ? z.results.map((r) => { const aw = tok(quiz.items[r.i][1]), yw = tok(r.draft); const missed = (r.hlA || []).slice().sort((a, b) => a - b).map((k) => aw[k]).join(' '); const wrong = (r.hlY || []).slice().sort((a, b) => a - b).map((k) => yw[k]).join(' '); return { q: quiz.items[r.i][0], mark: markInfo[r.mark][0], bg: markInfo[r.mark][1], fg: markInfo[r.mark][2], missed, wrong, hasMissed: !!missed, hasWrong: !!wrong }; }) : [],
      retryLabel: missedIdx.length ? 'RETRY ' + missedIdx.length + ' TO REVIEW' : 'START AGAIN',
      retryMissed: () => { if (quiz) startQuiz(quiz, missedIdx); },
      addQuizOpen: st.addQuizOpen,
      quizMenu: !!st.quizMenu, toggleQuizMenu: () => this.setState({ quizMenu: !st.quizMenu }),
      openImportQuiz: () => this.setState({ quizMenu: false, sm: null, addQuizOpen: true, aqMode: 'import', aqName: '', aqSubject: st.subject !== 'All' ? st.subject : null, aqTab: 'paste', aqText: '', aqFileText: '', aqFileName: '', aqCopied: false }),
      openCreateQuiz: () => this.setState({ quizMenu: false, sm: null, addQuizOpen: true, aqMode: 'create', aqName: '', aqSubject: st.subject !== 'All' ? st.subject : null, aqRows: [0, 1, 2].map((i) => ({ k: 'q' + i, q: '', a: '' })), aqTried: false, aqCopied: false }),
      aqHeading: st.aqMode === 'create' ? 'Create a quiz' : 'Import a quiz',
      aqImportMode: st.aqMode !== 'create', aqCreateMode: st.aqMode === 'create',
      aqRowCount: aqCreate ? aqItems.length + (aqItems.length === 1 ? ' question' : ' questions') : '',
      aqRows: (st.aqRows || []).map((r, i) => {
        const half = !!r.q.trim() !== !!r.a.trim();
        const upd = (o) => this.setState({ aqRows: this.state.aqRows.map((x) => x.k === r.k ? { ...x, ...o } : x) });
        return { n: i + 1, q: r.q, a: r.a, border: half && st.aqTried ? '#C8553D' : '#D8D1C2', qLabel: 'Question ' + (i + 1), aLabel: 'Answer ' + (i + 1), removeLabel: 'Remove question ' + (i + 1),
          onQ: (e) => upd({ q: e.target.value }), onA: (e) => upd({ a: e.target.value }), remove: () => this.setState({ aqRows: this.state.aqRows.filter((x) => x.k !== r.k) }) };
      }),
      aqAddRow: () => { this.qk = (this.qk || 0) + 1; this.setState({ aqRows: (this.state.aqRows || []).concat([{ k: 'qa' + this.qk + '-' + Date.now(), q: '', a: '' }]) }); setTimeout(() => { try { const el = document.querySelector('.quizrows'); if (el) { el.scrollTop = el.scrollHeight; const ins = el.querySelectorAll('input'); if (ins.length > 1) ins[ins.length - 2].focus(); } } catch (e) {} }, 30); },
      openAddQuiz: () => this.setState({ sm: null, addQuizOpen: true, aqName: '', aqSubject: st.subject !== 'All' ? st.subject : null, aqTab: 'paste', aqText: '', aqFileText: '', aqFileName: '', aqCopied: false }),
      closeAddQuiz: () => this.setState({ addQuizOpen: false, aqDragHot: false }),
      aqName: st.aqName, onAqName: (e) => this.setState({ aqName: e.target.value }),
      ...mkSM('quiz', 'qs', st.aqSubject, (name) => this.setState({ aqSubject: name })),
      aqSubjects: (st.subjectList || []).map((x) => x.name).map((label) => { const on = st.aqSubject === label; return { label, on, dot: dots[label], bg: on ? '#FBF3D9' : '#FFFFFF', border: on ? '#2B2A27' : '#D8D1C2', pick: () => this.setState({ aqSubject: label }) }; }),
      aqTabs: [['paste', 'PASTE'], ['file', 'UPLOAD FILE']].map(([id, label]) => { const on = st.aqTab === id; return { label, on, bg: on ? '#2B2A27' : '#FFFFFF', fg: on ? '#FAF8F3' : '#2B2A27', pick: () => this.setState({ aqTab: id }) }; }),
      aqPaste: st.aqTab === 'paste', aqFile: st.aqTab === 'file',
      aqText: st.aqText, onAqText: (e) => this.setState({ aqText: e.target.value }),
      aqCopy: () => {
        try { if (navigator.clipboard) navigator.clipboard.writeText('Write quiz questions from the notes below. Put one per line as: question | answer. No numbering or extra text.\n\n'); } catch (e) {}
        clearTimeout(this.aqt); this.setState({ aqCopied: true }); this.aqt = setTimeout(() => this.setState({ aqCopied: false }), 2000);
      },
      aqCopyLabel: st.aqCopied ? 'Copied ✓' : 'Copy prompt', aqCopyBg: st.aqCopied ? '#2B2A27' : '#FFFFFF', aqCopyFg: st.aqCopied ? '#FAF8F3' : '#2B2A27',
      aqPickFile: (e) => { readFile(e.target.files && e.target.files[0]); try { e.target.value = ''; } catch (err) {} },
      aqDragOver: (e) => { e.preventDefault(); if (!st.aqDragHot) this.setState({ aqDragHot: true }); },
      aqDragLeave: () => this.setState({ aqDragHot: false }),
      aqDrop: (e) => { e.preventDefault(); readFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); },
      aqDropBorder: st.aqDragHot ? '#E8A838' : '#B8B0A0', aqDropBg: st.aqDragHot ? '#FFF6DE' : '#FFFDF6',
      aqFileLabel: st.aqFileName ? st.aqFileName + ' loaded' : 'Drag a file here',
      aqHasPreview: aqSource.trim().length > 0,
      aqPreview: aqParsed.ok.map(([q, a]) => ({ q, a })),
      aqCount: aqParsed.ok.length + (aqParsed.ok.length === 1 ? ' question ready' : ' questions ready'),
      aqBadText: aqParsed.bad.length ? aqParsed.bad.length + (aqParsed.bad.length === 1 ? ' line' : ' lines') + ' skipped (no answer found)' : 'All lines read',
      aqBadColor: aqParsed.bad.length ? '#9A3B1C' : '#3E6B33',
      aqHint: aqHalf >= 0 ? 'Question ' + (aqHalf + 1) + (aqRowsArr[aqHalf].q.trim() ? ' needs an answer' : ' needs a question') : !aqItems.length ? 'Add questions and answers' : !st.aqName.trim() ? 'Name your quiz' : !st.aqSubject ? 'Pick a subject' : 'Ready to save',
      aqSaveBg: aqReady ? '#2B2A27' : '#A39C8E',
      saveQuiz: () => { if (!aqReady) { if (aqCreate) this.setState({ aqTried: true }); return; } this.setState({ addQuizOpen: false, quizzes: [{ id: Date.now(), name: st.aqName.trim(), subject: st.aqSubject, best: '', items: aqItems }].concat(st.quizzes) }); },
      query: st.query, onQuery: (e) => this.setState({ query: e.target.value }),
      subjects, files, noFiles: files.length === 0,
      fileCount: allFiles.length + ' files',
      deckMenu: !!st.deckMenu, toggleDeckMenu: () => this.setState({ deckMenu: !st.deckMenu }),
      deckBtnBg: st.deckMenu ? '#2B2A27' : '#FFFFFF', deckBtnFg: st.deckMenu ? '#FAF8F3' : '#2B2A27',
      openCreate: () => { this.rk = (this.rk || 0) + 3; this.setState({ sm: null, deckMenu: false, importOpen: false, studyId: null, editor: { mode: 'create', name: '', subject: 'General', rows: [0, 1, 2].map((i) => ({ k: 'n' + i, f: '', b: '', oi: -1 })), err: '', confirmDel: false } }); },
      ...edVals,
      showImportBtn: !st.importOpen && !studySet && !st.editor,
      showSets: !st.importOpen && !studySet && !st.editor,
      sets: st.sets.map((s) => ({
        ...s, count: s.cards.length, subjectUp: s.subject.toUpperCase(), dot: dots[s.subject], paper: papers[s.subject][0], paper2: papers[s.subject][1],
        knownText: s.known.length + ' known', pct: Math.round(s.known.length / s.cards.length * 100),
        studyLabel: 'Study ' + s.name,
        editLabel: 'Edit ' + s.name, edit: () => openEdit(s),
        study: () => startStudy(s, false),
        peekLabel: 'See which cards you know in ' + s.name,
        peek: () => this.setState({ peekId: s.id, peekBack: false })
      })),
      ...(() => {
        const ps = st.peekId != null ? st.sets.find((x) => x.id === st.peekId) : null;
        if (!ps) return { peekOn: false };
        const card = (c) => ({ front: c[0], back: c[1] });
        const known = ps.cards.map((c, i) => ({ c, i })).filter((x) => ps.known.includes(x.i)).map((x) => card(x.c));
        const learn = ps.cards.map((c, i) => ({ c, i })).filter((x) => !ps.known.includes(x.i)).map((x) => card(x.c));
        return {
          peekBack: !!st.peekBack, togglePeekBack: () => this.setState({ peekBack: !this.state.peekBack }),
          peekSwBg: st.peekBack ? '#2B2A27' : '#ECE6DA', peekSwBorder: st.peekBack ? '#2B2A27' : '#D8D1C2', peekKnob: st.peekBack ? 20 : 2,
          peekOn: true, peekName: ps.name, peekSubject: ps.subject.toUpperCase(), peekDot: dots[ps.subject] || '#8A8273',
          peekSummary: ps.cards.length + ' cards · ' + known.length + ' known · ' + learn.length + ' still learning',
          peekKnown: known, peekLearn: learn, peekKnownN: known.length, peekLearnN: learn.length,
          peekKnownNone: !known.length, peekLearnNone: !learn.length, peekCanLearn: learn.length > 0,
          peekLearnLabel: 'STUDY THE ' + learn.length + ' I DON’T KNOW',
          peekStudyLearn: () => { this.setState({ peekId: null }); startStudy(ps, true); },
          peekStudyAll: () => { this.setState({ peekId: null }); startStudy(ps, false); },
          closePeek: () => this.setState({ peekId: null }),
          peekStop: (e) => { if (e && e.stopPropagation) e.stopPropagation(); },
        };
      })(),
      importOpen: st.importOpen,
      openImport: () => this.setState({ deckMenu: false, editor: null, importOpen: true, importTab: 'paste', pasteText: '', fileLoaded: false, setName: '', copied: false }),
      closeImport: () => this.setState({ importOpen: false }),
      importTabs: [['paste', 'PASTE'], ['file', 'UPLOAD FILE']].map(([id, label]) => {
        const on = st.importTab === id;
        return { label, on, bg: on ? '#2B2A27' : '#FFFFFF', fg: on ? '#FAF8F3' : '#2B2A27', pick: () => this.setState({ importTab: id }) };
      }),
      tabPaste: st.importTab === 'paste', tabFile: st.importTab === 'file',
      promptText: 'Make flashcards from the notes below. Put one card per line as: front | back. No numbering, headings or extra text. [Paste your notes or topic here]',
      copyPrompt: () => {
        try { if (navigator.clipboard) navigator.clipboard.writeText('Make flashcards from the notes below. Put one card per line as: front | back. No numbering, headings or extra text.\n\n'); } catch (e) {}
        clearTimeout(this.ct);
        this.setState({ copied: true });
        this.ct = setTimeout(() => this.setState({ copied: false }), 2000);
      },
      copyLabel: st.copied ? 'Copied ✓' : 'Copy prompt',
      copyBg: st.copied ? '#2B2A27' : '#FFFFFF', copyFg: st.copied ? '#FAF8F3' : '#2B2A27',
      pasteText: st.pasteText, onPaste: (e) => this.setState({ pasteText: e.target.value }),
      pickFile: () => this.setState({ fileLoaded: true, setName: st.setName || 'Plant biology' }),
      fileLabel: st.fileLoaded ? '[plant-biology.csv] loaded — choose another' : 'Choose a file',
      hasPreview: lines.length > 0,
      preview: parsed.map(([front, back]) => ({ front, back })),
      previewCount: parsed.length + (parsed.length === 1 ? ' card ready' : ' cards ready'),
      badText: bad.length ? bad.length + (bad.length === 1 ? ' line' : ' lines') + ' skipped (no “|” between front and back)' : 'All lines read',
      badColor: bad.length ? '#9A3B1C' : '#3E6B33',
      setName: st.setName, onSetName: (e) => this.setState({ setName: e.target.value }),
      setSubjects: allSubjects.map((label) => {
        const on = st.setSubject === label;
        return { label, on, bg: on ? '#FBF3D9' : '#FFFFFF', border: on ? '#2B2A27' : '#D8D1C2', pick: () => this.setState({ setSubject: label }) };
      }),
      saveBg: ready ? '#2B2A27' : '#A39C8E',
      saveSet: () => { if (!ready) return; this.setState({ importOpen: false, sets: [{ id: Date.now(), name: st.setName.trim(), subject: st.setSubject, known: [], cards: parsed }].concat(st.sets) }); },
      studying: !!studySet,
      studyName: studySet ? studySet.name : '',
      studyActive: !!active, studyDone: !!studySet && !active,
      studyProgress: active ? 'Card ' + (st.idx + 1) + ' of ' + total : (studySet ? studySet.known.length + ' of ' + studySet.cards.length + ' known' : ''),
      cardText: cur ? (st.flipped ? cur[1] : cur[0]) : '',
      sideLabel: st.flipped ? 'BACK' : 'FRONT',
      cardBg: st.flipped ? '#FFFDF6' : '#FFFFFF',
      cardLines: st.flipped ? 'repeating-linear-gradient(#FFFDF6 0 27px, #ECE6DA 27px 28px)' : 'none',
      flipLabel: cur ? (st.flipped ? 'Back: ' + cur[1] + '. Tap to see the front.' : 'Front: ' + cur[0] + '. Tap to see the answer.') : '',
      flip: () => this.setState({ flipped: !st.flipped }),
      markKnow: () => mark(true), markLearning: () => mark(false),
      doneText: 'Round done — ' + st.roundKnown.length + ' known, ' + st.roundLearning.length + ' still learning',
      restartLearning: () => { if (studySet) startStudy(studySet, true); },
      editStudying: () => { if (studySet) openEdit(studySet); },
      exitStudy: () => this.setState({ studyId: null })
    };
  }
}

