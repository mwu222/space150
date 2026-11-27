import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./state/landing";
import "./boards/boards.css";
import { initSupabase } from "./lib/api";
import { App } from "./App";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const root = createRoot(document.getElementById("root")!);

if (!url || !key) {
  root.render(<div style={{ padding: 24, fontFamily: "system-ui" }}>
    <h1>space150 isn’t connected yet</h1>
    <p>Create a file called <code>.env.local</code> in the project folder with your Supabase URL and anon key (see <code>.env.example</code>), then restart <code>npm run dev</code>.</p>
  </div>);
} else {
  initSupabase(url, key);
  root.render(<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></BrowserRouter>);
}

// Keep the app on this device so it opens offline (production builds only).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => {}); });
}
