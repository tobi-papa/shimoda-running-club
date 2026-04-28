"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Event, CreateEventForm } from "@/types";
import { useRealtimeEvents } from "@/lib/realtime";
import { Header } from "./Header";
import { EventCard } from "@/components/events/EventCard";
import { EventCardPast } from "@/components/events/EventCardPast";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { JoinDialog } from "@/components/events/JoinDialog";
import { EditEventModal } from "@/components/events/EditEventModal";
import {
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakToggle,
  useTweaks,
} from "@/components/ui/TweaksPanel";

// ─── Pointer + Scroll hooks ───────────────────────────────────────────────────

function usePointer() {
  const [p, setP] = useState({ x: 0.5, y: 0.5 });
  const [v, setV] = useState(0);
  const last = useRef({ x: 0, y: 0, t: Date.now() });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      const now = Date.now();
      const dt = Math.max(16, now - last.current.t);
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      const vel = (Math.sqrt(dx * dx + dy * dy) / dt) * 1000;
      last.current = { x: e.clientX, y: e.clientY, t: now };
      setP({ x: nx, y: ny });
      setV(Math.min(200, vel * 0.12));
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setV((v) => v * 0.85), 80);
    return () => clearInterval(id);
  }, []);

  return { pointer: p, velocity: v };
}

function useScroll() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

// ─── Runner (abstract SVG figure) ─────────────────────────────────────────────

function Runner({
  scroll = 0,
  pointer = { x: 0.5, y: 0.5 },
  velocity = 0,
  size = 520,
}: {
  scroll?: number;
  pointer?: { x: number; y: number };
  velocity?: number;
  size?: number;
}) {
  const lean = Math.min(12, scroll * 0.015);
  const stride = Math.sin(scroll * 0.03) * 10;
  const shiftX = (pointer.x - 0.5) * 24;
  const shiftY = (pointer.y - 0.5) * 14;
  const streakLen = 60 + Math.min(140, velocity * 2);

  const streaks = [
    { y: 48,  c: "#ff2d55", delay: 0 },
    { y: 90,  c: "#ffb300", delay: 0.05 },
    { y: 132, c: "#00c2a8", delay: 0.1 },
    { y: 174, c: "#3d5afe", delay: 0.15 },
    { y: 216, c: "#8e24ff", delay: 0.2 },
    { y: 258, c: "#ff2d55", delay: 0.25 },
    { y: 300, c: "#ffb300", delay: 0.3 },
    { y: 342, c: "#00c2a8", delay: 0.35 },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size * 0.95,
        transform: `translate(${shiftX}px, ${shiftY}px)`,
        transition: "transform .4s cubic-bezier(.2,.7,.2,1)",
        willChange: "transform",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {streaks.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: s.y,
              height: 6,
              width: streakLen + i * 8,
              background: `linear-gradient(90deg, transparent, ${s.c})`,
              borderRadius: 6,
              opacity: 0.85,
              transform: `translateX(${-velocity * 0.4 - i * 3}px)`,
              transition: `width .25s cubic-bezier(.2,.7,.2,1) ${s.delay}s, transform .25s`,
            }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 520 500"
        width={size}
        height={size * 0.95}
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${-lean * 0.4}deg) translateY(${stride}px)`,
          transition: "transform .6s cubic-bezier(.2,.7,.2,1)",
          filter: "drop-shadow(0 30px 30px rgba(0,0,0,.12))",
        }}
      >
        <defs>
          <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff2d55" />
            <stop offset="35%" stopColor="#8e24ff" />
            <stop offset="70%" stopColor="#3d5afe" />
            <stop offset="100%" stopColor="#00c2a8" />
          </linearGradient>
          <linearGradient id="limb" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffb300" />
            <stop offset="100%" stopColor="#ff2d55" />
          </linearGradient>
          <linearGradient id="leg" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#00c2a8" />
            <stop offset="100%" stopColor="#3d5afe" />
          </linearGradient>
        </defs>
        <polygon points="120,360 180,300 240,340 220,420 150,440" fill="url(#leg)" opacity="0.85" />
        <polygon points="150,440 220,420 260,470 200,490" fill="#0b0b0c" />
        <polygon points="200,150 320,130 360,260 280,300 220,270" fill="url(#body)" />
        <polygon points="220,270 280,300 300,360 240,380" fill="#8e24ff" opacity="0.9" />
        <polygon points="280,300 360,260 380,340 300,360" fill="#3d5afe" opacity="0.85" />
        <polygon points="300,70 360,60 380,130 340,150 290,130" fill="url(#body)" />
        <polygon points="340,150 380,130 400,180 360,200" fill="#ff2d55" opacity="0.9" />
        <polygon points="360,180 440,140 470,170 420,220 370,220" fill="url(#limb)" />
        <polygon points="420,220 470,170 490,200 460,240" fill="#ffb300" />
        <polygon points="220,170 170,210 180,260 230,240" fill="#ff2d55" opacity="0.9" />
        <polygon points="280,340 340,380 360,460 310,480 280,430" fill="url(#leg)" />
        <polygon points="310,480 360,460 380,490 330,500" fill="#0b0b0c" />
        <polygon points="290,130 340,150 320,180 280,160" fill="#0b0b0c" opacity="0.8" />
        <polygon points="60,180 90,170 80,210 50,220" fill="#ff2d55" opacity="0.9" />
        <polygon points="30,240 70,230 60,270 20,280" fill="#ffb300" opacity="0.85" />
        <polygon points="80,300 110,295 100,330 70,340" fill="#00c2a8" opacity="0.9" />
        <polygon points="10,350 50,345 40,380 5,390" fill="#3d5afe" opacity="0.85" />
        <polygon points="100,80 130,90 115,120 95,110" fill="#8e24ff" opacity="0.85" />
      </svg>
    </div>
  );
}

// ─── Hero sub-components ──────────────────────────────────────────────────────

function HeroWord({ scroll, pointer }: { scroll: number; pointer: { x: number; y: number } }) {
  const px = (pointer.x - 0.5) * 10;
  const lines = ["SHIMODA", "RUNNING", "CLUB"];
  return (
    <h1
      className="display hero-word"
      style={{ fontSize: "clamp(80px, 11.5vw, 192px)", margin: 0, lineHeight: 0.85 }}
    >
      {lines.map((l, i) => (
        <div
          key={l}
          style={{
            overflow: "hidden",
            transform: `translateX(${px * (i === 1 ? 1.4 : 0.6)}px)`,
            transition: "transform .6s cubic-bezier(.2,.7,.2,1)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              transform: `translateY(${Math.sin(scroll * 0.005 + i) * 3}px)`,
            }}
          >
            {l}
          </div>
        </div>
      ))}
    </h1>
  );
}

function Digit({ n }: { n: number }) {
  const [prev, setPrev] = useState(n);
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    if (n !== prev) {
      setAnim(true);
      const id = setTimeout(() => { setPrev(n); setAnim(false); }, 300);
      return () => clearTimeout(id);
    }
  }, [n, prev]);
  return (
    <span style={{ display: "inline-block", animation: anim ? "tick .3s" : "none" }}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)" }}>
        {label}
      </div>
      <div className="display" style={{ fontSize: 36, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function Marquee() {
  const items = ["RUN TOGETHER", "★", "JUST RUN", "★", "MAY 31 HALF", "★", "SHOW UP", "★", "EASY PACE", "★"];
  const content = [...items, ...items, ...items];
  return (
    <div
      style={{
        position: "relative",
        marginTop: 72,
        borderTop: "1.5px solid var(--ink)",
        borderBottom: "1.5px solid var(--ink)",
        overflow: "hidden",
        padding: "18px 0",
        background: "var(--ink)",
        color: "var(--bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 40,
          whiteSpace: "nowrap",
          animation: "marquee 40s linear infinite",
          width: "max-content",
        }}
      >
        {content.map((t, i) => (
          <span key={i} className="display" style={{ fontSize: 28 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function GrainOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
        opacity: 0.06,
        mixBlendMode: "multiply",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
      }}
    />
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function Hero({
  onNewRun,
  pointer,
  scroll,
  velocity,
}: {
  onNewRun: () => void;
  pointer: { x: number; y: number };
  scroll: number;
  velocity: number;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date("2026-05-31T07:00:00");
  const diff = target.getTime() - now.getTime();
  const countdown = {
    d: Math.max(0, Math.floor(diff / 86400000)),
    h: Math.max(0, Math.floor((diff % 86400000) / 3600000)),
    m: Math.max(0, Math.floor((diff % 3600000) / 60000)),
    s: Math.max(0, Math.floor((diff % 60000) / 1000)),
  };

  return (
    <section className="hero-section" style={{ position: "relative", padding: "96px 56px 64px", minHeight: "100vh", overflow: "hidden" }}>
      <Header onNewRun={onNewRun} />

      <div
        className="hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 40,
          alignItems: "center",
          position: "relative",
          minHeight: "70vh",
        }}
      >
        {/* left */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <HeroWord scroll={scroll} pointer={pointer} />
          <div style={{ marginTop: 28, maxWidth: 520, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.25 }}>
              Welcome to the dorm&apos;s <span className="rainbow">running club</span>.
              Lace up, show up, run together!
            </div>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <Stat label="NEXT RACE" value="MAY 31" />
              <Stat label="RUNNERS" value="24" />
              <Stat label="KM THIS WEEK" value="312" />
            </div>
          </div>
        </div>

        {/* right: runner + countdown */}
        <div className="runner-col" style={{ position: "relative", height: 540 }}>
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -20,
              transform: `translateY(${scroll * 0.12}px)`,
            }}
          >
            <Runner scroll={scroll} pointer={pointer} velocity={velocity} size={560} />
          </div>
          <div
            style={{
              position: "absolute",
              left: -40,
              bottom: 0,
              background: "var(--ink)",
              color: "var(--bg)",
              padding: "18px 22px",
              borderRadius: 2,
              boxShadow: "0 24px 48px rgba(0,0,0,.18)",
              transform: `translateY(${scroll * -0.06}px)`,
            }}
          >
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.7 }}>
              HALF MARATHON STARTS IN
            </div>
            <div className="display" style={{ fontSize: 44, lineHeight: 1, marginTop: 6 }}>
              <Digit n={countdown.d} />D <Digit n={countdown.h} />H{" "}
              <Digit n={countdown.m} />M <Digit n={countdown.s} />S
            </div>
          </div>
        </div>
      </div>

      <Marquee />
    </section>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  id,
  number,
  kicker,
  title,
  subtitle,
  action,
  children,
}: {
  id: string;
  number: string;
  kicker: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="page-section" style={{ padding: "96px 56px", position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 48,
          flexWrap: "wrap",
          borderBottom: "1.5px solid var(--ink)",
          paddingBottom: 24,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.15em",
                fontWeight: 700,
                background: "var(--ink)",
                color: "var(--bg)",
                padding: "4px 10px",
                whiteSpace: "nowrap",
              }}
            >
              § {number}
            </div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--muted)" }}>
              {kicker}
            </div>
          </div>
          <h2
            className="display"
            style={{ fontSize: "clamp(48px, 7vw, 96px)", margin: 0, letterSpacing: "-0.02em" }}
          >
            {title}
          </h2>
          <div style={{ fontSize: 16, color: "var(--muted)", marginTop: 10, maxWidth: 600 }}>
            {subtitle}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="site-footer"
      style={{
        background: "var(--ink)",
        color: "var(--bg)",
        padding: "64px 56px 32px",
        marginTop: 64,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="display"
        style={{ fontSize: "clamp(80px, 14vw, 220px)", lineHeight: 0.85, letterSpacing: "-0.03em" }}
      >
        JUST<br />RUN.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 48,
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.6 }}>
          SHIMODA RUNNING CLUB · 026 · 
        </div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.6 }}>
          MAY 31 · HALF MARATHON
        </div>
      </div>
    </footer>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinEvent, setJoinEvent] = useState<Event | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useRealtimeEvents(refresh);

  const upcoming = events
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => new Date(a.run_at).getTime() - new Date(b.run_at).getTime());
  const past = events.filter((e) => e.status === "completed");

  const tweaks = useTweaks({ accent: "rainbow", grain: true, cardStyle: "solid-shadow" });

  const { pointer, velocity } = usePointer();
  const scroll = useScroll();

  // reveal-on-scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [upcoming, past]);

  const addEvent = useCallback(async (form: CreateEventForm) => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    refresh();
  }, [refresh]);

  const joinRun = useCallback(async (id: string, names: string[]) => {
    await Promise.all(
      names.map((name) =>
        fetch(`/api/events/${id}/participants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })
      )
    );
    refresh();
  }, [refresh]);

  const removePart = useCallback(async (eventId: string, participantId: string) => {
    await fetch(`/api/events/${eventId}/participants/${participantId}`, {
      method: "DELETE",
    });
    refresh();
  }, [refresh]);

  const completeRun = useCallback(async (id: string) => {
    await fetch(`/api/events/${id}/complete`, { method: "POST" });
    refresh();
  }, [refresh]);

  const uploadPhoto = useCallback(async (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    await fetch(`/api/events/${id}/photo`, { method: "POST", body: form });
    refresh();
  }, [refresh]);

  const editRun = useCallback(async (id: string, patch: {
    run_at: string;
    meeting_point: string;
    distance_km: number;
    pace: string;
    strava_url?: string;
    notes?: string;
  }) => {
    await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    refresh();
  }, [refresh]);

  const deleteRun = useCallback(async (id: string) => {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    refresh();
  }, [refresh]);

  const bigBtn: React.CSSProperties = {
    background: "var(--ink)",
    color: "var(--bg)",
    padding: "16px 24px",
    borderRadius: 999,
    fontWeight: 800,
    letterSpacing: "0.08em",
    fontSize: 13,
  };

  return (
    <div style={{ position: "relative" }}>
      {tweaks.grain && <GrainOverlay />}

      <Hero onNewRun={() => setCreateOpen(true)} pointer={pointer} scroll={scroll} velocity={velocity} />

      <Section
        id="upcoming"
        number="01"
        kicker="THIS WEEK"
        title="UPCOMING RUNS"
        subtitle={`${upcoming.length} runs on the board. Show up or add one.`}
        action={
          <button onClick={() => setCreateOpen(true)} style={bigBtn}>
            + NEW RUN
          </button>
        }
      >
        <div
          className="cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: 20,
          }}
        >
          {upcoming.map((ev, i) => (
            <EventCard
              key={ev.id}
              event={ev}
              index={i}
              onJoin={setJoinEvent}
              onComplete={completeRun}
              onRemove={removePart}
              onEdit={setEditEvent}
              onDelete={deleteRun}
            />
          ))}
        </div>
      </Section>

      <Section
        id="past"
        number="02"
        kicker="IN THE BOOKS"
        title="PAST RUNS"
        subtitle="The archive. Every run, remembered."
      >
        <div
          className="cards-grid-past"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {past.map((ev) => (
            <EventCardPast key={ev.id} event={ev} onUpload={uploadPhoto} onDelete={deleteRun} />
          ))}
        </div>
      </Section>

      <Footer />

      <CreateEventModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={addEvent} />
      <JoinDialog event={joinEvent} onClose={() => setJoinEvent(null)} onJoin={joinRun} />
      <EditEventModal event={editEvent} onClose={() => setEditEvent(null)} onSave={editRun} />

      <TweaksPanel tweaks={tweaks}>
        <TweakSection title="Accent" />
        <TweakRadio
          label="Style"
          tweaks={tweaks}
          k="accent"
          options={[
            { value: "rainbow", label: "Rainbow" },
            { value: "mono", label: "Monochrome" },
          ]}
        />
        <TweakSection title="Atmosphere" />
        <TweakToggle label="Grain overlay" tweaks={tweaks} k="grain" />
        <TweakSection title="Card style" />
        <TweakRadio
          label="Shadow"
          tweaks={tweaks}
          k="cardStyle"
          options={[
            { value: "solid-shadow", label: "Solid" },
            { value: "soft", label: "Soft" },
            { value: "flat", label: "Flat" },
          ]}
        />
      </TweaksPanel>
    </div>
  );
}
