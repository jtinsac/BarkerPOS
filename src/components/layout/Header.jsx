import { useState, useEffect, useContext } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { UserContext } from "../../context/UserContext.jsx";

const Header = () => {
  const { user, userData } = useContext(UserContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getUserDisplayName = () => {
    if (userData?.name) {
      return userData.name;
    }
    // Fallback to email if name is not available
    return user?.email || "User";
  };

  const getInitials = () => {
    if (userData?.name) {
      const names = userData.name.split(' ');
      if (names.length >= 2) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      }
      return userData.name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "linear-gradient(90deg, rgba(59,130,246,0.16), rgba(16,185,129,0.12))",
        borderBottom: "1px solid #e2e8f0",
        backdropFilter: "blur(6px)",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "2rem"
      }}
    >
      {/* Left side - User info with greeting */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(15, 23, 42, 0.9)",
            boxShadow: "0 10px 22px rgba(15, 23, 42, 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "700",
            fontSize: "0.8rem"
          }}
        >
          {getInitials()}
        </div>
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#64748b",
              fontWeight: "500",
              marginBottom: "0.1rem"
            }}
          >
            {getGreeting()}
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: "700",
              color: "#0f172a"
            }}
          >
            {getUserDisplayName()}
          </div>
        </div>
      </div>

      {/* Center - Time and Date */}
      <div style={{ textAlign: "center", flex: "1", maxWidth: "300px" }}>
        <div
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "#0f172a",
            fontVariantNumeric: "tabular-nums",
            marginBottom: "0.1rem"
          }}
        >
          {formatTime(currentTime)}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "#475569",
            fontWeight: "500"
          }}
        >
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Right side - Sign out button */}
      <button
        onClick={handleLogout}
        type="button"
        style={{
          padding: "0.6rem 1.2rem",
          borderRadius: "8px",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          background: "rgba(255, 255, 255, 0.8)",
          color: "#475569",
          fontWeight: "600",
          fontSize: "0.85rem",
          cursor: "pointer",
          transition: "all 150ms ease",
          whiteSpace: "nowrap"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.1)";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
          e.currentTarget.style.color = "#dc2626";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
          e.currentTarget.style.borderColor = "rgba(226, 232, 240, 0.8)";
          e.currentTarget.style.color = "#475569";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Sign Out
      </button>
    </header>
  );
};

export default Header;