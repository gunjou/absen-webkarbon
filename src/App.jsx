import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Absen from "@/pages/Absen";
import Dashboard from "@/pages/Dashboard";
import Izin from "@/pages/Izin";
import IzinBaru from "@/pages/IzinBaru";
import IzinDetail from "@/pages/IzinDetail";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Riwayat from "@/pages/Riwayat";

function WajibLogin({ children }) {
  const { pengguna } = useAuth();
  return pengguna ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="absen"
        element={
          <WajibLogin>
            <Absen />
          </WajibLogin>
        }
      />
      <Route
        element={
          <WajibLogin>
            <AppLayout />
          </WajibLogin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="riwayat" element={<Riwayat />} />
        <Route path="izin" element={<Izin />} />
        <Route path="izin/baru" element={<IzinBaru />} />
        <Route path="izin/:id" element={<IzinDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
