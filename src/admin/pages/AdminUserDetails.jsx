import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminGetMembershipOptions,
  adminGetUserById,
  adminUpdateUser,
} from "../services/usersAdmin";

export default function AdminUserDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [plans, setPlans] = useState([]);

  const [form, setForm] = useState({
    telefono: "",
    direccion: "",
    provincia: "",
    codigoPostal: "",
    membresia_codigo: "freemium",
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [userRes, membershipOptions] = await Promise.all([
          adminGetUserById(id),
          adminGetMembershipOptions(),
        ]);

        setUser(userRes.user);
        setPets(userRes.pets);
        setPlans(membershipOptions);

        setForm({
          telefono: userRes.user?.telefono ?? "",
          direccion: userRes.user?.direccion ?? "",
          provincia: userRes.user?.provincia ?? "",
          codigoPostal: userRes.user?.codigoPostal ?? "",
          membresia_codigo: userRes.user?.membresia_codigo ?? "freemium",
        });
      } catch (e) {
        console.error("Error loading user:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSave() {
    try {
      setSaving(true);

      await adminUpdateUser(id, {
        telefono: form.telefono.trim() || null,
        direccion: form.direccion.trim() || null,
        provincia: form.provincia.trim() || null,
        codigoPostal: form.codigoPostal.trim() || null,
        membresia_codigo: form.membresia_codigo || "freemium",
      });

      navigate("/admin/usuarios");
    } catch (e) {
      console.error("Error saving user:", e);
      setSaving(false);
    }
  }

  if (loading) return <div className="bg-white rounded-lg p-6 shadow-sm">Cargando…</div>;
  if (!user) return <div className="bg-white rounded-lg p-6 shadow-sm">Usuario no encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Detalle de usuario</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/usuarios")}
          className="text-sm text-gray-600 hover:underline"
        >
          Volver
        </button>
      </div>

      {/* Info básica */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Información</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Nombre</p>
            <p className="font-medium">{user.nombre} {user.apellido}</p>
          </div>

          <div>
            <p className="text-gray-500">Documento</p>
            <p className="font-medium">{user.documento || "-"}</p>
          </div>

          <div>
            <label className="text-gray-500">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-gray-500">Provincia</label>
            <input
              name="provincia"
              value={form.provincia}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-gray-500">Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-gray-500">Código postal</label>
            <input
              name="codigoPostal"
              value={form.codigoPostal}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-gray-500">Membresía</label>
            <select
              name="membresia_codigo"
              value={form.membresia_codigo}
              onChange={handleChange}
              className="mt-1 w-full border rounded px-3 py-2 bg-white"
            >
              {/* fallback */}
              <option value="freemium">freemium</option>

              {plans.map((p) => (
                <option key={p.codigo} value={p.codigo}>
                  {p.titulo} ({p.codigo})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-4 rounded bg-[#22687B] text-white text-sm font-medium hover:bg-[#2f7f96] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Mascotas */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Mascotas del usuario</h2>

        {pets.length === 0 ? (
          <p className="text-sm text-gray-500">No tiene mascotas registradas.</p>
        ) : (
          <div className="space-y-3">
            {pets.map((p) => (
              <div key={p.id} className="border rounded p-3">
                <p className="font-medium text-gray-800">
                  {p.nombre} <span className="text-gray-500 text-sm">({p.especie})</span>
                </p>
                <p className="text-sm text-gray-600">
                  {p.raza || "Sin raza"} • {p.sexo || "Sin dato"} • {p.estado_salud || "Sin dato"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}