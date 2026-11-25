// Friends list from the lamp: shows who is focusing but not on what, and closes on an outside click.
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { fake, ME, rpcs } from "./fakeSupabase";
vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
const F = "33333333-3333-3333-3333-333333333333";
const realChannel = (fake as any).channel;
beforeEach(() => {
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any;
  rpcs.list_friends = [{ id: F, username: "jordan_p", display_name: "Jordan", avatar_color: "#D6E8F7", last_seen_at: null, allow_board_posts: true, status: "accepted", incoming: false }];
  const state = { [F]: [{ user_id: F, status: "focusing", activity: "Secret lab report", since: new Date(Date.now() - 25 * 60000).toISOString() }] };
  (fake as any).channel = () => { const c: any = {}; let cb: any; c.on = (_t: any, _f: any, f: any) => { cb = f; return c; }; c.subscribe = (s: any) => { s?.("SUBSCRIBED"); setTimeout(() => cb?.(), 10); return c; }; c.presenceState = () => state; c.track = async () => ({}); c.untrack = async () => ({}); return c; };
});
afterEach(() => { cleanup(); rpcs.list_friends = []; (fake as any).channel = realChannel; });
const wait = (ms = 120) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

it("hides friends' tasks and closes when clicking outside", async () => {
  await act(async () => { render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>); }); await wait();
  await act(async () => { (document.querySelector(".lampwrap button") as HTMLElement).click(); await new Promise((r) => setTimeout(r, 20)); });
  const dlg = screen.getByRole("dialog", { name: "Your friends" });
  expect(dlg.textContent).toContain("Jordan");
  expect(dlg.textContent).toContain("Focusing · 25m in");
  expect(document.body.textContent).not.toContain("Secret lab report");
  await act(async () => { (dlg.querySelector("div") as HTMLElement).click(); await new Promise((r) => setTimeout(r, 20)); });
  expect(screen.queryByRole("dialog", { name: "Your friends" })).toBeTruthy();
  await act(async () => { document.body.click(); await new Promise((r) => setTimeout(r, 20)); });
  expect(screen.queryByRole("dialog", { name: "Your friends" })).toBeNull();
});
