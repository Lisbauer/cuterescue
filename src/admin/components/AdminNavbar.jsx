import { useAuth } from "../../context/AuthContext";

export default function AdminNavbar() {
  const { user, logout } = useAuth(); // adapta segun el auth del usuario

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Panel Administrador</h1>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          {user?.email}
        </span>

        <button
          onClick={logout}
          className="text-sm text-red-500 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
