// @ts-nocheck — wraps the generated Login board logic with real sign-in / sign-up.
import { logIn, sendPasswordReset, usernameAvailable } from "../lib/api/auth";
import { requestAccess } from "../lib/api/access";
import { setRememberMe } from "../state/auth";

export function makeLogin(Base) {
  return class LoginBridge extends Base {
    constructor(props) {
      super(props);
      this.taken = new Map(); this.msg = ""; this.ok = ""; this.busy = false;
      const self = this;
      this.ext = {
        takenList: (u) => {
          if (!/^[A-Za-z0-9_.]{3,24}$/.test(u)) return [];
          const k = u.toLowerCase();
          if (this.taken.has(k)) return this.taken.get(k) ? [k] : [];
          this.taken.set(k, false);
          usernameAvailable(u).then((ok) => { self.taken.set(k, !ok); self.setState({}); }).catch(() => {});
          return [];
        },
      };
    }
    setState(p) { if (p && (p.mode !== undefined || p.email !== undefined || p.pw !== undefined)) { this.msg = ""; this.ok = ""; } super.setState(p); }
    renderVals() {
      const v = super.renderVals();
      const s = this.state;
      v.submit = async (e) => {
        e?.preventDefault?.();
        if (this.busy) return;
        this.busy = true; this.msg = ""; this.ok = ""; this.setState({});
        try {
          if (s.mode === "login") { setRememberMe(!!s.remember); await logIn(s.email.trim(), s.pw); }
          else {
            // Invite-only for now: the sign-up tab sends a request instead of creating an account.
            const r = await requestAccess(s.email.trim(), s.uname.trim(), s.name.trim());
            if (r === "pending") window.dispatchEvent(new CustomEvent("space150:requested", { detail: { email: s.email.trim(), name: s.name.trim() } }));
            else if (r === "exists") this.ok = "You already have an account with that email. Log in instead.";
            else this.ok = "You’re already approved! Check your email for the link to get in.";
          }
        } catch (err) { this.msg = err.message || String(err); }
        this.busy = false; this.setState({});
      };
      v.forgot = async (e) => {
        e?.preventDefault?.();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email.trim())) { this.msg = "Type your email above first, then tap Forgot password."; this.setState({}); return; }
        try { await sendPasswordReset(s.email.trim(), window.location.origin); this.ok = "We’ve emailed you a link to reset your password."; } catch (err) { this.msg = err.message; }
        this.setState({});
      };
      if (this.busy) v.cta = "ONE MOMENT…";
      if (this.msg) { v.showError = true; v.errorText = this.msg; }
      else if (this.ok) { v.showError = true; v.errorText = this.ok; }
      return v;
    }
  };
}
