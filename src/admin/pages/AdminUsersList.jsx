import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetUsers } from "../services/usersAdmin";

export default function AdminUsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await adminGetUsers();
        setUsers(data);
      } catch (e) {
        console.error("Error loading users:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const haystack = [
        u.nombre,
        u.apellido,
        u.email,
        u.documento,
        u.telefono,
        u.membresia_codigo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [users, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Usuarios</h1>
          <p className="text-sm text-gray-500">
            Gestión básica de usuarios registrados.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <label className="text-sm text-gray-600">Buscar usuario</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre, email, documento, teléfono..."
          className="mt-2 w-full border rounded px-3 py-2"
        />
        <p className="text-xs text-gray-400 mt-2">
          Mostrando <b>{filtered.length}</b> de <b>{users.length}</b>.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          No se encontraron usuarios.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Usuario</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Mascotas</th>
                <th className="text-left p-3">Registro</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium text-gray-800">
                      {u.nombre} {u.apellido}
                    </p>
                    {u.documento && (
                      <p className="text-xs text-gray-500">Doc: {u.documento}</p>
                    )}
                  </td>

                  <td className="p-3 text-gray-700">{u.email}</td>

                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs border bg-white">
                      {u.membresia_codigo || "freemium"}
                    </span>
                  </td>

                  <td className="p-3 text-gray-700">{u.petsCount}</td>

                  <td className="p-3 text-gray-600">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/usuarios/${u.id}`)}
                      className="text-[#22687B] hover:underline"
                    >
                      Ver / Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}