import Sidebar from "./Sidebar";

export default function MainLayout({ children, onLogout }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        background:
          "radial-gradient(900px 500px at 10% 0%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(16,185,129,0.14), transparent 55%), radial-gradient(900px 500px at 50% 100%, rgba(168,85,247,0.10), transparent 55%), #f8fafc",
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
        paddingTop: "4.5rem", // Account for fixed header
        boxSizing: "border-box"
      }}
    >
      <Sidebar onLogout={onLogout} />
      <main
        style={{
          flex: 1,
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ 
          width: "100%",
          height: "100%",
          overflow: "hidden",
          padding: "0.75rem 1.5rem 1.5rem 0.5rem", // Reduced left padding to close gap with sidebar
          boxSizing: "border-box"
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}