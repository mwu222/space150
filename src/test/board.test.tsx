// Whiteboard: friends' drawings carry their name, a notice flags new friend posts, pens have colours.
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { calls, db, fake, ME, rpcs } from "./fakeSupabase";
vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
if (!(window as any).PointerEvent) (window as any).PointerEvent = class extends MouseEvent { pointerId = 1; };
const F = "22222222-2222-2222-2222-222222222222";
let errors: unknown[] = [];
beforeEach(() => {
  errors = []; vi.spyOn(console, "error").mockImplementation((...a) => { errors.push(a); });
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any;
  localStorage.clear();
  rpcs.list_friends = [{ id: F, username: "jordan_p", display_name: "Jordan", avatar_color: "#D6E8F7", last_seen_at: null, allow_board_posts: true, status: "accepted", incoming: false }];
  db.board_items.push({ id: "00000000-0000-0000-0000-000000000077", owner_id: ME, author_id: F, kind: "drawing", body: null, caption: null, color: null,
    strokes: [{ color: "#3E6FB0", width: 3, points: [[10, 10], [80, 60]] }, { color: "#B5562E", width: 3, points: [[20, 90], [120, 40]] }],
    image_path: null, x: 200, y: 200, z: 1, kept: false, expires_at: new Date(Date.now() + 20 * 3600_000).toISOString(), created_at: new Date().toISOString() });
});
afterEach(() => { cleanup(); calls.length = 0; vi.restoreAllMocks(); db.board_items.pop(); rpcs.list_friends = []; });
const wait = (ms = 120) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

it("friend drawing shows their name and colours; new-post notice shows and clears", async () => {
  await act(async () => { render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>); }); await wait();
  expect(screen.getByText("From Jordan")).toBeTruthy();
  const strokes = [...document.querySelectorAll('[aria-label^="Drawing from Jordan"] > svg path')].map((p) => p.getAttribute("stroke"));
  expect(strokes).toEqual(["#3E6FB0", "#B5562E"]);
  expect(screen.getByText("New post from Jordan")).toBeTruthy();
  // Like notes, a friend's drawing goes after 24 h unless kept.
  expect(screen.getByText("20h left")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Keep this drawing on your whiteboard" })); await wait();
  expect(calls.some((c) => c.op === "rpc" && c.table === "keep_board_item" && (c.payload as any).p_id === "00000000-0000-0000-0000-000000000077")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "SHOW" })); await wait();
  expect(screen.queryByText("New post from Jordan")).toBeNull();
  expect(errors.filter((e) => !String((e as any)[0]).includes("scrollTo"))).toEqual([]);
});

it("drawing with a coloured pen saves that colour", async () => {
  await act(async () => { render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>); }); await wait();
  fireEvent.click(screen.getAllByRole("button").find((b) => b.textContent?.trim() === "Draw")!); await wait();
  fireEvent.click(screen.getByRole("button", { name: "Green pen" }));
  const pad = document.querySelector('[role="dialog"] div[style*="crosshair"]') as HTMLElement;
  pad.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 170, right: 300, bottom: 170, x: 0, y: 0, toJSON() {} }) as DOMRect;
  fireEvent.pointerDown(pad, { clientX: 10, clientY: 10 }); fireEvent.pointerMove(pad, { clientX: 60, clientY: 40 }); fireEvent.pointerUp(pad);
  fireEvent.click(screen.getAllByRole("button").find((b) => /ADD TO BOARD|ADD|POST/.test(b.textContent?.trim() || "") && b.closest('[role="dialog"]'))!); await wait(200);
  const ins = calls.find((c) => c.table === "board_items" && c.op === "insert" && (c.payload as any).kind === "drawing");
  expect((ins!.payload as any).strokes[0].color).toBe("#4F7D3F");
});

it("whiteboard posts go from the Friends list in the profile pop-up, not the lamp", async () => {
  await act(async () => { render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>); }); await wait();
  fireEvent.click(screen.getByRole("button", { name: /Friends — see who/ })); await wait();
  expect(screen.queryByRole("button", { name: "Post on Jordan’s whiteboard" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Your profile and settings" })); await wait();
  fireEvent.click(screen.getAllByRole("button").find((b) => b.textContent?.trim().startsWith("Friends ·"))!); await wait();
  const list = screen.getByRole("dialog", { name: "Friends" });
  fireEvent.click(within(list).getByRole("button", { name: "Post on Jordan’s whiteboard" })); await wait();
  const pop = screen.getByRole("dialog", { name: /Jordan/ });
  fireEvent.click(within(pop).getAllByRole("button").find((b) => /note/i.test(b.textContent || ""))!); await wait();
  fireEvent.change(within(pop).getByRole("textbox"), { target: { value: "Good luck today" } });
  fireEvent.click(within(pop).getAllByRole("button").find((b) => /^(POST|SEND)/.test(b.textContent?.trim() || ""))!); await wait(300);
  const ins = calls.find((c) => c.table === "board_items" && c.op === "insert");
  expect(ins!.payload).toEqual(expect.objectContaining({ owner_id: F, kind: "note", body: "Good luck today" }));
  expect(within(screen.getByRole("dialog", { name: "Friends" })).getByText(/posted on Jordan’s whiteboard/)).toBeTruthy();
});
