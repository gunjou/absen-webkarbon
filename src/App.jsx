import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";

function WajibLogin({ children }) {
  const { pengguna } = useAuth();
  return pengguna ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        index
        element={
          <WajibLogin>
            <Dashboard />
          </WajibLogin>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
