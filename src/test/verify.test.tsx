// Email confirmation page: "check your inbox" after sign-up, "email confirmed" from the link.
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { calls, fake, ME, rpcs } from "./fakeSupabase";
vi.mock("../lib/supabase", async (orig) => ({ ...(await orig<typeof import("../lib/supabase")>()), sb: () => fake, myId: async () => ME }));
const { App } = await import("../App");
let errors: unknown[] = [];
beforeEach(() => { errors = []; vi.spyOn(console, "error").mockImplementation((...a) => { errors.push(a); }); window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any; });
afterEach(() => { cleanup(); calls.length = 0; vi.restoreAllMocks(); fake.auth.session = { user: { id: ME } }; });
const wait = (ms = 80) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
const at = async (path: string) => { await act(async () => { render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}><App /></MemoryRouter>); }); await wait(); };

it("request access: sends name, username and email, then shows Request sent", async () => {
  fake.auth.session = null;
  rpcs.username_available = true;
  await at("/");
  fireEvent.click(screen.getAllByRole("tab")[1]);
  expect(document.getElementById("pw")).toBeNull();
  fireEvent.change(document.getElementById("name")!, { target: { value: "Maggie" } });
  fireEvent.change(document.getElementById("uname")!, { target: { value: "maggie_w" } }); await wait();
  fireEvent.change(document.getElementById("email")!, { target: { value: "maggie@example.com" } });
  fireEvent.click(screen.getByText("REQUEST ACCESS", { selector: "a, button:not([role=tab])" })); await wait(150);
  expect(calls.find((c) => c.op === "rpc" && c.table === "request_access")!.payload).toEqual({ p_email: "maggie@example.com", p_username: "maggie_w", p_name: "Maggie" });
  expect(screen.getByRole("heading", { name: "Request sent" })).toBeTruthy();
  expect(screen.getByText("maggie@example.com")).toBeTruthy();
  fireEvent.click(screen.getByText("Back to log in")); await wait();
  expect(document.getElementById("pw")).toBeTruthy();
  expect(errors.filter((e) => !String((e as any)[0]).includes("style property during rerender"))).toEqual([]);
});

it("invited person chooses a password first", async () => {
  fake.auth.session = { user: { id: ME, user_metadata: { needs_password: true } } };
  await at("/welcome");
  expect(screen.getByRole("heading", { name: "Choose a password" })).toBeTruthy();
  fireEvent.change(document.getElementById("vpw")!, { target: { value: "short" } });
  fireEvent.click(screen.getByText("SAVE AND GO TO MY SPACE")); await wait();
  expect(screen.getByText("Use at least 8 characters.")).toBeTruthy();
  fireEvent.change(document.getElementById("vpw")!, { target: { value: "longenough1" } });
  fireEvent.click(screen.getByText("SAVE AND GO TO MY SPACE")); await wait();
  expect((calls.find((c) => c.op === "updateUser")!.payload as any)).toEqual({ password: "longenough1", data: { needs_password: false } });
});

it("owner approves a request and an invite email goes out", async () => {
  rpcs.is_admin = true;
  rpcs.list_access_requests = [{ id: "00000000-0000-0000-0000-000000000099", email: "jo@example.com", username: "jo_p", display_name: "Jo", status: "pending", created_at: new Date().toISOString() }];
  await at("/");
  fireEvent.click(screen.getByRole("button", { name: "Your profile and settings" })); await wait();
  expect(screen.getByText("Access requests")).toBeTruthy();
  cleanup();
  await at("/requests");
  expect(screen.getByText("1 waiting")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "APPROVE" })); await wait(150);
  expect(calls.find((c) => c.table === "decide_access_request")!.payload).toEqual({ p_id: "00000000-0000-0000-0000-000000000099", p_approve: true });
  const otp = calls.find((c) => c.op === "otp")!.payload as any;
  expect(otp.email).toBe("jo@example.com");
  expect(otp.options.data).toMatchObject({ username: "jo_p", display_name: "Jo", needs_password: true });
  expect(otp.options.emailRedirectTo).toMatch(/\/welcome$/);
  rpcs.is_admin = false; rpcs.list_access_requests = [];
});

it("opening the link: email confirmed, then into the space", async () => {
  await at("/verified");
  expect(screen.getByRole("heading", { name: "Email confirmed" })).toBeTruthy();
  expect(screen.getByText(/Thanks, Maggie\./)).toBeTruthy();
  fireEvent.click(screen.getByText("GO TO MY SPACE")); await wait();
  expect(document.getElementById("newtask")).toBeTruthy();
  expect(errors).toEqual([]);
});
