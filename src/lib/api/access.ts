// Invite-only sign-up: "Request access", the owner's Access requests page, and the first password.
import { sb, unwrap } from "../supabase";

export type AccessResult = "pending" | "approved" | "exists";
export interface AccessRequest { id: string; email: string; username: string; display_name: string; status: "pending" | "approved" | "declined"; created_at: string }

export async function requestAccess(email: string, username: string, name: string): Promise<AccessResult> {
  return unwrap(await sb().rpc("request_access", { p_email: email, p_username: username, p_name: name })) as AccessResult;
}
export async function isAdmin(): Promise<boolean> {
  return !!unwrap(await sb().rpc("is_admin"));
}
export async function listAccessRequests(): Promise<AccessRequest[]> {
  return (unwrap(await sb().rpc("list_access_requests")) || []) as AccessRequest[];
}
export async function decideAccessRequest(id: string, approve: boolean) {
  return unwrap(await sb().rpc("decide_access_request", { p_id: id, p_approve: approve }));
}
/** Emails an approved person a sign-in link that creates their account; they choose a password on arrival. */
export async function sendInvite(r: Pick<AccessRequest, "email" | "username" | "display_name">) {
  const { error } = await sb().auth.signInWithOtp({
    email: r.email,
    options: { shouldCreateUser: true, emailRedirectTo: window.location.origin + "/welcome", data: { username: r.username, display_name: r.display_name, needs_password: true } },
  });
  if (error) throw new Error(/rate|seconds/i.test(error.message) ? "Supabase is limiting emails right now. Wait a few minutes, then use Resend invite." : error.message);
}
/** First password for an invited account. */
export async function setFirstPassword(password: string) {
  const { error } = await sb().auth.updateUser({ password, data: { needs_password: false } });
  if (error) throw new Error(error.message);
}
