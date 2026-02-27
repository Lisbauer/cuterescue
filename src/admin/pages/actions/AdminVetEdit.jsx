import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VetForm from "../../components/VetForm";
import { adminGetVetById, adminUpdateVet } from "../../services/vetAdmin.service";

export default function AdminVetEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await adminGetVetById(Number(id));
        setInitial(data);
      } catch (e) {
        console.error("Error cargando vet:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(payload) {
    try {
      setSubmitting(true);
      await adminUpdateVet(Number(id), payload);
      navigate("/admin/veterinarias");
    } catch (e) {
      console.error("Error actualizando vet:", e);
      setSubmitting(false);
    }
  }

  if (loading) return <div className="bg-white rounded-lg p-6 shadow-sm">Cargando…</div>;
  if (!initial) return <div className="bg-white rounded-lg p-6 shadow-sm">No encontrada.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar veterinaria</h1>
        <button
          type="button"
          onClick={() => navigate("/admin/veterinarias")}
          className="text-sm text-gray-600 hover:underline"
        >
          Volver
        </button>
      </div>

      <VetForm
        initialValues={initial}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}