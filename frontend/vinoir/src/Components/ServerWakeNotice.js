import React, { useEffect, useState } from "react";
import { API_BASE } from "../config/api";

// The API runs on free hosting that goes to sleep when idle, so the first
// request after a quiet spell can take up to a minute. This pings the server
// on load and, if it is slow to answer, tells the visitor the site is waking
// up instead of leaving them looking at an empty shop.

const SHOW_AFTER_MS = 2500; // a warm server answers well inside this
const GIVE_UP_AFTER_MS = 90000;
const RETRY_EVERY_MS = 5000;

// API_BASE ends in "/api"; the server answers a light request at its root.
const PING_URL = `${API_BASE.replace(/\/api$/, "")}/`;

const MESSAGES = {
  waking: {
    title: "Waking up the server…",
    detail: "This demo runs on free hosting that sleeps when idle. Fragrances will load in up to a minute.",
  },
  ready: { title: "Server is awake", detail: "Everything is loading now." },
  failed: {
    title: "The server is taking longer than usual",
    detail: "Please refresh the page in a moment.",
  },
};

export default function ServerWakeNotice() {
  // idle: nothing shown · waking: slow to answer · ready: just woke up · failed: gave up
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let finished = false;
    let wasSlow = false;
    let retryTimer;
    let hideTimer;

    const showTimer = setTimeout(() => {
      if (finished) return;
      wasSlow = true;
      setStatus("waking");
    }, SHOW_AFTER_MS);

    const giveUpTimer = setTimeout(() => {
      if (finished) return;
      finished = true;
      setStatus("failed");
    }, GIVE_UP_AFTER_MS);

    const ping = async () => {
      if (finished) return;
      try {
        const response = await fetch(PING_URL, { cache: "no-store" });
        if (finished) return;
        if (response.ok) {
          finished = true;
          clearTimeout(showTimer);
          clearTimeout(giveUpTimer);
          if (wasSlow) {
            setStatus("ready");
            hideTimer = setTimeout(() => setStatus("idle"), 3000);
          }
          return;
        }
      } catch (error) {
        // still asleep or starting up: try again shortly
      }
      if (!finished) retryTimer = setTimeout(ping, RETRY_EVERY_MS);
    };

    ping();

    return () => {
      finished = true;
      clearTimeout(showTimer);
      clearTimeout(giveUpTimer);
      clearTimeout(retryTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (status === "idle") return null;

  const { title, detail } = MESSAGES[status];
  const accent = status === "ready" ? "#90d4a7" : "#e6d478";
  const spinning = status === "waking";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "1.25rem",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "min(26rem, calc(100% - 2rem))",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.875rem 1rem",
        borderRadius: "0.5rem",
        border: `1px solid ${accent}`,
        background: "#381042",
        color: "#ffffff",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
        fontSize: "0.875rem",
        lineHeight: 1.4,
      }}
    >
      <style>{`
        @keyframes vinoir-wake-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .vinoir-wake-spinner { animation: none !important; } }
      `}</style>
      <span
        aria-hidden="true"
        className="vinoir-wake-spinner"
        style={{
          flexShrink: 0,
          width: "1.1rem",
          height: "1.1rem",
          marginTop: "0.1rem",
          borderRadius: "9999px",
          border: `2px solid ${accent}`,
          borderTopColor: spinning ? "transparent" : accent,
          background: spinning ? "transparent" : accent,
          animation: spinning ? "vinoir-wake-spin 0.9s linear infinite" : "none",
        }}
      />
      <span>
        <strong style={{ display: "block" }}>{title}</strong>
        <span style={{ color: "#f0f0f0" }}>{detail}</span>
      </span>
    </div>
  );
}
