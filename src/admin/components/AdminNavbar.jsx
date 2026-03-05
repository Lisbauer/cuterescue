import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";

export default function AdminNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    async function fetchUserName() {
      const { data, error } = await supabase
        .from("usuarios")
        .select("nombre, apellido")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        const name = `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim();
        setFullName(name);
      }
    }

    fetchUserName();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100"
          aria-label="Abrir menú"
        >
          <span className="text-xl">☰</span>
        </button>

        <h1 className="text-lg font-semibold">Panel Administrador</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{fullName || user?.email}</span>

        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-red-500 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}