import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetMemberships } from "../services/membershipsAdmin";

export default function AdminMembershipsList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await adminGetMemberships();
        setPlans(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="bg-white p-6 rounded shadow-sm">Cargando...</div>;
  }

  return (
    <div className="bg-white p-6 rounded shadow-sm space-y-4">
      <h1 className="text-lg font-semibold">Membresías</h1>

      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded p-4 flex justify-between items-center ${
              plan.activa ? "border-gray-200" : "border-red-300 bg-red-50"
            }`}
          >
            <div>
              <p className="font-medium">{plan.titulo}</p>
              <p className="text-sm text-gray-500">{plan.precio_label}</p>
              {!plan.activa && (
                <p className="text-xs text-red-600 font-medium">
                  Plan desactivado
                </p>
              )}
            </div>

            <button
              onClick={() =>
                navigate(`/admin/membresias/${plan.id}/editar`)
              }
              className="text-sm text-[#22687B] hover:underline"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}