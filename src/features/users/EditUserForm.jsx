import { useState } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../lib/firebase";

const EditUserForm = ({ user, onSuccess }) => {
  // Initialize form state with the existing user data
  const [name, setName] = useState(user.name || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    if (!name) {
      setError("Please enter a name");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Update only the name in Firebase
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        name: name,
      });

      setSuccess("User updated successfully!");
      
      // Close the modal after a short delay
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      setError("Failed to update user");
      console.error("Error updating user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Edit User
        </h2>
        <p
          style={{
            margin: "0.5rem 0 0",
            fontSize: "0.9rem",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Update the details below
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

        {success && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "#059669",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {success}
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
          <div
            style={{
              ...inputStyle,
              background: "rgba(243, 244, 246, 0.8)",
              color: "#6b7280",
              cursor: "not-allowed",
              border: "1px solid rgba(209, 213, 219, 0.8)"
            }}
          >
            {user.email || "—"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>
            Email cannot be changed here. Users must update their own email through account settings.
          </div>
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
            Role
          </label>
          <div
            style={{
              ...inputStyle,
              background: "rgba(243, 244, 246, 0.8)",
              color: "#6b7280",
              cursor: "not-allowed",
              border: "1px solid rgba(209, 213, 219, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.25rem 0.5rem",
                borderRadius: "999px",
                background: user.role === "owner" ? "rgba(59,130,246,0.10)" : "rgba(16,185,129,0.10)",
                border: user.role === "owner" ? "1px solid rgba(59,130,246,0.25)" : "1px solid rgba(16,185,129,0.25)",
                color: user.role === "owner" ? "#1d4ed8" : "#047857",
                fontWeight: 700,
                fontSize: "0.8rem"
              }}
            >
              {user.role || "No role"}
            </span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>
            Role changes require administrator privileges and system access review.
          </div>
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
          {isSubmitting ? "Updating User..." : "Update User"}
        </button>
      </form>
    </div>
  );
};

export default EditUserForm;