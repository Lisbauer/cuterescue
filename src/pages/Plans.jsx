import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppH1 from "../components/ui/AppH1";
import { getMemberships } from "../services/memberships";

function getPlanStyles(theme, highlighted) {
  if (theme === "dorado") {
    return {
      textColor: "text-[#3D8E88]",
      borderColor: "border-[#F7A82A]",
      buttonClass: highlighted
        ? "bg-[#F7A82A] text-white"
        : "bg-[#22687b] text-white",
    };
  }

  // default: verde
  return {
    textColor: "text-[#3D8E88]",
    borderColor: "border-[#3D8E88]",
    buttonClass: highlighted
      ? "bg-[#F7A82A] text-white"
      : "bg-[#22687b] text-white",
  };
}

export default function Planes() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getMemberships();
        setPlans(data);
      } catch (e) {
        console.error("Error loading memberships:", e);
        setError("No se pudieron cargar los planes. Intentalo más tarde.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="text-center text-gray-500 mt-10">Cargando planes...</div>
      );
    }

    if (error) {
      return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    if (!plans.length) {
      return (
        <div className="text-center text-gray-500 mt-10">
          No hay planes disponibles por el momento.
        </div>
      );
    }

    return (
      <div className="flex flex-col md:flex-row justify-center gap-8">
        {plans.map((plan) => {
          const highlighted = !!plan.destacado;
          const styles = getPlanStyles(plan.tema, highlighted);

          const isFreemium = (plan.codigo || "").toLowerCase() === "freemium";

          return (
            <div
              key={plan.codigo}
              className={`flex-1 max-w-sm md:max-w-xs border rounded-xl p-8 shadow-lg transition-transform hover:scale-105 ${
                highlighted ? "border-2" : "border"
              } ${styles.borderColor} bg-white`}
            >
              {highlighted && (
                <div className="text-[#F7A82A] mb-2 text-xl">★</div>
              )}

              <h2 className={`text-xl font-semibold mb-2 ${styles.textColor}`}>
                {plan.titulo}
              </h2>

              <p className="text-3xl font-bold mb-6">{plan.precio_label}</p>

              <ul className="text-left mb-6 space-y-2">
                {(plan.beneficios ?? []).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-[#3D8E88] font-bold">✔</span> {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  if (isFreemium) {
                    // Si es freemium, no tiene sentido ir a pagar
                    navigate("/dashboard");
                    return;
                  }
                  navigate(`/checkout/${plan.codigo}`);
                }}
                className={`w-full py-2 rounded-md font-semibold transition-colors hover:brightness-95 ${styles.buttonClass}`}
              >
                {isFreemium ? "Usar plan gratuito" : plan.texto_boton || "Elegir plan"}
              </button>
            </div>
          );
        })}
      </div>
    );
  }, [loading, error, plans, navigate]);

  return (
    <section className="py-16 px-4 md:px-12 text-center">
      <AppH1 className="estilosH1 text-center">Planes y Precios</AppH1>
      {content}
    </section>
  );
}