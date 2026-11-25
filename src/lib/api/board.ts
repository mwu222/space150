// Home → Whiteboard: your notes, drawings and photos, plus friends' posts (gone after 24 h unless kept).
import { sb, unwrap, myId } from "../supabase";
import type { BoardItem, Stroke } from "../types";

/** Items on a board you can see (your own board by default). Expired posts are filtered out by the database. */
export async function listBoard(ownerId?: string): Promise<BoardItem[]> {
  const owner = ownerId ?? (await myId());
  return unwrap(await sb().from("board_items").select("*").eq("owner_id", owner).order("z").order("created_at")) as BoardItem[];
}

// ── Posting (ownerId = your id for your own board, or a friend's id) ──
export async function postNote(ownerId: string, body: string, at: { x: number; y: number }, color?: string) {
  const author_id = await myId();
  return unwrap(await sb().from("board_items").insert({ owner_id: ownerId, author_id, kind: "note", body: body.trim(), color: color ?? null, ...at }).select().single()) as BoardItem;
}
export async function postDrawing(ownerId: string, strokes: Stroke[], at: { x: number; y: number }) {
  const author_id = await myId();
  return unwrap(await sb().from("board_items").insert({ owner_id: ownerId, author_id, kind: "drawing", strokes, ...at }).select().single()) as BoardItem;
}
/** Uploads the image to the board owner's folder, then adds the item. */
export async function postPhoto(ownerId: string, file: File, caption: string, at: { x: number; y: number }) {
  const author_id = await myId();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${ownerId}/${crypto.randomUUID()}.${ext}`;
  unwrap(await sb().storage.from("board-photos").upload(path, file, { contentType: file.type }));
  const res = await sb().from("board_items").insert({
    owner_id: ownerId, author_id, kind: "photo", image_path: path, caption: caption.trim() || null, ...at,
  }).select().single();
  if (res.error) { await sb().storage.from("board-photos").remove([path]); throw new Error(res.error.message); }
  return res.data as BoardItem;
}

/** Private photos need a short-lived signed link to display. */
export async function photoUrl(path: string, seconds = 3600): Promise<string> {
  const { data, error } = await sb().storage.from("board-photos").createSignedUrl(path, seconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// ── Arranging your board ──
export async function moveItem(id: string, x: number, y: number, z?: number) {
  unwrap(await sb().from("board_items").update(z === undefined ? { x, y } : { x, y, z }).eq("id", id));
}
/** Edit your own note's text or colour (friends' posts can't be changed). */
export async function editMyNote(id: string, patch: { body?: string; color?: string }) {
  unwrap(await sb().from("board_items").update(patch).eq("id", id));
}
/** "Keep" a friend's post so it doesn't disappear after 24 hours. */
export async function keepItem(id: string) {
  unwrap(await sb().rpc("keep_board_item", { p_id: id }));
}
/** Undo "Keep": the post goes back to disappearing 24 hours after it was sent. */
export async function unkeepItem(id: string) {
  unwrap(await sb().from("board_items").update({ kept: false }).eq("id", id));
}
export async function deleteItem(item: Pick<BoardItem, "id" | "kind" | "image_path">) {
  unwrap(await sb().from("board_items").delete().eq("id", item.id));
  if (item.kind === "photo" && item.image_path) await sb().storage.from("board-photos").remove([item.image_path]);
}

/** Hours left before a friend's post disappears (null = never). */
export function hoursLeft(item: Pick<BoardItem, "expires_at">): number | null {
  if (!item.expires_at) return null;
  return Math.max(0, Math.ceil((new Date(item.expires_at).getTime() - Date.now()) / 3_600_000));
}

/** Live updates: a friend's post appears on your board without refreshing. */
export function onBoardChange(ownerId: string, cb: () => void) {
  const ch = sb().channel("board-" + ownerId)
    .on("postgres_changes", { event: "*", schema: "public", table: "board_items", filter: `owner_id=eq.${ownerId}` }, cb)
    .subscribe();
  return () => { sb().removeChannel(ch); };
}
