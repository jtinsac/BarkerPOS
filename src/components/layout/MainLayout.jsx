import Sidebar from "./Sidebar";

export default function MainLayout({ children, onLogout }) {
  return (
    <div className="flex h-screen">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 p-6 bg-gray-100 overflow-auto">
        {children}
      </main>
    </div>
  );
}