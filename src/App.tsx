// space150 — every page is drawn straight from its design board (desktop or phone),
// with the board's logic connected to Supabase by a bridge.
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./state/auth";
import { SocialProvider, useSocial } from "./state/social";
import { useBoard } from "./runtime/dc";
import type { Ctx } from "./bridges/ctx";
import { makeLogin } from "./bridges/login";
import { makeHome } from "./bridges/home";
import { makeSchedule } from "./bridges/schedule";
import { makeStudy } from "./bridges/study";
import { makeVerify } from "./bridges/verify";
import { makeRequests } from "./bridges/requests";
import { landing } from "./state/landing";
import LoginView from "./boards/Login.view";
import LoginMobileView from "./boards/LoginMobile.view";
import LoginLogic from "./boards/Login.logic";
import LoginMobileLogic from "./boards/LoginMobile.logic";
import MainView from "./boards/Main.view";
import MainMobileView from "./boards/MainMobile.view";
import MainLogic from "./boards/Main.logic";
import MainMobileLogic from "./boards/MainMobile.logic";
import ScheduleView from "./boards/Schedule.view";
import ScheduleMobileView from "./boards/ScheduleMobile.view";
import ScheduleLogic from "./boards/Schedule.logic";
import ScheduleMobileLogic from "./boards/ScheduleMobile.logic";
import StudyView from "./boards/Study.view";
import StudyMobileView from "./boards/StudyMobile.view";
import StudyLogic from "./boards/Study.logic";
import StudyMobileLogic from "./boards/StudyMobile.logic";
import VerifyView from "./boards/Verify.view";
import VerifyMobileView from "./boards/VerifyMobile.view";
import VerifyLogic from "./boards/Verify.logic";
import VerifyMobileLogic from "./boards/VerifyMobile.logic";
import RequestsView from "./boards/Requests.view";
import RequestsMobileView from "./boards/RequestsMobile.view";
import RequestsLogic from "./boards/Requests.logic";
import RequestsMobileLogic from "./boards/RequestsMobile.logic";

/* eslint-disable @typescript-eslint/no-explicit-any */
const Bridged = {
  login: [makeLogin(LoginLogic as any), makeLogin(LoginMobileLogic as any)],
  home: [makeHome(MainLogic as any, { w: 1000, h: 720 }), makeHome(MainMobileLogic as any, { w: 640, h: 840 })],
  schedule: [makeSchedule(ScheduleLogic as any), makeSchedule(ScheduleMobileLogic as any)],
  study: [makeStudy(StudyLogic as any), makeStudy(StudyMobileLogic as any)],
};
const Views = { login: [LoginView, LoginMobileView], home: [MainView, MainMobileView], schedule: [ScheduleView, ScheduleMobileView], study: [StudyView, StudyMobileView] };
type Page = keyof typeof Views;

export function useIsPhone() {
  const q = "(max-width: 860px)";
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.(q).matches);
  useEffect(() => { const m = window.matchMedia?.(q); if (!m) return; const h = () => setPhone(m.matches); m.addEventListener("change", h); return () => m.removeEventListener("change", h); }, []);
  return phone;
}

function Board({ page, phone, ctx }: { page: Page; phone: boolean; ctx?: { current: Ctx } }) {
  const i = phone ? 1 : 0;
  const Klass = Bridged[page][i] as any, View = Views[page][i] as any;
  const V = useBoard(() => new Klass({ ctx }));
  return <View V={V} />;
}

function Pages() {
  const { profile, refreshProfile } = useAuth();
  const social = useSocial();
  const phone = useIsPhone();
  const { pathname } = useLocation();
  const ctx = useRef<Ctx>(null as unknown as Ctx);
  const navigate = useNavigate();
  ctx.current = { profile: profile!, refreshProfile, social,
    openFriends: () => { (window as any).__space150OpenFriends = true; navigate("/"); setTimeout(() => window.dispatchEvent(new CustomEvent("space150:open-friends")), 30); } };
  const page: Page | null = pathname === "/" ? "home" : pathname === "/schedule" ? "schedule" : pathname === "/study" ? "study" : null;
  // Pages stay mounted once opened, so a running timer keeps going while you plan or study.
  const [opened, setOpened] = useState<Page[]>([]);
  useEffect(() => { if (page && !opened.includes(page)) setOpened((o) => [...o, page]); }, [page, opened]);
  // Friend list changed → refresh the Home board's request lists.
  const homeKey = useMemo(() => social.friends.map((f) => f.id + f.status).join(","), [social.friends]);
  useEffect(() => { window.dispatchEvent(new CustomEvent("space150:friends")); }, [homeKey]);
  if (!page) return <Navigate to="/" replace />;
  const all = Array.from(new Set<Page>([...opened, page]));
  return <>{all.map((p) => <div key={p + (phone ? "-m" : "-d")} style={{ display: p === page ? "block" : "none" }}><Board page={p} phone={phone} ctx={ctx} /></div>)}</>;
}

const VerifyKlass = [makeVerify(VerifyLogic as any), makeVerify(VerifyMobileLogic as any)];
const VerifyViews = [VerifyView, VerifyMobileView];
type VerifyProps = { mode: "verified" | "sent" | "expired" | "requested" | "setpw"; email?: string; name?: string; signedIn?: boolean; onGo?: () => void; onBack?: () => void };
function VerifyPage(props: VerifyProps & { phone: boolean }) {
  const i = props.phone ? 1 : 0;
  const Klass = VerifyKlass[i] as any, View = VerifyViews[i] as any;
  const V = useBoard(() => new Klass(props));
  return <View V={V} />;
}

const RequestsKlass = [makeRequests(RequestsLogic as any), makeRequests(RequestsMobileLogic as any)];
const RequestsViews = [RequestsView, RequestsMobileView];
function RequestsPage({ phone }: { phone: boolean }) {
  const i = phone ? 1 : 0;
  const Klass = RequestsKlass[i] as any, View = RequestsViews[i] as any;
  const V = useBoard(() => new Klass({}));
  return <View V={V} />;
}

function Gate() {
  const { session, profile, loading } = useAuth();
  const phone = useIsPhone();
  const { pathname } = useLocation();
  const nav = useNavigate();
  // Just signed up / asked for access: show the matching page until they go back to log in.
  const [sent, setSent] = useState<{ email: string; name: string; kind: "sent" | "requested" } | null>(null);
  useEffect(() => {
    const s1 = (e: Event) => setSent({ ...(e as CustomEvent).detail, kind: "sent" });
    const s2 = (e: Event) => setSent({ ...(e as CustomEvent).detail, kind: "requested" });
    window.addEventListener("space150:verify-sent", s1);
    window.addEventListener("space150:requested", s2);
    return () => { window.removeEventListener("space150:verify-sent", s1); window.removeEventListener("space150:requested", s2); };
  }, []);
  // A confirmation link that landed somewhere other than /verified still shows the confirmation page.
  if ((landing.linkError || landing.fromSignup) && pathname === "/" && !sessionStorage.getItem("space150:landed")) {
    sessionStorage.setItem("space150:landed", "1");
    return <Navigate to="/verified" replace />;
  }
  if (pathname === "/verified") {
    if (loading || (session && !profile)) return <div style={{ minHeight: "100vh", background: "#EDE8DD" }} />;
    const expired = !!landing.linkError && !session;
    return <VerifyPage key={(phone ? "m" : "d") + (expired ? "x" : "v")} phone={phone} mode={expired ? "expired" : "verified"}
      email="" name={profile?.display_name || ""} signedIn={!!session} onGo={() => nav("/", { replace: true })} onBack={() => nav("/", { replace: true })} />;
  }
  if (!session && sent) return <VerifyPage key={(phone ? "sm" : "sd") + sent.kind} phone={phone} mode={sent.kind} email={sent.email} name={sent.name} onBack={() => setSent(null)} />;
  // Invited people choose a password the first time they arrive.
  if (session && session.user?.user_metadata?.needs_password && profile)
    return <VerifyPage key={phone ? "pm" : "pd"} phone={phone} mode="setpw" email="" name={profile.display_name} signedIn onGo={() => nav("/", { replace: true })} />;
  if (session && profile && pathname === "/requests") return <RequestsPage key={phone ? "rm" : "rd"} phone={phone} />;
  if (loading || (session && !profile)) return <div style={{ minHeight: "100vh", background: "#EDE8DD", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Karla, sans-serif", color: "#6B655A" }}>Opening your space…</div>;
  if (!session) return <Board key={phone ? "lm" : "ld"} page="login" phone={phone} />;
  return <SocialProvider><Pages /></SocialProvider>;
}

export function App() {
  return <AuthProvider><Gate /></AuthProvider>;
}
