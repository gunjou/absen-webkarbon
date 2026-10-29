import { Route, Routes } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import Dashboard from "@/pages/Dashboard";
import Izin from "@/pages/Izin";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Riwayat from "@/pages/Riwayat";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<MobileLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="riwayat" element={<Riwayat />} />
        <Route path="izin" element={<Izin />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
