#!/usr/bin/env python3
"""Turn a design board (.dc.html) into two React files:
   <Name>.view.tsx  - the exact markup as JSX, reading values from V
   <Name>.logic.ts  - the board's Component class (state + renderVals), unchanged
Usage: board2react.py Board.dc.html OutDir Name [--phone]
"""
import html, json, re, sys

VOID = {"input", "img", "br", "hr", "meta", "link", "source", "area", "col", "wbr"}
ATTR_MAP = {"class": "className", "for": "htmlFor", "tabindex": "tabIndex", "maxlength": "maxLength",
            "autocomplete": "autoComplete", "autocapitalize": "autoCapitalize", "spellcheck": "spellCheck",
            "inputmode": "inputMode", "readonly": "readOnly", "contenteditable": "contentEditable",
            "crossorigin": "crossOrigin", "viewbox": "viewBox"}
BOOL_ATTRS = {"checked", "disabled", "selected", "readOnly", "multiple", "hidden", "required"}
ROUTES = {"Main": "/", "MainMobile": "/", "Schedule": "/schedule", "ScheduleMobile": "/schedule",
          "StudySpace": "/study", "StudySpaceMobile": "/study", "Login": "/login", "LoginMobile": "/login", "VerifyEmail": "/verified", "VerifyEmailMobile": "/verified", "AccessRequests": "/requests", "AccessRequestsMobile": "/requests"}
HOLE = re.compile(r"\{\{\s*([^{}]+?)\s*\}\}")

def tokenize(src):
    pos = 0
    tag_re = re.compile(r"<!--.*?-->|<(/?)([A-Za-z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:\"[^\"]*\"|'[^']*'))?)*)\s*(/?)>", re.S)
    for m in tag_re.finditer(src):
        if m.start() > pos:
            yield ("text", src[pos:m.start()])
        pos = m.end()
        if m.group(0).startswith("<!--"):
            continue
        closing, name, attrs, selfclose = m.group(1), m.group(2), m.group(3), m.group(4)
        if closing:
            yield ("close", name)
        else:
            al = [(a.group(1), a.group(2) if a.group(2) is not None else a.group(3)) for a in re.finditer(r"([^\s=>/]+)(?:\s*=\s*(?:\"([^\"]*)\"|'([^']*)'))?", attrs)]
            yield ("open", name, al, bool(selfclose) or name.lower() in VOID)
    if pos < len(src):
        yield ("text", src[pos:])

def build_tree(src):
    root = {"tag": "#root", "attrs": [], "kids": []}
    stack = [root]
    for t in tokenize(src):
        if t[0] == "text":
            stack[-1]["kids"].append({"text": t[1]})
        elif t[0] == "open":
            node = {"tag": t[1], "attrs": t[2], "kids": []}
            stack[-1]["kids"].append(node)
            if not t[3]:
                stack.append(node)
        else:
            if any(n["tag"] == t[1] for n in stack[1:]):   # ignore stray closing tags
                while len(stack) > 1 and stack[-1]["tag"] != t[1]:
                    stack.pop()
                stack.pop()
    return root

class Gen:
    def __init__(self):
        self.loops = []

    def expr(self, path):
        path = path.strip()
        if path in ("true", "false"):
            return path
        head = path.split(".")[0]
        if head in self.loops:
            return path
        return "V." + path

    def text_expr(self, s):
        """Static/holey text as JSX children, keeping the browser's whitespace collapsing."""
        s = re.sub(r"\s+", " ", s)
        if not s:
            return ""
        out, last = [], 0
        for m in HOLE.finditer(s):
            if m.start() > last:
                out.append("{" + json.dumps(html.unescape(s[last:m.start()])) + "}")
            out.append("{" + self.expr(m.group(1)) + "}")
            last = m.end()
        if last < len(s):
            out.append("{" + json.dumps(html.unescape(s[last:])) + "}")
        return "".join(out)

    def attr_value(self, name, val):
        if val is None:
            return "{true}"
        full = HOLE.fullmatch(val.strip())
        if name == "style":
            if full:
                return "{css(" + self.expr(full.group(1)) + ")}"
            return "{css(" + self.template(val) + ")}"
        if full:
            e = self.expr(full.group(1))
            if name in BOOL_ATTRS:
                return "{!!(" + e + ")}"
            if name in ("value",):
                return "{" + e + " ?? \"\"}"
            return "{" + e + "}"
        if HOLE.search(val):
            return "{" + self.template(val) + "}"
        return "{" + json.dumps(html.unescape(val)) + "}"  # braces: JSX attribute strings ignore \u escapes

    def template(self, val):
        parts, last = [], 0
        for m in HOLE.finditer(val):
            parts.append(html.unescape(val[last:m.start()]).replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${"))
            parts.append("${" + self.expr(m.group(1)) + "}")
            last = m.end()
        parts.append(html.unescape(val[last:]).replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${"))
        return "`" + "".join(parts) + "`"

    def attr_name(self, n):
        low = n.lower()
        if low in ATTR_MAP:
            return ATTR_MAP[low]
        if low.startswith("aria-") or low.startswith("data-"):
            return low
        if n.startswith("on") and n[2:3].isupper():
            return n
        if "-" in n or ":" in n:
            p = re.split(r"[-:]", n)
            return p[0] + "".join(x[:1].upper() + x[1:] for x in p[1:])
        return n

    def node(self, n, ind):
        if "text" in n:
            return self.text_expr(n["text"])
        tag = n["tag"]
        if tag.lower() in ("helmet", "script", "style", "title", "meta", "link"):
            return ""
        if tag == "sc-if":
            a = dict(n["attrs"])
            cond = HOLE.fullmatch(a["value"].strip()).group(1)
            return "{(" + self.expr(cond) + ") ? (<>" + self.kids(n, ind + 1) + "</>) : null}"
        if tag == "sc-for":
            a = dict(n["attrs"])
            lst = HOLE.fullmatch(a["list"].strip()).group(1)
            var = a["as"]
            src = self.expr(lst)
            self.loops.append(var)
            body = self.kids(n, ind + 1)
            self.loops.pop()
            return "{(" + src + " || []).map((" + var + ": any, __i_" + var + ": number) => (<Fragment key={__i_" + var + "}>" + body + "</Fragment>))}"
        if tag == "x-dc":
            return self.kids(n, ind)
        attrs = []
        href_route = None
        for k, v in n["attrs"]:
            if k.startswith("hint-placeholder"):
                continue
            if tag == "a" and k == "href" and v and v.endswith(".dc.html"):
                href_route = ROUTES.get(v[:-8], "/")
                attrs.append('href=' + json.dumps(href_route))
                continue
            name = self.attr_name(k)
            attrs.append(name + "=" + self.attr_value(name, v))
        jtag = "Link" if href_route else tag
        open_ = "<" + jtag + (" " + " ".join(attrs) if attrs else "")
        if tag.lower() in VOID:
            return open_ + " />"
        return open_ + ">" + self.kids(n, ind + 1) + "</" + jtag + ">"

    def kids(self, n, ind):
        out = []
        ks = n["kids"]
        for i, k in enumerate(ks):
            if "text" in k and not k["text"].strip():
                prev_el = i > 0 and "text" not in ks[i - 1]
                next_el = i + 1 < len(ks) and "text" not in ks[i + 1]
                if prev_el and next_el and k["text"] != "":
                    out.append('{" "}')
                continue
            out.append(self.node(k, ind))
        return "".join(out)


def main():
    src_path, out_dir, name = sys.argv[1], sys.argv[2], sys.argv[3]
    phone = "--phone" in sys.argv
    s = open(src_path).read()
    mk = s[s.index("<x-dc>"):s.index("</x-dc>") + len("</x-dc>")]
    css = "\n".join(re.findall(r"<style>(.*?)</style>", s, re.S))
    logic = s[s.index("class Component extends DCLogic"):s.index("</script>", s.index("class Component extends DCLogic"))]
    if phone:  # boards are drawn at 390px; real phones use their full width
        mk = mk.replace("width: 390px;", "width: 100%; max-width: 100%;", 1)
    g = Gen()
    tree = build_tree(mk)
    body = g.kids(tree, 0)
    view = ("// GENERATED from " + src_path.split("/")[-1] + " by tools/board2react.py. Don't edit by hand.\n"
            "// @ts-nocheck\n"
            "import { Fragment } from \"react\";\n"
            "import { css, Link } from \"../runtime/dc\";\n\n"
            "export default function " + name + "View({ V }: { V: any }) {\n  return (<>" + body + "</>);\n}\n")
    open(f"{out_dir}/{name}.view.tsx", "w").write(view)
    lg = ("// GENERATED from " + src_path.split("/")[-1] + " by tools/board2react.py. Don't edit by hand.\n"
          "// @ts-nocheck\n"
          "import { DCLogic } from \"../runtime/dc\";\n\n"
          + logic.replace("class Component extends DCLogic", "export default class " + name + "Logic extends DCLogic", 1) + "\n")
    open(f"{out_dir}/{name}.logic.ts", "w").write(lg)
    open(f"{out_dir}/{name}.css", "w").write("/* from " + src_path.split("/")[-1] + " */\n" + css.strip() + "\n")

main()
