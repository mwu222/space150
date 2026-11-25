// GENERATED from LoginMobile.dc.html by tools/board2react.py. Don't edit by hand.
// @ts-nocheck
import { DCLogic } from "../runtime/dc";

export default class LoginMobileLogic extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { mode: 'login', name: '', uname: '', email: '', pw: '', showPw: false, remember: true, tried: false };
  }
  renderVals() {
    const s = this.state;
    const isLogin = s.mode === 'login';
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email.trim());
    const pwOk = isLogin ? s.pw.length > 0 : true;
    const nameOk = isLogin || s.name.trim().length > 0;
    const taken = this.ext.takenList(s.uname.trim());
    const u = s.uname.trim(), uFmt = /^[A-Za-z0-9_.]{3,24}$/.test(u), uTaken = taken.includes(u.toLowerCase());
    const unameOk = isLogin || (uFmt && !uTaken);
    const emailOk2 = isLogin ? emailOk : /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email.trim());
    const ready = emailOk2 && pwOk && nameOk && unameOk;
    const missing = [];
    if (!nameOk) missing.push('your name');
    if (!unameOk) missing.push(uTaken ? 'a different username' : 'a username');
    if (!emailOk2) missing.push('your email');
    if (!pwOk) missing.push('your password');
    const tabs = [['login', 'LOG IN'], ['signup', 'REQUEST ACCESS']].map(([id, label]) => {
      const on = s.mode === id;
      return { label, on, h: on ? 48 : 42, bg: on ? '#2B2A27' : '#DDE4D6', fg: on ? '#FAF8F3' : '#3E4A38', border: on ? '#2B2A27' : '#C7CFBE', pick: () => this.setState({ mode: id, tried: false }) };
    });
    return {
      tabs, isLogin, isSignup: !isLogin,
      heading: isLogin ? 'Welcome back' : 'Request access',
      subheading: isLogin ? 'Log in to pick up where you left off.' : 'SPACE150 is invite-only for now. Tell us who you are and we’ll email you when your space is ready.',
      name: s.name, onName: (e) => this.setState({ name: e.target.value }),
      uname: s.uname, onUname: (e) => this.setState({ uname: e.target.value.replace(/^@/, '').replace(/\s/g, '') }),
      unameNote: !u ? (s.tried ? '3–24 letters, numbers, dots or underscores.' : '') : !uFmt ? '3–24 letters, numbers, dots or underscores.' : uTaken ? 'That username is taken.' : '✓ Available',
      unameColor: (u && (!uFmt || uTaken)) || (s.tried && !u) ? '#9A3B1C' : '#3E6B33',
      unameBorder: (u && (!uFmt || uTaken)) || (s.tried && !u) ? '#B5562E' : '#D8D1C2',
      emailLabel: 'Email', emailAuto: 'email',
      email: s.email, onEmail: (e) => this.setState({ email: e.target.value }),
      pw: s.pw, onPw: (e) => this.setState({ pw: e.target.value }),
      pwType: s.showPw ? 'text' : 'password',
      pwAuto: isLogin ? 'current-password' : 'new-password',
      pwHint: isLogin ? '' : 'At least 8 characters',
      togglePw: () => this.setState({ showPw: !s.showPw }),
      pwToggleText: s.showPw ? 'Hide' : 'Show',
      pwToggleLabel: s.showPw ? 'Hide password' : 'Show password',
      remember: s.remember, toggleRemember: () => this.setState({ remember: !s.remember }),
      emailBorder: s.tried && !emailOk2 ? '#B5562E' : '#D8D1C2',
      pwBorder: s.tried && !pwOk ? '#B5562E' : '#D8D1C2',
      showError: s.tried && !ready,
      errorText: 'Please add ' + missing.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.',
      ready, notReady: !ready,
      tryCta: () => this.setState({ tried: true }),
      cta: isLogin ? 'LOG IN' : 'REQUEST ACCESS',
      switchPrompt: isLogin ? 'New here?' : 'Already have a space?',
      switchText: isLogin ? 'Request access' : 'Log in',
      switchMode: () => this.setState({ mode: isLogin ? 'signup' : 'login', tried: false })
    };
  }
}

