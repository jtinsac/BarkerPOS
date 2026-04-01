import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, BarChart3, Users, Package, ShoppingCart, Receipt, LogOut } from "lucide-react";

export default function Sidebar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { name: "Users", path: "/users", icon: Users },
    { name: "Products", path: "/products", icon: Package },
    { name: "POS", path: "/pos", icon: ShoppingCart },
    { name: "Transactions", path: "/transactions", icon: Receipt },
  ];

  return (
    <aside
      style={{
        width: isOpen ? 280 : 88,
        transition: "width 220ms ease",
        padding: "1rem",
        display: "flex",
      }}
    >
      <style>{`
        .sbCard { backdrop-filter: blur(6px); }
        .sbBtn { transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, box-shadow 120ms ease; }
        .sbBtn:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12); }
        .sbLink { transition: transform 120ms ease, background 120ms ease, border-color 120ms ease, box-shadow 120ms ease; }
        .sbLink:hover { transform: translateY(-1px); box-shadow: 0 10px 22px rgba(15, 23, 42, 0.10); }
        @media (max-width: 880px) {
          .sbWrap { width: 88px !important; }
        }
      `}</style>

      <div
        className="sbWrap sbCard"
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.86)",
          border: "1px solid rgba(226, 232, 240, 0.85)",
          borderRadius: "18px",
          boxShadow:
            "0 24px 60px rgba(15, 23, 42, 0.12), 0 2px 0 rgba(255,255,255,0.6) inset",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
      {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "1rem",
            background:
              "linear-gradient(90deg, rgba(59,130,246,0.18), rgba(16,185,129,0.12))",
            borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
            {isOpen ? (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
                  Ram's Blend Admin
                </div>
                <div style={{ fontSize: "0.85rem", color: "#475569" }}>Ram's Blend Dashboard</div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="sbBtn"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid rgba(226,232,240,0.9)",
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      {/* Navigation */}
        <nav style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.45rem", flex: 1 }}>
          {menuItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            
            const IconComponent = item.icon;

            return (
              <button
                key={item.path}
                type="button"
                className="sbLink"
                onClick={() => navigate(item.path)}
                style={{
                  textAlign: "left",
                  width: "100%",
                  borderRadius: "14px",
                  padding: isOpen ? "0.85rem 0.9rem" : "0.85rem 0.75rem",
                  border: isActive
                    ? "1px solid rgba(59,130,246,0.35)"
                    : "1px solid rgba(226, 232, 240, 0.9)",
                  background: isActive
                    ? "linear-gradient(90deg, rgba(59,130,246,0.14), rgba(16,185,129,0.10))"
                    : "rgba(255,255,255,0.75)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isOpen ? "flex-start" : "center",
                  gap: "0.75rem",
                }}
              >
                <IconComponent 
                  size={20} 
                  style={{ 
                    color: isActive ? "#1d4ed8" : "#64748b",
                    flexShrink: 0
                  }} 
                />
                {isOpen && (
                  <>
                    <span style={{ fontWeight: 800, color: "#0f172a", flex: 1 }}>{item.name}</span>
                    <span style={{ color: "#94a3b8", fontWeight: 900 }}>›</span>
                  </>
                )}
              </button>
            );
          })}
        </nav>

      {/* Logout */}
        <div
          style={{
            padding: "0.9rem",
            borderTop: "1px solid rgba(226, 232, 240, 0.9)",
            background: "rgba(255,255,255,0.72)",
          }}
        >
          <button
            type="button"
            onClick={onLogout}
            className="sbBtn"
            style={{
              width: "100%",
              padding: isOpen ? "0.75rem 0.9rem" : "0.75rem 0.75rem",
              borderRadius: "14px",
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.10)",
              color: "#b91c1c",
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: isOpen ? "flex-start" : "center",
              gap: "0.75rem",
            }}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {isOpen && "Sign Out"}
          </button>
        </div>
      </div>
    </aside>
  );
}