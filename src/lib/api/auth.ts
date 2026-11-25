// Log in / sign up page and Settings.
import { sb, unwrap, myId } from "../supabase";
import type { Profile } from "../types";

export async function usernameAvailable(username: string): Promise<boolean> {
  return unwrap(await sb().rpc("username_available", { p_username: username })) as boolean;
}

/** Sign up with a chosen username. The database creates the profile (with a random avatar colour), timer settings and starter subjects. */
export async function signUp(email: string, password: string, username: string, displayName: string) {
  if (!(await usernameAvailable(username))) throw new Error("That username is taken");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return unwrap(await sb().auth.signUp({
    email, password,
    options: { data: { username, display_name: displayName, timezone }, emailRedirectTo: confirmUrl() },
  }));
}

/** Where the confirmation email's link lands (add it under Supabase → Authentication → URL Configuration → Redirect URLs). */
export const confirmUrl = () => (typeof window !== "undefined" ? window.location.origin : "") + "/verified";

/** "Resend email" / "Send a new link" on the confirmation page. */
export async function resendConfirmation(email: string) {
  const { error } = await sb().auth.resend({ type: "signup", email, options: { emailRedirectTo: confirmUrl() } });
  if (error) throw new Error(/rate|seconds/i.test(error.message) ? "Please wait a minute before asking for another email." : error.message);
}

export async function logIn(email: string, password: string) {
  return unwrap(await sb().auth.signInWithPassword({ email, password }));
}

export async function logOut() {
  const { error } = await sb().auth.signOut();
  if (error) throw new Error(error.message);
}

export async function sendPasswordReset(email: string, redirectTo: string) {
  const { error } = await sb().auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
}

export async function getMyProfile(): Promise<Profile> {
  const id = await myId();
  return unwrap(await sb().from("profiles").select("*").eq("id", id).single()) as Profile;
}

/** Edit profile (name, username) and Settings ("Let friends post on my whiteboard"). Check a new username with usernameAvailable first. */
export async function updateMyProfile(patch: Partial<Pick<Profile, "display_name" | "username" | "timezone" | "allow_board_posts" | "hidden_kinds">>) {
  const id = await myId();
  return unwrap(await sb().from("profiles").update(patch).eq("id", id).select().single()) as Profile;
}

/** Avatar = first letter of the display name on the profile's random colour. */
export function avatarInitial(displayName: string): string {
  return (displayName.replace(/[^\p{L}]/gu, "").charAt(0) || "?").toUpperCase();
}
