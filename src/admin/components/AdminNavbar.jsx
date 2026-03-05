import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";

export default function AdminNavbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [nombreCompleto, setNombreCompleto] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchUserName = async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("nombre, apellido")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        const fullName = `${data.nombre ?? ""} ${data.apellido ?? ""}`.trim();
        setNombreCompleto(fullName);
      }
    };

    fetchUserName();
  }, [user]);

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
        <span className="text-sm text-gray-600">
          {nombreCompleto || user?.email}
        </span>

        <button onClick={logout} className="text-sm text-red-500 hover:underline">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}