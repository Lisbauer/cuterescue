import { useState } from "react";

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remueve los acentos
    .replace(/[^a-z0-9\s-]/g, "") // solo letras/numeros/espacio/guion etcc
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .slice(0, 60);
}

export default function EventForm({
  mode = "create", 
  initialValues,
  initialLocations,
  onSubmit,
  submitting,
  submitLabel = "Guardar",
}) {
  const [values, setValues] = useState(() => ({

    title: initialValues?.title ?? "",
    summary: initialValues?.summary ?? "",
    details: initialValues?.details ?? "",
    access: initialValues?.access ?? "",
    requirements: (initialValues?.requirements ?? []).join("\n"),
    free: initialValues?.free ?? true,
    notes: initialValues?.notes ?? "",
    source_url: initialValues?.source_url ?? "",
    imagen_url: initialValues?.imagen_url ?? "",
    activa: initialValues?.activa ?? true,
  }));

  const [locations, setLocations] = useState(() =>
    (initialLocations ?? []).map((l) => ({
      name: l.name ?? "",
      address: l.address ?? "",
    }))
  );

  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function addLocation() {
    setLocations((p) => [...p, { name: "", address: "" }]);
  }

  function updateLocation(idx, key, value) {
    setLocations((p) =>
      p.map((l, i) => (i === idx ? { ...l, [key]: value } : l))
    );
  }

  function removeLocation(idx) {
    setLocations((p) => p.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!values.title.trim()) return setError("Falta el título.");

    const cleanLocations = locations
      .map((l) => ({
        name: l.name.trim(),
        address: l.address.trim(),
      }))
      .filter((l) => l.name && l.address);

    if (cleanLocations.length === 0)
      return setError("Agregá al menos 1 ubicación (nombre + dirección).");

    const requirementsArr = values.requirements
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const payload = {

      id: mode === "create" ? slugify(values.title) : initialValues.id,

      title: values.title.trim(),
      summary: values.summary.trim() || null,
      details: values.details.trim() || null,
      access: values.access.trim() || null,
      requirements: requirementsArr.length ? requirementsArr : null,
      free: !!values.free,
      notes: values.notes.trim() || null,
      source_url: values.source_url.trim() || null,
      imagen_url: values.imagen_url.trim() || null,
      activa: !!values.activa,
    };

    await onSubmit(payload, cleanLocations);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Datos del evento</h2>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="activa" checked={values.activa} onChange={handleChange} />
          Activo
        </label>
      </div>

      {error && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Título *</label>
          <input
            name="title"
            value={values.title}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Ej: Castración gratuita en plazas"
          />
          {mode === "create" && (
            <p className="text-xs text-gray-400 mt-1">
              ID automático: <b>{slugify(values.title) || "—"}</b>
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Descripción</label>
          <textarea
            name="summary"
            value={values.summary}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2 min-h-[90px]"
            placeholder="Descripción corta para mostrar al usuario"
          />
        </div>
      </div>

      {/* Ubicaciones */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold">Ubicaciones</h3>
          <button type="button" onClick={addLocation} className="text-sm text-[#22687B] hover:underline">
            + Agregar ubicación
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {locations.map((loc, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-gray-50 p-3 rounded">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600">Nombre</label>
                <input
                  value={loc.name}
                  onChange={(e) => updateLocation(idx, "name", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="Ej: Plaza X"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-gray-600">Dirección</label>
                <input
                  value={loc.address}
                  onChange={(e) => updateLocation(idx, "address", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="Ej: Av. ... 123"
                />
              </div>

              <div className="flex items-end justify-end">
                <button type="button" onClick={() => removeLocation(idx)} className="text-sm text-red-700 hover:underline">
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="h-10 px-4 rounded bg-[#22687B] text-white text-sm font-medium hover:bg-[#2f7f96] disabled:opacity-60"
        >
          {submitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}