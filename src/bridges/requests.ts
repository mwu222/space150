// @ts-nocheck — the owner's Access requests page.
import { decideAccessRequest, listAccessRequests, sendInvite } from "../lib/api/access";

export function makeRequests(Base) {
  return class RequestsBridge extends Base {
    constructor(props) { super(props); this.rows = []; }
    componentDidMount() { super.componentDidMount?.(); void this.load(); }
    async load() {
      try {
        this.rows = await listAccessRequests();
        this.setState({});
      } catch (e) { this.setState({ note: e.message || String(e), noteErr: true }); }
    }
    requests() {
      return this.rows.map((r) => ({ id: r.id, name: r.display_name, username: r.username, email: r.email, status: r.status, created: r.created_at }));
    }
    async decide(r, approve) { await decideAccessRequest(r.id, approve); await this.load(); }
    invite(r) { return sendInvite({ email: r.email, username: r.username, display_name: r.name }); }
  };
}
