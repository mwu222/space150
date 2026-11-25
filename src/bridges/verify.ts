// @ts-nocheck — the email confirmation page: "check your inbox", "email confirmed" and "link expired".
import { resendConfirmation } from "../lib/api/auth";
import { setFirstPassword } from "../lib/api/access";

export function makeVerify(Base) {
  return class VerifyBridge extends Base {
    sendLink(email) { return resendConfirmation(email); }
    async savePassword(pw) { await setFirstPassword(pw); this.props.onGo?.(); }
    renderVals() {
      const v = super.renderVals();
      const p = this.props || {};
      v.go = () => p.onGo?.();
      v.back = () => p.onBack?.();
      if (this.state.mode === "verified" && !p.signedIn) v.goLabel = "LOG IN";
      return v;
    }
  };
}
