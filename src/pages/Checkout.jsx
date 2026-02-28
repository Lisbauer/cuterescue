import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppH1 from "../components/ui/AppH1";
import {
  confirmDemoCheckout,
  getMembershipByCode,
  startDemoCheckout,
} from "../services/checkout";

export default function Checkout() {
  const navigate = useNavigate();
  const { codigo } = useParams();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // Inputs fake (solo UI)
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getMembershipByCode(codigo);
        if (!data) {
          setError("El plan seleccionado no existe o está desactivado.");
          setPlan(null);
          return;
        }

        // Opcional: si freemium, lo mandamos a planes (no tiene sentido pagar)
        if (data.codigo === "freemium") {
          navigate("/planes", { replace: true });
          return;
        }

        setPlan(data);
      } catch (e) {
        console.error("Error loading checkout plan:", e);
        setError("No se pudo cargar el checkout. Intentalo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [codigo, navigate]);

  const isFormValid = useMemo(() => {
    // Validación mínima (simulada)
    return (
      cardName.trim().length >= 3 &&
      cardNumber.replace(/\s/g, "").length >= 12 &&
      cardExp.trim().length >= 4 &&
      cardCvc.trim().length >= 3
    );
  }, [cardName, cardNumber, cardExp, cardCvc]);

  async function handlePay() {
    try {
      setPaying(true);
      setError("");

      if (!plan) throw new Error("Plan inválido.");
      if (!isFormValid) {
        setError("Completá los datos de pago para continuar.");
        setPaying(false);
        return;
      }

      // 1) crear suscripción pendiente
      const subscriptionId = await startDemoCheckout(plan.codigo);

      // 2) confirmar (simulado)
      await confirmDemoCheckout(subscriptionId, plan.codigo);

      // 3) success
      navigate("/checkout/exito", {
        replace: true,
        state: {
          planTitulo: plan.titulo,
          planCodigo: plan.codigo,
        },
      });
    } catch (e) {
      console.error("Checkout error:", e);
      setError(
        e?.message ||
          "Ocurrió un error al procesar el pago. Intentalo nuevamente."
      );
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <p className="text-gray-500">Cargando checkout...</p>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/planes")}
            className="mt-4 px-4 py-2 rounded bg-[#22687B] text-white"
          >
            Volver a Planes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <AppH1 className="estilosH1 text-center">Checkout</AppH1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Resumen */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2">Resumen del plan</h2>

          <div className="border rounded p-4">
            <p className="text-sm text-gray-500">Plan</p>
            <p className="text-xl font-semibold text-gray-800">{plan.titulo}</p>

            <p className="text-sm text-gray-500 mt-3">Precio</p>
            <p className="text-2xl font-bold">{plan.precio_label}</p>

            {(plan.beneficios ?? []).length > 0 && (
              <>
                <p className="text-sm text-gray-500 mt-4">Incluye</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  {plan.beneficios.map((b, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-[#3D8E88] font-bold">✔</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-3">
            * Checkout simulado para demo académica. El sistema registra la
            suscripción y actualiza el plan del usuario.
          </p>
        </section>

        {/* Pago (simulado) */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Datos de pago</h2>

          {error && (
            <div className="mb-4 text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">
                Nombre en la tarjeta
              </label>
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="Ej: Lisa Bauer"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Número de tarjeta</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="0000 0000 0000 0000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Vencimiento</label>
                <input
                  value={cardExp}
                  onChange={(e) => setCardExp(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="MM/AA"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">CVC</label>
                <input
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="123"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="w-full h-11 rounded bg-[#22687B] text-white font-semibold hover:bg-[#2f7f96] disabled:opacity-60"
            >
              {paying ? "Procesando..." : "Pagar (simulado)"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/planes")}
              className="w-full h-11 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              Volver a Planes
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}