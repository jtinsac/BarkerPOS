import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.86)",
        border: "1px solid rgba(226, 232, 240, 0.85)",
        borderRadius: "18px",
        boxShadow:
          "0 24px 60px rgba(15, 23, 42, 0.12), 0 2px 0 rgba(255,255,255,0.6) inset",
        backdropFilter: "blur(6px)",
        overflow: "hidden",
      }}
    >
      <style>{`
        .loginInput {
          box-sizing: border-box;
          display: block;
          width: 100%;
          padding: 0.7rem 0.85rem;
          border-radius: 12px;
          border: 1px solid rgba(226, 232, 240, 0.95);
          background: rgba(255, 255, 255, 0.92);
          margin: 0;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          font-size: 0.95rem;
          color: #0f172a;
          transition: box-shadow 120ms ease, border-color 120ms ease, transform 120ms ease;
        }
        .loginInput:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.15), 0 14px 30px rgba(15, 23, 42, 0.10);
        }
        .loginBtn {
          width: 100%;
          padding: 0.75rem 0.9rem;
          border-radius: 14px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          background: linear-gradient(90deg, rgba(59,130,246,0.95), rgba(16,185,129,0.90));
          color: white;
          font-weight: 900;
          letter-spacing: -0.01em;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.14);
          transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease, border-color 120ms ease;
        }
        .loginBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 20px 46px rgba(15, 23, 42, 0.18);
          filter: brightness(1.02);
        }
        .loginBtn:active {
          transform: translateY(0px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
        }
        .loginBtn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>

      <div
        style={{
          height: 6,
          background: "linear-gradient(90deg, rgba(59,130,246,0.9), rgba(16,185,129,0.75))",
        }}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.95rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em", color: "#0f172a" }}>
            Login
          </h2>
          <div style={{ marginTop: "0.35rem", fontSize: "0.92rem", color: "#64748b" }}>
            Enter your details to access your dashboard.
          </div>
        </div>

        {error ? (
          <div
            style={{
              padding: "0.75rem 0.9rem",
              borderRadius: "12px",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              background: "rgba(239, 68, 68, 0.10)",
              color: "#b91c1c",
              fontWeight: 700,
              fontSize: "0.92rem",
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>
            Email
          </label>
          <input
            className="loginInput"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>
            Password
          </label>
          <input
            className="loginInput"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button className="loginBtn" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}