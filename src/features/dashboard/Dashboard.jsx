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
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Example content */}
      <p className="mt-2 text-gray-600">
        Welcome to your dashboard.
      </p>

      {/* Optional debug */}
      {/* <pre>{JSON.stringify(message, null, 2)}</pre> */}
    </MainLayout>
  );
}