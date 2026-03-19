import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Login from "./features/login/Login";
import Dashboard from "./features/dashboard/Dashboard";
import CreateUser from "./features/users/CreateUser";
import ProtectedRoute from "./routes/ProctedRoute";
import POS from "./features/pos/POS";
import Products from "./features/products/Products";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["owner", "cashier"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CreateUser"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <CreateUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={["owner", "cashier"]}>
              <POS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={["owner"]}>
              <Products />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;