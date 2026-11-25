#!/usr/bin/env python3
"""Regenerate src/boards from the design boards in tools/design/.
Run from the project folder:  python3 tools/build_boards.py

1. Copy each board's .dc.html and apply small MARKUP patches (real file inputs,
   real photos, log-out) — the look stays exactly the same.
2. Convert to React with board2react.py.
3. Apply small LOGIC patches so sample data comes from the backend (`this.ext`)
   instead of being hard-coded.
"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ, OUT = f"{HERE}/design", os.path.join(os.path.dirname(HERE), "src", "boards")
import tempfile
TMP = tempfile.mkdtemp()
BOARDS = [("Login", "Login", False), ("LoginMobile", "LoginMobile", True), ("Main", "Main", False), ("MainMobile", "MainMobile", True),
          ("Schedule", "Schedule", False), ("ScheduleMobile", "ScheduleMobile", True), ("StudySpace", "Study", False), ("StudySpaceMobile", "StudyMobile", True),
          ("VerifyEmail", "Verify", False), ("VerifyEmailMobile", "VerifyMobile", True),
          ("AccessRequests", "Requests", False), ("AccessRequestsMobile", "RequestsMobile", True)]

def sub(s, old, new, name, count=None, regex=False):
    n = len(re.findall(old, s, re.S)) if regex else s.count(old)
    if n == 0 or (count is not None and n != count):
        sys.exit(f"[{name}] patch matched {n}x (wanted {count or '≥1'}): {old[:90]!r}")
    return re.sub(old, lambda m: new, s, flags=re.S) if regex else s.replace(old, new)

# ───────────────────────── markup patches ─────────────────────────
def markup_header(s, n):
    """Design placeholders in the page header become live values."""
    s = s.replace("[Weekday, date]", "{{todayLabel}}")
    s = s.replace('aria-label="[N] friends in their space"', 'aria-label="{{lampCount}} friends in their space"')
    s = re.sub(r"\[N\] in their space", "{{lampCount}} in their space", s)
    return s

def markup_main(s, n):
    # Real photos on the whiteboard (the design shows an [Image] placeholder).
    ph = re.search(r'<div style="height: \d+px; background: #E3DDD0; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6B655A; margin-bottom: 6px">\[Image\]</div>', s)
    if not ph: sys.exit(f"[{n}] image placeholder not found")
    h = re.search(r"height: (\d+)px", ph.group(0)).group(1)
    s = s.replace(ph.group(0), f'<sc-if value="{{{{n.imgUrl}}}}"><img src="{{{{n.imgUrl}}}}" alt="{{{{n.text}}}}" draggable="false" style="display: block; width: 100%; height: {h}px; object-fit: cover; margin-bottom: 6px"></sc-if><sc-if value="{{{{n.noImg}}}}">{ph.group(0)}</sc-if>')
    # Friend photo picker: the design's button becomes a label for a real file input (same look).
    i = s.index('<button onClick="{{pickFile}}"'); j = s.index("</button>", i)
    s = s[:i] + '<label for="fpfile"' + s[i + len('<button onClick="{{pickFile}}"'):j] + '</label><input id="fpfile" type="file" accept="image/*" onChange="{{pickFileReal}}" style="position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden">' + s[j + len("</button>"):]
    s = sub(s, '<a href="#" style="display: flex; align-items: center; min-height: 44px; padding: 0 16px; text-decoration: none; font-size: 14px; border-top: 1px dashed #ECE6DA">Log out</a>',
            '<a href="#" onClick="{{logOut}}" style="display: flex; align-items: center; min-height: 44px; padding: 0 16px; text-decoration: none; font-size: 14px; border-top: 1px dashed #ECE6DA">Log out</a>', n, 1)
    return s

def markup_login(s, n):
    # The design's "[N] people are in their space right now" can't be known before you log in.
    s = re.sub(r'\s*<div style="font-size: 13px; color: #6B655A">\[N\] people are in their space right now</div>', "", s)
    # The CTA link "goes to Home" in the design; in the app it logs in / signs up.
    s = sub(s, r'<a href="Main(Mobile)?\.dc\.html" style="display: flex;', '<a href="#" onClick="{{submit}}" style="display: flex;', n, 1, regex=True)
    s = sub(s, '<a href="#" style="font-size: 13px">Forgot password?</a>', '<a href="#" onClick="{{forgot}}" style="font-size: 13px">Forgot password?</a>', n)
    return s

def markup_schedule(s, n):
    return s

def markup_study(s, n):
    return s

# ───────────────────────── logic patches ─────────────────────────
def logic_main(s, n):
    s = sub(s, re.compile(r"    this\.ivSync = setInterval\(\(\) => \{.*?\n    \}, 1000\);\n", re.S).pattern, "", n, regex=True)
    s = sub(s, "clearInterval(this.ivSync); ", "", n)
    s = sub(s, re.compile(r"    const syncSnap = .*?\n    if \(syncSnap !== this\._syncSnap\).*?\n", re.S).pattern, "", n, regex=True)
    s = sub(s, re.compile(r"    const roster0 = \[.*?\n    \];\n", re.S).pattern, "    const roster0 = this.ext.roster0();\n", n, regex=True)
    s = sub(s, "const fMatches = fQ.length < 2 ? [] : directory.filter((p) => p.username.toLowerCase().startsWith(fQ) || p.name.toLowerCase().includes(fQ)).slice(0, 6);",
            "const fMatches = fQ.length < 2 ? [] : this.ext.search(fQ);", n)
    s = sub(s, "        initial: 'F' + f.id,\n        tint: tints[i % tints.length],", "        initial: f.initial,\n        tint: f.tint || tints[i % tints.length],", n)
    s = sub(s, "initial: f.initial || ('F' + f.id), tint: tints[i % tints.length], confirming", "initial: f.initial || ('F' + f.id), tint: f.tint || tints[i % tints.length], confirming", n)
    s = sub(s, "const taken = ['maya.k', 'jordan_p', 'sam.lee', 'priya', 'marcusd', 'alexr', 'nina.t', 'friend1'];", "const taken = this.ext.takenList(ep.user.trim());", n)
    # Whiteboard: real items instead of the sample posts and doodles.
    s = sub(s, re.compile(r"    const basePosts = \[.*?\n    \];\n", re.S).pattern, "    const basePosts = this.ext.posts();\n", n, regex=True)
    s = sub(s, re.compile(r"    const doodleShapes = \[.*?\n    \];\n", re.S).pattern, "    const doodleShapes = this.ext.doodles();\n", n, regex=True)
    s = sub(s, "const allPosts = basePosts.map((b, bi) => ({ ...b, paper: '#FAF4E2', tape: ['#F08C7E', '#6FC2A8', '#F5C04A', '#8FA8E8'][bi % 4] }))",
            "const allPosts = basePosts.map((b, bi) => (b.mine ? b : { ...b, paper: '#FAF4E2', tape: ['#F08C7E', '#6FC2A8', '#F5C04A', '#8FA8E8'][bi % 4] }))", n)
    a = s.index("    const posts = allPosts.map((n, i) => {"); b = s.index("    const visiblePosts", a)
    blk = s[a:b]
    blk = blk.replace("const h = left[i % left.length];", "const h = n.hoursLeft != null ? n.hoursLeft : left[i % left.length];")
    blk = blk.replace("'p' + i", "PID")
    blk = blk.replace("    const posts = allPosts.map((n, i) => {\n      const kept = !!(st.kept || {})[i];",
                      "    const posts = allPosts.map((n, i) => {\n      const PID = n.bid ? 'b:' + n.bid : 'p' + i;\n      const kept = n.bid ? ((st.kept || {})[PID] !== undefined ? !!(st.kept || {})[PID] : !!n.kept) : !!(st.kept || {})[i];")
    blk = blk.replace("|| initP[i % initP.length] ||", "|| (n.bid ? [n.x, n.y] : initP[i % initP.length]) ||")
    blk = blk.replace("z: (st.z || {})[PID] || 2,", "z: (st.z || {})[PID] || n.z || 2,")
    blk = blk.replace("author: n.mine ? 'Me' : '[Friend]',", "author: n.mine ? 'Me' : (n.author || '[Friend]'), noImg: !n.imgUrl,")
    blk = blk.replace("toggleKeep: () => this.setState({ kept: { ...(this.state.kept || {}), [i]: !kept } })", "toggleKeep: () => this.setState({ kept: { ...(this.state.kept || {}), [n.bid ? PID : i]: !kept } })")
    if blk.count("PID") < 8 or "n.hoursLeft" not in blk or "noImg" not in blk: sys.exit(f"[{n}] posts block patch failed")
    s = s[:a] + blk + s[b:]
    s = sub(s, ".filter(({ i }) => !(st.deleted || {})['d' + i]).map(({ g, i }) => {\n      const id = 'd' + i, dim = initD[i] || [16, 16, 160, 92],",
            ".filter(({ g, i }) => !(st.deleted || {})[g.bid ? 'b:' + g.bid : 'd' + i]).map(({ g, i }) => {\n      const id = g.bid ? 'b:' + g.bid : 'd' + i, dim = g.bid ? [g.x, g.y, g.w, g.h] : (initD[i] || [16, 16, 160, 92]),", n)
    s = sub(s, "if (f) this.setState({ bpFile: f.name });", "if (f) { this.ext.stashFile('board', f); this.setState({ bpFile: f.name }); }", n)
    s = sub(s, "'[photo.jpg] ready to send — tap to change'", "(this.ext.fileName('friend') || 'Photo') + ' ready to send — tap to change'", n)
    return s

def logic_login(s, n):
    s = sub(s, "const emailOk = s.email.trim().length > 2;", "const emailOk = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(s.email.trim());", n)
    s = sub(s, "const taken = ['maya.k', 'jordan_p', 'sam.lee', 'priya', 'marcusd', 'alexr', 'nina.t'];", "const taken = this.ext.takenList(s.uname.trim());", n)
    s = sub(s, "if (!emailOk2) missing.push(isLogin ? 'your email or username' : 'your email');", "if (!emailOk2) missing.push('your email');", n)
    s = sub(s, "emailLabel: isLogin ? 'Email or username' : 'Email', emailAuto: isLogin ? 'username' : 'email',", "emailLabel: 'Email', emailAuto: 'email',", n)
    return s

def logic_schedule(s, n):
    s = sub(s, "  readJSON(k) { try { const v = window.localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }", "  readJSON(k) { return null; }", n, 1)
    s = sub(s, re.compile(r"  componentDidMount\(\) \{\n    const pull = .*?\n  \}\n", re.S).pattern, "  componentDidMount() {}\n", n, 1, regex=True)
    s = sub(s, re.compile(r"    const noteSnap = .*?\n    if \(noteSnap .*?\n    const planSnap = .*?\n    if \(planSnap .*?\n", re.S).pattern, "", n, 1, regex=True)
    s = sub(s, "      try { const q = JSON.parse(window.localStorage.getItem('space150.todoEdits') || '[]'); q.push({ id: taskId, text, plan: planSec }); window.localStorage.setItem('space150.todoEdits', JSON.stringify(q)); } catch (e) {}\n", "", n, 1)
    return s

def logic_study(s, n):
    return s

MARKUP = {"Main": markup_main, "MainMobile": markup_main, "Login": markup_login, "LoginMobile": markup_login,
          "Schedule": markup_schedule, "ScheduleMobile": markup_schedule, "StudySpace": markup_study, "StudySpaceMobile": markup_study,
          "VerifyEmail": lambda s, n: s, "VerifyEmailMobile": lambda s, n: s,
          "AccessRequests": lambda s, n: s, "AccessRequestsMobile": lambda s, n: s}
LOGIC = {"Main": logic_main, "MainMobile": logic_main, "Login": logic_login, "LoginMobile": logic_login,
         "Schedule": logic_schedule, "ScheduleMobile": logic_schedule, "Study": logic_study, "StudyMobile": logic_study,
         "Verify": lambda c, n: c, "VerifyMobile": lambda c, n: c,
         "Requests": lambda c, n: c, "RequestsMobile": lambda c, n: c}

os.makedirs(TMP, exist_ok=True); os.makedirs(OUT, exist_ok=True)
css_all = []
for src, name, phone in BOARDS:
    s = open(f"{PROJ}/{src}.dc.html").read()
    s = MARKUP[src](s, src)
    if not src.startswith(("Login", "Verify", "Access")): s = markup_header(s, src)
    if re.search(r"\[(N|Weekday, date)\]", s): sys.exit(f"[{src}] placeholder left in markup")
    open(f"{TMP}/{src}.dc.html", "w").write(s)
    subprocess.run([sys.executable, f"{HERE}/board2react.py", f"{TMP}/{src}.dc.html", OUT, name] + (["--phone"] if phone else []), check=True)
    lp = f"{OUT}/{name}.logic.ts"
    code = open(lp).read()
    code = LOGIC[name](code, name)
    open(lp, "w").write(code)
    cp = f"{OUT}/{name}.css"
    for rule in re.split(r"\n", open(cp).read()):
        if rule.strip() and not rule.startswith("/*") and rule not in css_all:
            css_all.append(rule)
    os.remove(cp)
open(f"{OUT}/boards.css", "w").write("/* GENERATED: global styles from the design boards' <helmet> blocks */\n" + "\n".join(css_all) + "\n")
print("boards regenerated:", ", ".join(b[1] for b in BOARDS))
