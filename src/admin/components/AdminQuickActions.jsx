import { useNavigate } from "react-router-dom";

export default function AdminQuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: "➕ Crear evento", onClick: () => navigate("/admin/eventos/nuevo") },
    { label: "➕ Agregar veterinaria", onClick: () => navigate("/admin/veterinarias/nueva") },
    { label: "Ver usuarios", onClick: () => navigate("/admin/usuarios") },
    { label: "Membresías", onClick: () => navigate("/admin/membresias") },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Accesos rápidos</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="h-12 rounded-md bg-[#22687B] text-white text-sm font-medium hover:bg-[#2f7f96] transition"
            type="button"
          >
            {a.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Atajos para administrar contenido sin buscar en el menú.
      </p>
    </div>
  );
}