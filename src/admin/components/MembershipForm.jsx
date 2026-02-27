import { useState } from "react";

export default function MembershipForm({
  initialValues,
  onSubmit,
  submitting,
}) {
  const [values, setValues] = useState({
    titulo: initialValues?.titulo ?? "",
    precio_label: initialValues?.precio_label ?? "",
    texto_boton: initialValues?.texto_boton ?? "",
    destacado: initialValues?.destacado ?? false,
    tema: initialValues?.tema ?? "verde",
    beneficios: (initialValues?.beneficios ?? []).join("\n"),
    activa: initialValues?.activa ?? true,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...values,
      beneficios: values.beneficios
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
    };

    onSubmit(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-sm space-y-4"
    >
      <h2 className="text-lg font-semibold">Editar membresía</h2>

      <div>
        <label className="text-sm">Título</label>
        <input
          name="titulo"
          value={values.titulo}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="text-sm">Precio</label>
        <input
          name="precio_label"
          value={values.precio_label}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="text-sm">Texto del botón</label>
        <input
          name="texto_boton"
          value={values.texto_boton}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="text-sm">Beneficios (uno por línea)</label>
        <textarea
          name="beneficios"
          value={values.beneficios}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mt-1 min-h-[100px]"
        />
      </div>

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="destacado"
            checked={values.destacado}
            onChange={handleChange}
          />
          Destacado
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="activa"
            checked={values.activa}
            onChange={handleChange}
          />
          Activa
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-[#22687B] text-white rounded"
      >
        {submitting ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}