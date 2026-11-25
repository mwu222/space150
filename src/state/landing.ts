// The address the app was opened with, captured before Supabase reads (and tidies) the sign-in link in it.
const href = typeof window !== "undefined" ? window.location.href : "";
const params = new URLSearchParams((href.split("#")[1] || "") + "&" + (href.split("?")[1] || "").split("#")[0]);
export const landing = {
  /** The confirmation link didn't work (expired or already used). */
  linkError: params.get("error_code") || params.get("error") || "",
  /** Opened from a sign-up confirmation email. */
  fromSignup: params.get("type") === "signup",
};
