import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";
import MapaVet from "../components/maps/MapVets";
import AppH1 from "../components/ui/AppH1";
import { getVeterinarias24 } from "../services/vet.service";
import LoadingScreen from "../components/ui/LoadingScreen";

// sistema de calculo de distancia entre la ubicacion del usuario y cada vet se obtiene la lat y long del usuario desde la tabla localizacion_usuario, usando owner_id. guardo estos datos en el estado userlocation.use la formula de haversine para calcular la distanca real en km entre dos coords geograficas

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Veterinaria() {
  const [veterinarias, setVeterinarias] = useState([]);
  const [selectedVet, setSelectedVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    async function loadUserLocation() {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      if (!uid) return;

      const { data, error } = await supabase
        .from("localizacion_usuario")
        .select("lat, lng")
        .eq("owner_id", uid)
        .maybeSingle();

      if (!error && data?.lat && data?.lng) {
        setUserLocation({
          lat: Number(data.lat),
          lng: Number(data.lng),
        });
      }
    }

    loadUserLocation();
  }, []);


  useEffect(() => {
    async function loadVets() {
      try {
        const data = await getVeterinarias24();

  
        const normalized = data.map((v) => ({
          ...v,
          lat: Number(v.lat),
          lng: Number(v.lng),
        }));

        setVeterinarias(normalized);
        setSelectedVet(normalized[0] ?? null);
      } catch (e) {
        console.error("Error cargando veterinarias:", e);
      } finally {
        setLoading(false);
      }
    }

    loadVets();
  }, []);

 
  useEffect(() => {
    if (!userLocation || veterinarias.length === 0) return;

    const withDistance = veterinarias.map((vet) => {
      if (!vet.lat || !vet.lng) return vet;

      const distance = getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        vet.lat,
        vet.lng
      );

      return {
        ...vet,
        distanceKm: distance,
      };
    });

    const sorted = withDistance.sort(
      (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    );

    setVeterinarias(sorted);
    setSelectedVet(sorted[0] ?? null);
  }, [userLocation]);

  const handleSelectVet = (vet) => {
    setSelectedVet(vet);
    setTimeout(() => {
      mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  if (loading)
    return (
      <div className="min-h-screen p-6">
        <LoadingScreen fullScreen={false} className="py-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F7F9F9] py-10 px-6">
      {/* MAPA */}
      <div className="flex justify-center" ref={mapRef}>
        <div className="max-w-7xl w-full z-10">
          {selectedVet && (
            <MapaVet
              lat={selectedVet.lat}
              lng={selectedVet.lng}
              nombre={selectedVet.nombre}
              userLocation={userLocation}
            />
          )}
        </div>
      </div>

      <AppH1 className="estilosH1 text-center">
        Veterinarias 24 hrs
      </AppH1>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {veterinarias.map((vet) => (
          <div
            key={vet.id}
            onClick={() => handleSelectVet(vet)}
            className={`bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer ${
              selectedVet?.id === vet.id ? "ring-2 ring-[#22687b]" : ""
            }`}
          >
            <img
              src={
                vet.imagen_url ||
                "/src/assets/images/veterinarias/veterinaria-1.png"
              }
              alt={vet.nombre}
              className="w-full h-64 object-cover"
            />

            <div className="p-5">
              <h2 className="text-xl font-semibold text-[#22687b] mb-2">
                {vet.nombre}
              </h2>
              {vet.distanceKm !== undefined && (
                <p className="text-sm text-red-600 font-semibold">
                  A {vet.distanceKm.toFixed(1)} km de tu ubicación
                </p>
              )}
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Dirección:</span>{" "}
                {vet.direccion}
              </p>

              <p className="text-gray-700 mb-2">
                <span className="font-medium">Teléfono:</span>{" "}
                {vet.telefono || "—"}
              </p>



              {vet.link && (
                <a
                  href={vet.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 px-4 py-2 text-[#22687b] border border-[#22687b] rounded hover:bg-[#22687b] hover:text-white transition-all duration-200"
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