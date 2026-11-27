// Flashcards keep working without a connection, and changes are sent when it's back.
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { calls, fake, ME } from "./fakeSupabase";
vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
let errors: unknown[] = [];
let online = true;
const realFrom = fake.from, realRpc = fake.rpc;
const down = () => ({ data: null, error: { message: "TypeError: Failed to fetch" } });
function goOffline() {
  online = false;
  fake.from = (() => { const q: any = {}; for (const m of ["eq", "neq", "gte", "lte", "in", "not", "order", "limit", "select", "insert", "upsert", "update", "delete", "single", "maybeSingle"]) q[m] = () => q; q.then = (ok: any, bad: any) => Promise.resolve(down()).then(ok, bad); return q; }) as any;
  fake.rpc = (async () => down()) as any;
}
function goOnline() { online = true; fake.from = realFrom; fake.rpc = realRpc; window.dispatchEvent(new Event("online")); }
beforeEach(() => {
  errors = []; vi.spyOn(console, "error").mockImplementation((...a) => { errors.push(a); });
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any;
  Object.defineProperty(window.navigator, "onLine", { configurable: true, get: () => online });
  localStorage.clear();
  localStorage.setItem("sb-test-auth-token", JSON.stringify({ access_token: "x", user: { id: ME } }));   // what Supabase keeps after sign-in
});
afterEach(() => { cleanup(); calls.length = 0; vi.restoreAllMocks(); fake.from = realFrom; fake.rpc = realRpc; online = true; localStorage.clear(); });
const wait = (ms = 100) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
const open = async () => { await act(async () => { render(<MemoryRouter initialEntries={["/study"]}><App /></MemoryRouter>); }); await wait(); };

it("decks open and can be studied offline; marks are sent once back online", async () => {
  await open();
  expect(localStorage.getItem("space150:study:" + ME)).toContain("Ribosome");   // a copy is kept on the device
  cleanup();

  goOffline();
  await open();
  expect(screen.getByText("Cell biology")).toBeTruthy();                         // opens from the saved copy
  fireEvent.click(screen.getByRole("button", { name: "Study Cell biology" })); await wait();
  expect(document.body.textContent).toContain("Ribosome");
  fireEvent.click(screen.getByRole("button", { name: "I KNOW IT" })); await wait(300);
  expect(calls.filter((c) => c.table === "cards")).toEqual([]);
  expect(JSON.parse(localStorage.getItem("space150:study:" + ME)!).state.sets[0].known).toEqual([0]);   // waiting on the device
  expect(errors).toEqual([]);

  goOnline(); await wait(300);
  expect(calls.filter((c) => c.table === "cards" && c.op === "update")).toEqual([expect.objectContaining({ payload: { known: true } })]);
  const c = JSON.parse(localStorage.getItem("space150:study:" + ME)!);
  expect(JSON.stringify(c.base)).toBe(JSON.stringify(c.state));                 // nothing left to send
});

it("a deck made offline is saved once when the connection is back", async () => {
  await open(); cleanup();
  // As left on the device after making a deck offline: it has a page-made id and isn't on the server yet.
  const c = JSON.parse(localStorage.getItem("space150:study:" + ME)!);
  c.state.sets.push({ id: "f" + Date.now(), name: "Verbs", subject: "Biology", known: [], cards: [["ir", "to go"]] });
  localStorage.setItem("space150:study:" + ME, JSON.stringify(c));
  await open(); await wait(300);
  const saves = calls.filter((x) => x.op === "rpc" && x.table === "save_deck");
  expect(saves.length).toBe(1);
  expect(JSON.stringify(saves[0].payload)).toContain("to go");
  expect(errors).toEqual([]);
});

it("a quiz taken offline sends its score once back online", async () => {
  await open(); cleanup();
  goOffline();
  await open();
  fireEvent.click(screen.getAllByRole("button").find((b) => /start|take/i.test(b.getAttribute("aria-label") || "") && /Cells quiz/.test(b.getAttribute("aria-label") || ""))!); await wait();
  expect(document.body.textContent).toContain("What is ATP?");
  fireEvent.change(screen.getByRole("textbox", { name: /answer/i }), { target: { value: "Energy currency" } });
  fireEvent.click(screen.getAllByRole("button").find((b) => /check|reveal|submit/i.test(b.textContent || ""))!); await wait();
  fireEvent.click(screen.getAllByRole("button").find((b) => /^got it/i.test((b.textContent || "").trim()))!); await wait(300);
  expect(JSON.parse(localStorage.getItem("space150:study:" + ME)!).state.quizzes[0].best).toBe("1 of 1");
  expect(calls.filter((c) => c.table === "quiz_attempts")).toEqual([]);
  goOnline(); await wait(300);
  expect(calls.filter((c) => c.table === "quiz_attempts" && c.op === "insert")).toEqual([expect.objectContaining({ payload: expect.objectContaining({ score: 1, total: 1 }) })]);
  expect(errors).toEqual([]);
});

it("a quiz made and taken offline is saved with its score", async () => {
  await open(); cleanup();
  const c = JSON.parse(localStorage.getItem("space150:study:" + ME)!);
  c.state.quizzes.push({ id: 1764230000000, name: "Verbs quiz", subject: "Biology", best: "2 of 2", items: [["ir", "to go"], ["ser", "to be"]] });
  localStorage.setItem("space150:study:" + ME, JSON.stringify(c));
  await open(); await wait(300);
  expect(calls.filter((x) => x.op === "rpc" && x.table === "save_quiz").length).toBe(1);
  expect(calls.filter((x) => x.table === "quiz_attempts" && x.op === "insert")).toEqual([expect.objectContaining({ payload: expect.objectContaining({ quiz_id: "00000000-0000-0000-0000-000000000051", score: 2, total: 2 }) })]);
  expect(errors).toEqual([]);
});
