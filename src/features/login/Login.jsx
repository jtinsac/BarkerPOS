import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { UserContext } from "../../context/UserContext";
import LoginForm from "./LoginForm";

function Login() {
  const { user, role, loading } = useContext(UserContext);
  const navigate = useNavigate();

  // Force logout function
  const handleForceLogout = async () => {
    try {
      await signOut(auth);
      console.log("Force logout successful");
      // Clear any local storage
      localStorage.clear();
      sessionStorage.clear();
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error("Force logout error:", error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      console.log("Login redirect logic - User:", !!user, "Role:", role);
      
      // If user has no role, automatically log them out
      if (!role) {
        console.log("User has no role, logging out for security");
        handleForceLogout();
        return;
      }

      // If user has a role, redirect based on role
      if (role === "owner") {
        navigate("/dashboard");
        return;
      }

      if (role === "cashier") {
        navigate("/pos");
        return;
      }
    }
  }, [user, role, loading, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        background:
          "radial-gradient(900px 500px at 10% 0%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(16,185,129,0.14), transparent 55%), radial-gradient(900px 500px at 50% 100%, rgba(168,85,247,0.10), transparent 55%), #f8fafc",
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Force Logout Button - only show if there's a stuck user */}
        {user && (
          <div style={{ 
            marginBottom: "1rem", 
            padding: "1rem", 
            background: "rgba(239, 68, 68, 0.1)", 
            border: "1px solid rgba(239, 68, 68, 0.3)", 
            borderRadius: "12px",
            textAlign: "center"
          }}>
            <p style={{ margin: "0 0 0.5rem 0", color: "#dc2626", fontSize: "0.9rem" }}>
              Stuck in login loop? Click below to force logout:
            </p>
            <button
              onClick={handleForceLogout}
              style={{
                padding: "0.5rem 1rem",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600"
              }}
            >
              Force Logout & Reset
            </button>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;