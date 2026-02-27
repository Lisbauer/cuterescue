import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function uploadVetImage(file) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `vet-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("veterinarias")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("veterinarias").getPublicUrl(fileName);
  return data.publicUrl;
}

export default function VetForm({
  initialValues,
  onSubmit,
  submitting,
  submitLabel = "Guardar",
}) {
  const [values, setValues] = useState(() => ({
    nombre: initialValues?.nombre ?? "",
    direccion: initialValues?.direccion ?? "",
    telefono: initialValues?.telefono ?? "",
    link: initialValues?.link ?? "",
    lat: initialValues?.lat ?? "",
    lng: initialValues?.lng ?? "",
    activa: initialValues?.activa ?? true,
    imagen_url: initialValues?.imagen_url ?? null, // guardamos la existente si hay
  }));

  const [error, setError] = useState("");

  // Imagen
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initialValues?.imagen_url ?? "");


  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleFileChange(e) {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen es muy pesada (máximo 2MB).");
      return;
    }

    setImageFile(file);

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!values.nombre.trim()) return setError("Falta el nombre.");
    if (!values.direccion.trim()) return setError("Falta la dirección.");

    const lat = toNumber(values.lat);
    const lng = toNumber(values.lng);
    if (lat === null || lng === null) return setError("Lat/Lng inválidos.");
    if (lat < -90 || lat > 90) return setError("Latitud fuera de rango.");
    if (lng < -180 || lng > 180) return setError("Longitud fuera de rango.");

    try {

      let imagenUrlFinal = values.imagen_url ?? null;

      if (imageFile) {
        imagenUrlFinal = await uploadVetImage(imageFile);
      }

      const payload = {
        nombre: values.nombre.trim(),
        direccion: values.direccion.trim(),
        telefono: values.telefono.trim() || null,
        link: values.link.trim() || null,
        lat,
        lng,
        imagen_url: imagenUrlFinal,
        activa: !!values.activa,
      };

      await onSubmit(payload);
    } catch (err) {
      console.error("Error guardando veterinaria:", err);
      setError(
        err?.message ||
          "Ocurrió un error al guardar. Revisá permisos de Storage/RLS."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-6 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Datos de la veterinaria</h2>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            name="activa"
            checked={values.activa}
            onChange={handleChange}
          />
          Activa
        </label>
      </div>

      {error && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Nombre *</label>
          <input
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Ej: Veterinaria Panda"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Teléfono</label>
          <input
            name="telefono"
            value={values.telefono}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Ej: 011 1234-5678"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Dirección *</label>
          <input
            name="direccion"
            value={values.direccion}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Ej: Av. Boedo 840, CABA"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Latitud *</label>
          <input
            name="lat"
            value={values.lat}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="-34.60"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Longitud *</label>
          <input
            name="lng"
            value={values.lng}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="-58.38"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Link (web/instagram)</label>
          <input
            name="link"
            value={values.link}
            onChange={handleChange}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>

        {/* IMAGEN */}
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Imagen</label>

          <div className="mt-2 flex items-start gap-4">
            <div className="w-44 h-28 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">Sin imagen</span>
              )}
            </div>

            <div className="flex-1">
              <label className="inline-flex items-center gap-2 text-sm">
                <span className="px-3 py-2 rounded border bg-white hover:bg-gray-50 cursor-pointer">
                  Seleccionar archivo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-gray-400 mt-2">
                JPG/PNG/WebP — máximo 2MB.
              </p>

              {values.imagen_url && !imageFile && (
                <p className="text-xs text-gray-500 mt-2">
                  Ya hay una imagen cargada. Si seleccionás otra, se reemplaza.
                </p>
              )}
            </div>
          </div>
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