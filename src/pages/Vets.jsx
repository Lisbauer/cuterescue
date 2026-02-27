import React, { useEffect, useRef, useState } from "react";
import MapaVet from "../components/maps/MapVets";
import AppH1 from "../components/ui/AppH1";
import { getVeterinarias24 } from "../services/vet.service";

export default function Veterinaria() {
  const [veterinarias, setVeterinarias] = useState([]);
  const [selectedVet, setSelectedVet] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getVeterinarias24();
        setVeterinarias(data);
        setSelectedVet(data[0] ?? null);
      } catch (e) {
        console.error("Error cargando veterinarias:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectVet = (vet) => {
    setSelectedVet(vet);
    setTimeout(() => {
      mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  if (loading) return <div className="min-h-screen bg-[#F7F9F9] p-6">Cargando…</div>;

  return (
    <div className="min-h-screen bg-[#F7F9F9] py-10 px-6">
      <div className="flex justify-center" ref={mapRef}>
        <div className="max-w-7xl w-full z-10">
          {selectedVet && (
            <MapaVet
              lat={selectedVet.lat}
              lng={selectedVet.lng}
              nombre={selectedVet.nombre}
            />
          )}
        </div>
      </div>

      <AppH1 className="estilosH1 text-center">Veterinarias 24 hrs</AppH1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {veterinarias.map((vet) => (
          <div
            key={vet.id}
            onClick={() => handleSelectVet(vet)}
            className={`bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 ${
              selectedVet?.id === vet.id ? "ring-2 ring-[#22687b]" : ""
            }`}
          >
            <img
              src={vet.imagen_url || "/src/assets/images/veterinarias/veterinaria-1.png"}
              alt={vet.nombre}
              className="w-full h-64 object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-semibold text-[#22687b] mb-2">
                {vet.nombre}
              </h2>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Dirección:</span> {vet.direccion}
              </p>
              <p className="text-gray-700 mb-3">
                <span className="font-medium">Teléfono:</span> {vet.telefono || "—"}
              </p>
              {vet.link && (
                <a
                  href={vet.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 text-[#22687b] border border-[#22687b] rounded hover:bg-[#22687b] hover:text-white transition-all duration-200"
                >
                  Ver más
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}