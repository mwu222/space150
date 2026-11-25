// GENERATED from VerifyEmailMobile.dc.html by tools/board2react.py. Don't edit by hand.
// @ts-nocheck
import { DCLogic } from "../runtime/dc";

export default class VerifyMobileLogic extends DCLogic {
  constructor(props) {
    super(props);
    // mode: 'verified' (the link worked), 'sent' (just signed up), 'expired' (the link no longer works)
    this.state = { pw: '', showPw: false, saving: false, mode: (props && props.mode) || 'verified', name: props && 'name' in props ? props.name : 'Maggie', email: props && 'email' in props ? props.email : 'maggie@example.com', sending: false, sent: 0, err: '' };
  }
  sendLink(email) { return new Promise((r) => setTimeout(r, 600)); }
  savePassword(pw) { return new Promise((r) => setTimeout(r, 600)); }
  renderVals() {
    const s = this.state, m = s.mode;
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((s.email || '').trim());
    const send = async () => {
      if (this.state.sending) return;
      if (!emailOk) return this.setState({ err: 'Type the email you signed up with.' });
      this.setState({ sending: true, err: '' });
      try { await this.sendLink(this.state.email.trim()); this.setState({ sending: false, sent: this.state.sent + 1 }); }
      catch (e) { this.setState({ sending: false, err: (e && e.message) || 'That didn’t send. Try again in a minute.' }); }
    };
    const copy = {
      verified: ['Email confirmed', (s.name ? 'Thanks, ' + s.name + '. ' : 'Thanks! ') + 'Your account is all set — your lamp, timer and whiteboard are ready when you are.'],
      sent: ['Check your inbox', 'We sent a confirmation link to the address below. Open it to finish setting up your space.'],
      requested: ['Request sent', (s.name ? 'Thanks, ' + s.name + '. ' : 'Thanks! ') + 'SPACE150 is invite-only for now. We’ll email you at the address below once your space is ready.'],
      setpw: ['Choose a password', (s.name ? 'You’re in, ' + s.name + '! ' : 'You’re in! ') + 'Pick a password so you can log in next time.'],
      expired: ['This link has expired', 'Confirmation links work only once. If you already confirmed your email, just log in. If not, enter your email and we’ll send a new link.'],
    }[m] || ['', ''];
    const noteText = s.err || (s.sent ? (m === 'expired' ? 'If that email still needs confirming, a new link is on its way. It can take a few minutes, so check your spam folder too.' : 'Sent again. It can take a few minutes, so check your spam folder too.') : '');
    const secondary = m === 'sent';
    return {
      heading: copy[0], sub: copy[1],
      glow: m === 'expired' ? 0.15 : 1, shade: m === 'expired' ? '#EFEBE3' : '#FFFDF6',
      sealOn: m === 'verified' || m === 'setpw', clockOn: m === 'expired',
      emailOn: m === 'sent' || m === 'requested', formOn: m === 'expired', email: s.email,
      onEmail: (e) => this.setState({ email: e.target.value, err: '' }),
      emailKey: (e) => { if (e.key === 'Enter') { if (e.preventDefault) e.preventDefault(); send(); } },
      emailBorder: s.err && !emailOk ? '#C8553D' : '#D8D1C2',
      noteOn: !!noteText, note: noteText, noteFg: s.err ? '#9A3B1C' : '#3E6B33', noteBg: s.err ? '#FBE9E2' : '#EEF3E8',
      goOn: m === 'verified', goLabel: 'GO TO MY SPACE', go: () => {},
      sendOn: m === 'sent' || m === 'expired', send, sendOff: s.sending,
      sendLabel: s.sending ? 'SENDING…' : m === 'expired' ? 'SEND A NEW LINK' : 'RESEND EMAIL',
      sendBg: secondary ? '#FFFFFF' : '#2B2A27', sendFg: secondary ? '#2B2A27' : '#FAF8F3', sendBorder: secondary ? '1px solid #2B2A27' : 'none',
      sendCursor: s.sending ? 'default' : 'pointer',
      backOn: m === 'sent' || m === 'expired' || m === 'requested', back: () => {},
      pwOn: m === 'setpw', saveOn: m === 'setpw', pw: s.pw, onPw: (e) => this.setState({ pw: e.target.value, err: '' }),
      pwType: s.showPw ? 'text' : 'password', togglePw: () => this.setState({ showPw: !s.showPw }),
      pwToggleText: s.showPw ? 'Hide' : 'Show', pwToggleLabel: s.showPw ? 'Hide password' : 'Show password',
      pwBorder: s.err && m === 'setpw' ? '#C8553D' : '#D8D1C2', saving: s.saving,
      saveLabel: s.saving ? 'SAVING…' : 'SAVE AND GO TO MY SPACE',
      savePw: async () => {
        if (this.state.saving) return;
        if ((this.state.pw || '').length < 8) return this.setState({ err: 'Use at least 8 characters.' });
        this.setState({ saving: true, err: '' });
        try { await this.savePassword(this.state.pw); this.setState({ saving: false }); }
        catch (e) { this.setState({ saving: false, err: (e && e.message) || 'That didn’t save. Try again.' }); }
      },
      pwKey: (e) => { if (e.key === 'Enter') { if (e.preventDefault) e.preventDefault(); this.renderVals().savePw(); } },
    };
  }
}

