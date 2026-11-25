// Home → lamp button: friends list, who's in their space, requests.
import { sb, unwrap } from "../supabase";
import type { Friend, ProfileSearchResult } from "../types";

export async function listFriends(): Promise<Friend[]> {
  return unwrap(await sb().rpc("list_friends")) as Friend[];
}
export async function searchPeople(query: string): Promise<ProfileSearchResult[]> {
  if (query.trim().length < 2) return [];
  return unwrap(await sb().rpc("search_profiles", { p_query: query })) as ProfileSearchResult[];
}
/** Returns "requested", "accepted" (they'd already asked you), "already_friends" or "already_requested". */
export async function sendFriendRequest(username: string): Promise<string> {
  return unwrap(await sb().rpc("send_friend_request", { p_username: username })) as string;
}
export async function respondToRequest(otherId: string, accept: boolean) {
  unwrap(await sb().rpc("respond_friend_request", { p_other: otherId, p_accept: accept }));
}
/** Unfriend or cancel a request you sent. Unkept posts between you are removed. */
export async function removeFriend(otherId: string) {
  unwrap(await sb().rpc("remove_friend", { p_other: otherId }));
}
export function onFriendshipsChange(cb: () => void) {
  const ch = sb().channel("friendships-" + Math.random().toString(36).slice(2))
    .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, cb)
    .subscribe();
  return () => { sb().removeChannel(ch); };
}
