import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Sidebar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Create User", path: "/CreateUser" },
    { name: "Products", path: "/products" },
    { name: "POS", path: "/pos" },
  ];

  return (
    <div
      className={`bg-white shadow-lg flex flex-col transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {isOpen && <h1 className="text-xl font-bold">My App</h1>}
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className="p-4 hover:bg-gray-200 cursor-pointer"
          >
            {isOpen && <span>{item.name}</span>}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={onLogout}
          className="w-full bg-red-500 text-white p-2 rounded"
        >
          {isOpen ? "Sign Out" : "↩"}
        </button>
      </div>
    </div>
  );
}