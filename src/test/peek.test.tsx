// Tapping a deck shows known / still-learning cards and can start a round of just the unknown ones.
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { calls, db, fake, ME } from "./fakeSupabase";
vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
let errors: unknown[] = [];
beforeEach(() => {
  errors = []; vi.spyOn(console, "error").mockImplementation((...a) => { errors.push(a); });
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any;
  db.decks[0].cards.push({ id: "00000000-0000-0000-0000-000000000066", position: 1, front: "Mitochondria", back: "Makes energy", known: true });
});
afterEach(() => { cleanup(); calls.length = 0; vi.restoreAllMocks(); db.decks[0].cards.pop(); });
const wait = (ms = 100) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

it("deck summary pop-up", async () => {
  await act(async () => { render(<MemoryRouter initialEntries={["/study"]}><App /></MemoryRouter>); }); await wait();
  fireEvent.click(screen.getByText("Cell biology")); await wait();
  expect(screen.queryByRole("dialog", { name: "Cell biology" })).toBeNull();
  expect(screen.getByRole("button", { name: "Study Cell biology" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "See which cards you know in Cell biology" })); await wait();
  const dlg = screen.getByRole("dialog", { name: "Cell biology" });
  expect(dlg.textContent).toContain("STILL LEARNING · 1");
  expect(dlg.textContent).toContain("KNOWN · 1");
  expect(dlg.textContent).toContain("Ribosome");
  expect(dlg.textContent).toContain("Mitochondria");
  expect(dlg.textContent).not.toContain("Builds proteins");
  fireEvent.click(screen.getByRole("switch", { name: "Show answers" })); await wait();
  expect(dlg.textContent).toContain("Builds proteins");
  fireEvent.click(screen.getByRole("button", { name: "STUDY THE 1 I DON’T KNOW" })); await wait();
  expect(screen.queryByRole("dialog", { name: "Cell biology" })).toBeNull();
  expect(document.body.textContent).toContain("Ribosome");
  expect(document.body.textContent).not.toContain("Mitochondria");
  expect(errors).toEqual([]);
});
