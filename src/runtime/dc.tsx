// Tiny runtime that lets the design boards' code run inside React.
import { useEffect, useReducer, useRef, type AnchorHTMLAttributes, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

/** Base class the boards' logic extends: state + setState, like on the canvas. */
export class DCLogic<P = Record<string, unknown>, S = any> {
  props: P;
  state!: S;
  _render: (() => void) | null = null;
  constructor(props: P) { this.props = props; }
  setState(patch: Partial<S> | ((s: S) => Partial<S>)) {
    const p = typeof patch === "function" ? (patch as (s: S) => Partial<S>)(this.state) : patch;
    this.state = { ...this.state, ...p };
    this._render?.();
  }
  componentDidMount?(): void;
  componentWillUnmount?(): void;
  renderVals(): any { return {}; }
}

/** Run a board's logic class and return its values for the view. */
export function useBoard<L extends DCLogic>(make: () => L): any {
  const ref = useRef<L | null>(null);
  const [, force] = useReducer((x: number) => x + 1, 0);
  if (!ref.current) ref.current = make();
  ref.current._render = force;
  useEffect(() => {
    const l = ref.current!;
    l._render = force;
    l.componentDidMount?.();
    return () => { l._render = null; l.componentWillUnmount?.(); };
  }, []);
  return ref.current.renderVals();
}

const cache = new Map<string, CSSProperties>();
/** Inline style string → React style object (cached). */
export function css(s: string | undefined | null): CSSProperties {
  if (!s) return {};
  const hit = cache.get(s);
  if (hit) return hit;
  const o: Record<string, string> = {};
  for (const decl of s.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const k = decl.slice(0, i).trim(), v = decl.slice(i + 1).trim();
    if (!k) continue;
    const key = k.startsWith("--") ? k : k.replace(/^-webkit-/, "Webkit-").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    o[key] = v;
  }
  if (cache.size > 5000) cache.clear();
  cache.set(s, o as CSSProperties);
  return o as CSSProperties;
}

/** The boards link pages with <a href="Page.dc.html">; in the app those become in-app links. */
export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const nav = useNavigate();
  return <a href={href} {...rest} onClick={(e) => { onClick?.(e); if (e.defaultPrevented || !href || href === "#") { if (href === "#") e.preventDefault(); return; } e.preventDefault(); nav(href); }} />;
}
