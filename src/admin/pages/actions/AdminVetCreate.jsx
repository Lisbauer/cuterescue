import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VetForm from "../../components/VetForm";
import { adminCreateVet } from "../../services/vetAdmin.service";

export default function AdminVetCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload) {
    try {
      setSubmitting(true);
      await adminCreateVet(payload);
      navigate("/admin/veterinarias");
    } catch (e) {
      console.error("Error creando vet:", e);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nueva veterinaria</h1>
        <button
          type="button"
          onClick={() => navigate("/admin/veterinarias")}
          className="text-sm text-gray-600 hover:underline"
        >
          Volver
        </button>
      </div>

      <VetForm
        initialValues={{ activa: true }}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Crear"
      />
    </div>
  );
}