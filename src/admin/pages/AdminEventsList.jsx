import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetEvents, adminToggleEventActive } from "../services/eventsAdmin";

export default function AdminEventsList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetEvents();
      setEvents(data);
    } catch (e) {
      console.error("Error cargando eventos:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;

    return events.filter((ev) => {
      const haystack = [ev.id, ev.title, ev.summary].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [events, query]);

  const totals = useMemo(() => {
    let activas = 0;
    let inactivas = 0;
    for (const e of events) e.activa ? (activas += 1) : (inactivas += 1);
    return { total: events.length, activas, inactivas };
  }, [events]);

  async function handleToggle(ev) {
    try {
      setBusyId(ev.id);
      await adminToggleEventActive(ev.id, ev.activa);
      await load();
    } catch (e) {
      console.error("Error cambiando estado:", e);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Eventos</h1>
          <p className="text-sm text-gray-500">Administrá el contenido de la sección Eventos.</p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded border bg-white text-gray-600">
              Total: <b>{totals.total}</b>
            </span>
            <span className="px-2 py-1 rounded border bg-green-50 border-green-200 text-green-700">
              Activos: <b>{totals.activas}</b>
            </span>
            <span className="px-2 py-1 rounded border bg-red-50 border-red-200 text-red-700">
              Inactivos: <b>{totals.inactivas}</b>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/eventos/nuevo")}
          className="h-10 px-4 rounded bg-[#22687B] text-white text-sm font-medium hover:bg-[#2f7f96]"
        >
          ➕ Agregar
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <label className="text-sm text-gray-600">Buscar evento</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por id, título o resumen…"
          className="mt-2 w-full border rounded px-3 py-2"
        />
        <p className="text-xs text-gray-400 mt-2">
          Mostrando <b>{filtered.length}</b> de <b>{events.length}</b>.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">No hay eventos que coincidan.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Título</th>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id} className={ev.activa ? "border-t" : "border-t bg-red-50/40"}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${ev.activa ? "bg-green-500" : "bg-red-500"}`} />
                      <span className={`font-medium ${ev.activa ? "text-gray-800" : "text-red-800"}`}>
                        {ev.title}
                      </span>
                    </div>
                    {ev.summary && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.summary}</p>}
                  </td>

                  <td className="p-3 text-gray-600">{ev.id}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs border ${
                        ev.activa
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      {ev.activa ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="p-3 text-right space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/eventos/${ev.id}/editar`)}
                      className="text-[#22687B] hover:underline"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={busyId === ev.id}
                      onClick={() => handleToggle(ev)}
                      className={`hover:underline disabled:opacity-50 ${
                        ev.activa ? "text-red-700" : "text-green-700"
                      }`}
                    >
                      {busyId === ev.id ? "..." : ev.activa ? "Desactivar" : "Activar"}
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