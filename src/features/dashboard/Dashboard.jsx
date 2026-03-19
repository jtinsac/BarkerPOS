import { useEffect, useState } from "react";
import { listenToMessage } from "../../services/database";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import MainLayout from "../../components/layout/MainLayout.jsx";

export default function Dashboard() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const unsubscribe = listenToMessage(setMessage);
    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <MainLayout onLogout={handleLogout}>
      <div
        style={{
          background: "rgba(255,255,255,0.86)",
          border: "1px solid rgba(226, 232, 240, 0.85)",
          borderRadius: "18px",
          boxShadow:
            "0 24px 60px rgba(15, 23, 42, 0.12), 0 2px 0 rgba(255,255,255,0.6) inset",
          padding: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a" }}>
              Dashboard
            </div>
            <div style={{ marginTop: "0.35rem", color: "#64748b" }}>
              Welcome back — here’s what’s happening today.
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <div
              style={{
                padding: "0.6rem 0.85rem",
                borderRadius: "14px",
                border: "1px solid rgba(59,130,246,0.35)",
                background: "rgba(59,130,246,0.10)",
                color: "#1d4ed8",
                fontWeight: 900,
              }}
            >
              Live
            </div>
            <div
              style={{
                padding: "0.6rem 0.85rem",
                borderRadius: "14px",
                border: "1px solid rgba(16,185,129,0.35)",
                background: "rgba(16,185,129,0.10)",
                color: "#047857",
                fontWeight: 900,
              }}
            >
              Connected
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.85rem",
          }}
        >
          {[
            { label: "Products", value: "—", tint: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.35)", color: "#1d4ed8" },
            { label: "Sales Today", value: "₱0", tint: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.35)", color: "#047857" },
            { label: "Alerts", value: "0", tint: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.30)", color: "#6d28d9" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                padding: "1rem",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(226, 232, 240, 0.85)",
                boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 700 }}>{kpi.label}</div>
              <div style={{ marginTop: "0.35rem", fontSize: "1.35rem", fontWeight: 900, color: "#0f172a" }}>
                {kpi.value}
              </div>
              <div style={{ marginTop: "0.65rem" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.35rem 0.6rem",
                    borderRadius: "999px",
                    background: kpi.tint,
                    border: `1px solid ${kpi.border}`,
                    color: kpi.color,
                    fontWeight: 900,
                    fontSize: "0.82rem",
                  }}
                >
                  Updated
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.92rem" }}>
          {message ? "Realtime message received." : "Waiting for realtime updates…"}
        </div>
      </div>

      {/* Optional debug */}
      {/* <pre>{JSON.stringify(message, null, 2)}</pre> */}
    </MainLayout>
  );
}