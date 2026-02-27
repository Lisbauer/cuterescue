import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminGetVets,
  adminToggleVetActive,
} from "../services/vetAdmin.service";

export default function AdminVetsList() {
  const navigate = useNavigate();
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // buscador
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetVets();
      setVets(data);
    } catch (e) {
      console.error("Error cargando vets admin:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(vet) {
    try {
      setBusyId(vet.id);
      await adminToggleVetActive(vet.id, vet.activa);
      await load();
    } catch (e) {
      console.error("Error cambiando estado:", e);
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vets;

    return vets.filter((v) => {
      const haystack = [
        v.nombre,
        v.direccion,
        v.telefono,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [vets, query]);

  const totals = useMemo(() => {
    let activas = 0;
    let inactivas = 0;
    for (const v of vets) {
      if (v.activa) activas += 1;
      else inactivas += 1;
    }
    return { activas, inactivas, total: vets.length };
  }, [vets]);

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Veterinarias 24 hs</h1>
          <p className="text-sm text-gray-500">
            Administrá el listado visible para usuarios.
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded border bg-white text-gray-600">
              Total: <b>{totals.total}</b>
            </span>
            <span className="px-2 py-1 rounded border bg-green-50 border-green-200 text-green-700">
              Activas: <b>{totals.activas}</b>
            </span>
            <span className="px-2 py-1 rounded border bg-red-50 border-red-200 text-red-700">
              Inactivas: <b>{totals.inactivas}</b>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/veterinarias/nueva")}
          className="h-10 px-4 rounded bg-[#22687B] text-white text-sm font-medium hover:bg-[#2f7f96]"
        >
          ➕ Agregar
        </button>
      </div>


      <div className="bg-white rounded-lg p-4 shadow-sm">
        <label className="text-sm text-gray-600">Buscar veterinaria</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, dirección o teléfono…"
          className="mt-2 w-full border rounded px-3 py-2"
        />
        <p className="text-xs text-gray-400 mt-2">
          Mostrando <b>{filtered.length}</b> de <b>{vets.length}</b>.
        </p>
      </div>


      {loading ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          No hay veterinarias que coincidan con tu búsqueda.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Dirección</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((v) => {
                const rowClasses = v.activa
                  ? "border-t"
                  : "border-t bg-red-50/40";

                return (
                  <tr key={v.id} className={rowClasses}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            v.activa ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            v.activa ? "text-gray-800" : "text-red-800"
                          }`}
                        >
                          {v.nombre}
                        </span>
                      </div>
                      {v.telefono && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tel: {v.telefono}
                        </p>
                      )}
                    </td>

                    <td className="p-3 text-gray-600">{v.direccion}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs border ${
                          v.activa
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {v.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td className="p-3 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/veterinarias/${v.id}/editar`)
                        }
                        className="text-[#22687B] hover:underline"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={busyId === v.id}
                        onClick={() => handleToggle(v)}
                        className={`hover:underline disabled:opacity-50 ${
                          v.activa ? "text-red-700" : "text-green-700"
                        }`}
                      >
                        {busyId === v.id
                          ? "..."
                          : v.activa
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}