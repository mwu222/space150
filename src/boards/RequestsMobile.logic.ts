// GENERATED from AccessRequestsMobile.dc.html by tools/board2react.py. Don't edit by hand.
// @ts-nocheck
import { DCLogic } from "../runtime/dc";

export default class RequestsMobileLogic extends DCLogic {
  constructor(props) {
    super(props);
    const ago = (h) => new Date(Date.now() - h * 3600000).toISOString();
    this.state = { filter: 'pending', busy: {}, note: '', noteErr: false, list: [
      { id: 'r1', name: 'Jordan Park', username: 'jordan_p', email: 'jordan@example.com', status: 'pending', created: ago(2) },
      { id: 'r2', name: 'Maya Kim', username: 'maya.k', email: 'maya@example.com', status: 'pending', created: ago(20) },
      { id: 'r3', name: 'Sam Lee', username: 'sam.lee', email: 'sam@example.com', status: 'approved', created: ago(50) },
    ] };
  }
  requests() { return this.state.list; }
  decide(r, approve) { return new Promise((ok) => setTimeout(() => { this.setState({ list: this.state.list.map((x) => x.id === r.id ? { ...x, status: approve ? 'approved' : 'declined' } : x) }); ok(); }, 400)); }
  invite(r) { return new Promise((ok) => setTimeout(ok, 400)); }
  renderVals() {
    const st = this.state, all = this.requests();
    const when = (iso) => { const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)); return m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' d ago'; };
    const tints = ['#FBF3D9', '#F2F5EE', '#F3EEF7', '#FBE9E2', '#EEF2F7', '#F5F1E6'];
    const pending = all.filter((r) => r.status === 'pending');
    const shown = st.filter === 'all' ? all : all.filter((r) => r.status === st.filter);
    const run = async (r, job, okText) => {
      this.setState({ busy: { ...this.state.busy, [r.id]: true }, note: '' });
      try { await job(); this.setState({ note: okText, noteErr: false }); }
      catch (e) { this.setState({ note: (e && e.message) || 'Something went wrong.', noteErr: true }); }
      this.setState({ busy: { ...this.state.busy, [r.id]: false } });
    };
    return {
      countText: pending.length + ' waiting',
      filters: [['pending', 'WAITING'], ['approved', 'APPROVED'], ['declined', 'DECLINED'], ['all', 'ALL']].map(([id, label]) => { const on = st.filter === id; return { label, on, bg: on ? '#2B2A27' : '#FFFFFF', fg: on ? '#FAF8F3' : '#2B2A27', pick: () => this.setState({ filter: id }) }; }),
      noteOn: !!st.note, note: st.note, noteFg: st.noteErr ? '#9A3B1C' : '#3E6B33', noteBg: st.noteErr ? '#FBE9E2' : '#EEF3E8',
      empty: shown.length === 0, emptyText: st.filter === 'pending' ? 'No one is waiting right now.' : 'Nothing here yet.',
      rows: shown.map((r, i) => {
        const busy = !!st.busy[r.id];
        return {
          ...r, initial: (r.name || r.username || '?').charAt(0).toUpperCase(), tint: tints[i % tints.length], when: when(r.created), busy,
          pending: r.status === 'pending', decided: r.status !== 'pending',
          statusText: r.status === 'approved' ? 'APPROVED' : 'DECLINED',
          chipBg: r.status === 'approved' ? '#EEF3E8' : '#F4F1EA', chipFg: r.status === 'approved' ? '#3E6B33' : '#6B655A',
          approveLabel: busy ? 'ONE MOMENT…' : 'APPROVE',
          approve: () => run(r, async () => { await this.decide(r, true); await this.invite(r); }, r.name + ' is approved. We’ve emailed them a link to get in.'),
          decline: () => run(r, () => this.decide(r, false), r.name + '’s request was declined.'),
          canResend: r.status === 'approved', resendLabel: busy ? 'Sending…' : 'Resend invite',
          resend: () => run(r, () => this.invite(r), 'Invite sent again to ' + r.email + '.'),
        };
      }),
    };
  }
}

