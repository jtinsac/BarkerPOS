import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {ref, set} from "firebase/database";
import { db, firebaseConfig } from "../../lib/firebase";
import {initializeApp, deleteApp} from "firebase/app";
import { getAuth } from "firebase/auth";

function CreateUserForm({ onSuccess } = {}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(226, 232, 240, 0.7)",
    background: "rgba(255, 255, 255, 0.9)",
    fontSize: "0.95rem",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 120ms ease",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
  };

  const inputFocusStyle = {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59,130,246,0.12), 0 4px 12px rgba(15, 23, 42, 0.08)",
  };

  const buttonStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(59,130,246,0.25)",
    background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#1d4ed8",
    cursor: "pointer",
    transition: "all 120ms ease",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    if (!name || !email || !password || !role) {
      setError("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      await set(ref(db, "users/" + uid), {
        name,
        email,
        role,
        createdAt: Date.now(),
      });

      await deleteApp(secondaryApp);

      setName("");
      setEmail("");
      setPassword("");
      setRole("");

      onSuccess?.();
    } catch (error) {
      setError(error?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.08) 100%)",
          padding: "1.5rem 1.5rem 1rem",
          borderBottom: "1px solid rgba(226, 232, 240, 0.5)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "#0f172a",
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          Create New User
        </h2>
        <p
          style={{
            margin: "0.5rem 0 0",
            fontSize: "0.9rem",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Add a new team member
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "1.5rem",
        }}
      >
        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#dc2626",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            User Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              ...inputStyle,
              cursor: "pointer",
            }}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          >
            <option value="" disabled>
              Select user role
            </option>
            <option value="owner">Owner</option>
            <option value="cashier">Cashier</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            ...buttonStyle,
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            background: isSubmitting 
              ? "rgba(156, 163, 175, 0.2)" 
              : "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)",
            color: isSubmitting ? "#9ca3af" : "#1d4ed8"
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.background = "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.08) 100%)";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 12px 28px rgba(15, 23, 42, 0.12)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.background = "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.08)";
            }
          }}
        >
          {isSubmitting ? "Creating User..." : "Create User"}
        </button>
      </form>
    </div>
  );
}

export default CreateUserForm