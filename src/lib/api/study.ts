// Study page: subjects, quizzes and flashcard decks.
import { sb, unwrap, myId } from "../supabase";
import type { Card, Deck, Quiz, QuizItem, Subject } from "../types";

// ── Subjects (shared by quizzes and decks) ──
export const SUBJECT_COLOURS = [
  { label: "Teal",  dot: "#4E8C8A", paper: "#EAF3F2", paper2: "#D9E9E7" },
  { label: "Blue",  dot: "#5B7DB8", paper: "#EDF1F8", paper2: "#DCE4F1" },
  { label: "Pink",  dot: "#C46A93", paper: "#F8ECF2", paper2: "#F0DCE6" },
  { label: "Brown", dot: "#9A7552", paper: "#F4EEE7", paper2: "#E9DFD3" },
  { label: "Slate", dot: "#6E7681", paper: "#EFF0F2", paper2: "#E1E3E7" },
  { label: "Olive", dot: "#8E8A3E", paper: "#F4F3E6", paper2: "#E8E6CF" },
] as const;

export async function listSubjects(): Promise<Subject[]> {
  return unwrap(await sb().from("subjects").select("*").order("position").order("created_at")) as Subject[];
}
export async function addSubject(name: string, colourIndex: number): Promise<Subject> {
  const user_id = await myId();
  const c = SUBJECT_COLOURS[colourIndex] ?? SUBJECT_COLOURS[0];
  const res = await sb().from("subjects").insert({
    user_id, name: name.trim().replace(/\s+/g, " "), dot: c.dot, paper: c.paper, paper2: c.paper2,
    position: Date.now() % 1_000_000,
  }).select().single();
  if (res.error?.code === "23505") throw new Error("You already have that subject.");
  return unwrap(res) as Subject;
}
/** Deletes a subject; its quizzes and decks move to "General". Returns General's id if used. */
export async function deleteSubject(id: string): Promise<string | null> {
  return unwrap(await sb().rpc("delete_subject", { p_subject: id })) as string | null;
}

// ── Quizzes ──
export async function listQuizzes(): Promise<Quiz[]> {
  return unwrap(await sb().from("quizzes").select("*, quiz_items(id, position, question, answer)")
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "quiz_items" })) as Quiz[];
}
/** Create (id = null) or replace a quiz's questions. Used by Import and Create from scratch. */
export async function saveQuiz(id: string | null, name: string, subjectId: string, items: QuizItem[]): Promise<string> {
  const clean = items.map((i) => ({ question: i.question.trim(), answer: i.answer.trim() })).filter((i) => i.question && i.answer);
  return unwrap(await sb().rpc("save_quiz", { p_quiz: id, p_name: name, p_subject: subjectId, p_items: clean })) as string;
}
export async function deleteQuiz(id: string) {
  unwrap(await sb().from("quizzes").delete().eq("id", id));
}
/** Save a finished answer session; best score updates automatically. */
export async function recordQuizAttempt(quizId: string, score: number, total: number, results: unknown[] = []) {
  const user_id = await myId();
  unwrap(await sb().from("quiz_attempts").insert({ quiz_id: quizId, user_id, score, total, results }));
}

// ── Flashcard decks ──
export async function listDecks(): Promise<Deck[]> {
  return unwrap(await sb().from("decks").select("*, cards(id, position, front, back, known)")
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "cards" })) as Deck[];
}
/** Create (id = null) or replace a deck's cards. Pass `known` to keep progress on unchanged cards. */
export async function saveDeck(id: string | null, name: string, subjectId: string, cards: Card[]): Promise<string> {
  const clean = cards.map((c) => ({ front: c.front.trim(), back: c.back.trim(), known: !!c.known })).filter((c) => c.front && c.back);
  return unwrap(await sb().rpc("save_deck", { p_deck: id, p_name: name, p_subject: subjectId, p_cards: clean })) as string;
}
export async function deleteDeck(id: string) {
  unwrap(await sb().from("decks").delete().eq("id", id));
}
/** "I know it" / "Still learning". */
export async function markCard(cardId: string, known: boolean) {
  unwrap(await sb().from("cards").update({ known }).eq("id", cardId));
}

// ── Import helpers (Paste from AI / CSV upload) ──
/** Parses "front | back" lines, or two-column CSV/TSV. */
export function parsePairs(text: string): { ok: [string, string][]; bad: string[] } {
  const ok: [string, string][] = [], bad: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.includes("|") ? line.split("|") : line.includes("\t") ? line.split("\t") : splitCsv(line);
    const a = (parts[0] ?? "").trim(), b = parts.slice(1).join(line.includes("|") ? "|" : ", ").trim();
    if (a && b) ok.push([a, b]); else bad.push(line);
  }
  return { ok, bad };
}
function splitCsv(line: string): string[] {
  const out: string[] = []; let cur = "", q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}
