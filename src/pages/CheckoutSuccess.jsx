import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppH1 from "../components/ui/AppH1";
import { supabase } from "../services/supabase";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    async function validate() {
      try {
        setLoading(true);

        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;

        const userId = authData.user?.id;
        if (!userId) {
          navigate("/login", { replace: true });
          return;
        }

        // Traer la ultima suscripción activa del usuario
        const { data: sub, error: subErr } = await supabase
          .from("suscripciones")
          .select("id, membresia_codigo, estado, created_at")
          .eq("user_id", userId)
          .eq("estado", "activa")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subErr) throw subErr;


        if (!sub) {
          navigate("/planes", { replace: true });
          return;
        }

        setActiveSub(sub);
      } catch (e) {
        console.error("Error validating checkout success:", e);
        navigate("/planes", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    validate();
  }, [navigate]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Validando compra…</p>
        </div>
      </div>
    );
  }


  if (!activeSub) return null;

  const planCodigo = activeSub.membresia_codigo;

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <AppH1 className="estilosH1 text-center">Pago confirmado</AppH1>

        <p className="text-gray-700 mt-2">
          Tu suscripción fue registrada correctamente.
        </p>

        <div className="mt-6 border rounded p-4">
          <p className="text-sm text-gray-500">Plan activado</p>
          <p className="text-xl font-semibold text-gray-800">
            {planCodigo}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Confirmado el {new Date(activeSub.created_at).toLocaleString()}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="h-11 px-5 rounded bg-[#22687B] text-white font-semibold hover:bg-[#2f7f96]"
          >
            Ir al Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/planes")}
            className="h-11 px-5 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            Ver Planes
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          * Confirmación simulada (demo académica). Acceso validado contra
          Supabase.
        </p>
      </div>
    </div>
  );
}