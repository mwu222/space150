// Interactions on the boards turn into the right backend calls, with no errors.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { calls, fake, ME, rpcs } from "./fakeSupabase";

vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
let errors: unknown[] = [];
beforeEach(() => { errors = []; vi.spyOn(console, "error").mockImplementation((...a) => { errors.push(a); }); window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any; });
afterEach(() => { cleanup(); calls.length = 0; vi.restoreAllMocks(); });
const wait = (ms = 60) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
const at = async (path: string) => { await act(async () => { render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}><App /></MemoryRouter>); }); await wait(80); };
const btn = (text: string) => screen.getAllByRole("button").find((b) => b.textContent?.trim() === text)!;

describe("Home sync", () => {
  it("timer runs and saves focus time on pause; quick note posts to the board", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await at("/");
    fireEvent.click(btn("START"));
    await act(async () => { vi.advanceTimersByTime(5000); });
    fireEvent.click(btn("PAUSE"));
    await wait();
    expect(calls.some((c) => c.table === "focus_sessions" && c.op === "insert")).toBe(true);
    const qn = document.getElementById("quicknote") as HTMLInputElement;
    fireEvent.change(qn, { target: { value: "Bring calculator" } });
    fireEvent.keyDown(qn, { key: "Enter" });
    await wait();
    expect(calls.some((c) => c.table === "board_items" && c.op === "insert" && (c.payload as any).body === "Bring calculator")).toBe(true);
    vi.useRealTimers();
    expect(errors).toEqual([]);
  });
});

describe("Schedule sync", () => {
  it("adding a month item saves it", async () => {
    await at("/schedule");
    fireEvent.click(screen.getByRole("button", { name: "MONTH" }));
    const input = screen.getAllByLabelText("New item title")[0] as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Science fair" } });
    fireEvent.click(screen.getAllByRole("button").filter((b) => b.textContent?.trim() === "ADD").pop()!);
    await wait();
    expect(calls.some((c) => c.table === "month_items" && c.op === "insert")).toBe(true);
    expect(errors).toEqual([]);
  });
});

describe("Study sync", () => {
  it("creating a deck from scratch saves it", async () => {
    await at("/study");
    fireEvent.click(btn("+ CREATE DECK"));
    fireEvent.click(screen.getByText("Create from scratch"));
    fireEvent.change(screen.getByLabelText("Deck name"), { target: { value: "Verbs" } });
    fireEvent.change(screen.getByLabelText("Card 1 front"), { target: { value: "hablar" } });
    fireEvent.change(screen.getByLabelText("Card 1 back"), { target: { value: "to speak" } });
    fireEvent.click(btn("SAVE DECK"));
    await wait(120);
    expect(calls.some((c) => c.op === "rpc" && c.table === "save_deck")).toBe(true);
    expect(errors).toEqual([]);
  });
});

describe("Friends sync", () => {
  it("accepting a request and searching for someone", async () => {
    rpcs.list_friends = [{ id: "22222222-2222-2222-2222-222222222222", username: "ben", display_name: "Ben", avatar_color: "#F3EEF7", last_seen_at: null, allow_board_posts: true, status: "pending", incoming: true }];
    rpcs.search_profiles = [{ id: "33333333-3333-3333-3333-333333333333", username: "cyd", display_name: "Cy", avatar_color: "#FBE9E2", relation: "none" }];
    await at("/");
    fireEvent.click(screen.getByRole("button", { name: "Your profile and settings" }));
    fireEvent.click(screen.getAllByRole("button").find((b) => /^Friends/.test(b.textContent?.trim() || "") && b.getAttribute("aria-haspopup") === "dialog")!);
    fireEvent.click(screen.getByRole("button", { name: "Accept friend request from Ben" }));
    await wait();
    expect(calls.some((c) => c.op === "rpc" && c.table === "respond_friend_request" && (c.payload as any).p_accept === true)).toBe(true);
    fireEvent.click(btn("Add"));
    fireEvent.change(screen.getByLabelText("Search by username or name"), { target: { value: "cy" } });
    await wait();
    fireEvent.click(screen.getByRole("button", { name: "Send Cy a friend request" }));
    await wait();
    expect(calls.some((c) => c.op === "rpc" && c.table === "send_friend_request" && (c.payload as any).p_username === "cyd")).toBe(true);
    rpcs.list_friends = []; rpcs.search_profiles = [];
    expect(errors).toEqual([]);
  });
});
