import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventForm from "../../components/EventForm";
import { adminCreateEvent } from "../../services/eventsAdmin";

export default function AdminEventCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload, locations) {
    try {
      setSubmitting(true);
      await adminCreateEvent(payload, locations);
      navigate("/admin/eventos");
    } catch (e) {
      console.error("Error creating event:", e);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nuevo evento</h1>

        <button
          type="button"
          onClick={() => navigate("/admin/eventos")}
          className="text-sm text-gray-600 hover:underline"
        >
          Volver
        </button>
      </div>

      <EventForm
        mode="create"
        initialValues={{ active: true, free: true }}
        initialLocations={[]}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Aceptar"
      />
    </div>
  );
}