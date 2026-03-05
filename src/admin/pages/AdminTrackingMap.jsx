import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../../services/supabase";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FitToMarkers({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points?.length) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);

  return null;
}

function safeText(v) {
  return String(v || "").trim();
}

export default function AdminTrackingMap() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

     
    const { data, error: err } = await supabase
  .from("localizacion")
  .select(`
    id,
    owner_id,
    mascota_id,
    chip_id,
    direccion,
    provincia,
    codigoPostal,
    lat,
    lng,
    localizacion_segura,
    created_at,
    updated_at,
    mascota:mascotas ( id, nombre ),
    usuario:usuarios ( id, nombre, apellido )
  `)
  .not("lat", "is", null)
  .not("lng", "is", null)
  .order("updated_at", { ascending: false })
  .order("created_at", { ascending: false });

        if (err) throw err;
        if (!alive) return;

        const seen = new Set();
        const lastByPet = [];
        for (const r of data || []) {
          if (!r?.mascota_id) continue;
          if (seen.has(r.mascota_id)) continue;
          seen.add(r.mascota_id);
          lastByPet.push(r);
        }

        setRows(lastByPet);
      } catch (e) {
        console.error("error con admintrackingmap", e);
        if (!alive) return;
        setError(e?.message || "No se pudo cargar el mapa.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const points = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = (rows || [])
      .filter((r) => Number.isFinite(Number(r.lat)) && Number.isFinite(Number(r.lng)))
      .map((r) => ({
  mascotaId: r.mascota_id,
  ownerId: r.owner_id,

  petName: safeText(r.mascota?.nombre) || "Mascota sin nombre",
  userFullName:
    `${safeText(r.usuario?.nombre)} ${safeText(r.usuario?.apellido)}`.trim() ||
    "Usuario sin nombre",

  chipId: safeText(r.chip_id),
  lat: Number(r.lat),
  lng: Number(r.lng),
  address: safeText(r.direccion),
  province: safeText(r.provincia),
  postal: safeText(r.codigoPostal),
  safeZone: !!r.localizacion_segura,
  updatedAt: r.updated_at || r.created_at || null,
}));

    if (!q) return base;

    return base.filter((p) => {
      const haystack =
        `${p.mascotaId} ${p.ownerId} ${p.chipId} ${p.address} ${p.province} ${p.postal}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  const defaultCenter = [-34.6037, -58.3816]; // CABA

  if (loading) return <div className="p-6">Cargando mapa…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Mapa general</h1>
          <p className="text-sm text-gray-600">
            Última ubicación registrada de cada mascota.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por dirección, provincia, id…"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Mostrando <strong>{points.length}</strong> mascota{points.length === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="h-[70vh] w-full">
          <MapContainer
            center={points[0] ? [points[0].lat, points[0].lng] : defaultCenter}
            zoom={13}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <FitToMarkers points={points} />

            {points.map((p) => (
              <Marker key={p.mascotaId} position={[p.lat, p.lng]}>
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">Mascota: {p.petName}</div>
                    <div className="text-xs text-gray-600">Usuario: {p.userFullName}</div>

                    <div className="text-sm">
                      {p.address ? p.address : "Dirección no disponible"}
                      {p.province ? `, ${p.province}` : ""}
                      {p.postal ? ` (${p.postal})` : ""}
                    </div>

                    <div className="text-xs">
                      Estado:{" "}
                      <span className={p.safeZone ? "text-green-700" : "text-red-600"}>
                        {p.safeZone ? "Zona segura" : "Fuera de zona segura"}
                      </span>
                    </div>

                    {p.updatedAt && (
                      <div className="text-[11px] text-gray-500">
                        Actualizado: {new Date(p.updatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}