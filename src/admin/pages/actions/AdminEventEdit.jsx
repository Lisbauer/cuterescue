import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventForm from "../../components/EventForm";
import { adminGetEventById, adminUpdateEvent } from "../../services/eventsAdmin";

export default function AdminEventEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initial, setInitial] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await adminGetEventById(id);
        setInitial(res.event);
        setLocations(res.locations);
      } catch (e) {
        console.error("Error loading event:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(payload, newLocations) {
    try {
      setSubmitting(true);
      await adminUpdateEvent(id, payload, newLocations);
      navigate("/admin/eventos");
    } catch (e) {
      console.error("Error updating event:", e);
      setSubmitting(false);
    }
  }

  if (loading) return <div className="bg-white rounded-lg p-6 shadow-sm">Cargando…</div>;
  if (!initial) return <div className="bg-white rounded-lg p-6 shadow-sm">No encontrado.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar evento</h1>

        <button
          type="button"
          onClick={() => navigate("/admin/eventos")}
          className="text-sm text-gray-600 hover:underline"
        >
          Volver
        </button>
      </div>

      <EventForm
        mode="edit"
        initialValues={initial}
        initialLocations={locations}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Guardar"
      />
    </div>
  );
}