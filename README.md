# space150: website

Every page is built straight from the design boards in the space150 canvas: Log in / Sign up, Home, Schedule and Study, each with a desktop and a phone version. The markup, styles and behaviour are the boards' own, so the site looks and works like the designs. A small "bridge" for each page connects it to the Supabase backend in `space150-backend.zip`.

## Run it on your computer

You need Node.js 20+ and your Supabase project, with every backend migration pushed (`npx supabase db push --linked` in the backend folder).

1. **Add your keys.** Put `.env.local` in this folder, with `VITE_SUPABASE_URL=...` and `VITE_SUPABASE_ANON_KEY=...`.
2. **Start the site.** Run `npm install`, then `npm run dev`, and open http://localhost:5173.

`npm test` runs the checks (every page on desktop and phone, plus the saving of tasks, focus time, board posts, friend requests, schedule items and decks).

## How it fits together

```
src/boards/        GENERATED from the design boards. Don't edit these by hand.
  Main.view.tsx      the Home board's markup as React (MainMobile.view.tsx is the phone version)
  Main.logic.ts      the Home board's own logic (timer, to-do, whiteboard, friends …)
  … Login, Schedule, Study the same way; boards.css holds the boards' shared styles
src/bridges/       loads real data into each board and saves its changes to Supabase
src/runtime/dc.tsx  runs a board's logic inside React
src/App.tsx         picks the desktop or phone board (under 860px wide = phone) and the page
src/lib/            backend calls (same as the backend's client folder)
src/state/          sign-in and friends/presence
tools/              the design boards and the converter that produced src/boards
```

**When the designs change:** copy the updated `.dc.html` boards into `tools/design/`, then run `python3 tools/build_boards.py`. Everything in `src/boards` is rebuilt.

`tools/build_boards.py` also makes a few small, listed changes so the boards use real data:
- sample friends, posts and tasks are replaced by yours
- the "[Image]" placeholder becomes your photo
- the friend photo button opens a real file picker
- "Log out" and "Log in" actually sign you out and in

## Put it online

The same as before: GitHub Desktop → commit → push, and Vercel deploys it. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in Vercel. `vercel.json` makes links like `/schedule` work when someone reloads the page.

## Notes

- **Log in uses your email.** Usernames are for friends to find you.
- **Pages stay open** once visited, so a running timer keeps going while you're on Schedule or Study.
- **When focus time is saved:**
  - Countdown and Stopwatch save when paused, every 2 minutes, and when the tab is hidden.
  - Pomodoro saves when each focus session finishes, so the 🍅 count stays right.
- **Deleting a whiteboard item** waits for the board's 5-second Undo before it's actually removed.
- **The board sizes differ:** the desktop board is 1000×720 and the phone board is 640×840. Items placed on one are kept inside the other's edges.
