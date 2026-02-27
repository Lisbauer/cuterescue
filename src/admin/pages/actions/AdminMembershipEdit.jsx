import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MembershipForm from "../../components/MembershipForm";
import { supabase } from "../../../services/supabase";
import { adminUpdateMembership } from "../../services/membershipsAdmin";

export default function AdminMembershipEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("membresias")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        setInitial(data);
      } catch (e) {
        console.error("error cargando la membresia:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(payload) {
    try {
      setSubmitting(true);
      await adminUpdateMembership(id, payload);
      navigate("/admin/membresias");
    } catch (e) {
      console.error("error actualizando membresia:", e);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="bg-white p-6 rounded shadow-sm">Cargando...</div>;
  }

  if (!initial) {
    return (
      <div className="bg-white p-6 rounded shadow-sm">
        Membresía no encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar membresía</h1>

        <button
          type="button"
          onClick={() => navigate("/admin/membresias")}
          className="text-sm text-gray-600 hover:underline"
        >
          Volver
        </button>
      </div>

      <div className="bg-white p-4 rounded border text-sm text-gray-600">
        <p>
          <b>Código:</b> {initial.codigo}
        </p>

      </div>

      <MembershipForm
        initialValues={initial}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}