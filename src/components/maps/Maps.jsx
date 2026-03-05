import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useSavedData } from "../../context/SavedDataContext";
import PetStatus from "../ui/PetStatus";
import { capitalizeAll } from "../../utils/text";


/**
 * muestra un mapa enfocado en la mascota seleccionada
 *
funcionalidades: renderiza un mapa con Leaflet basado en las coordenadas en tiempo real  
actualiza la vista con flyTo() cuando la mascota se mueve
inhabilita interacciones con el mapa cuando un modal está abierto
muestra datos clave como nombre, última dirección y estado (activo/inactivo) falta agregar HORA
 
 */

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.5 }); // zoom ajustado
  }, [center, map]);
  return null;
}

export default function Maps({ modalOpen }) {
  const { selectedPet, location } = useSavedData();
  const [petPosition, setPetPosition] = useState(null);

  useEffect(() => {
    if (location?.lat && location?.lng) {
      setPetPosition({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  if (!selectedPet)
    return (
      <div className="w-full h-80 flex items-center justify-center text-white text-3xl font-bold bg-amber-400 rounded-2xl">
        Seleccione una mascota
      </div>
    );

  if (!petPosition)
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500 bg-gray-100 rounded-2xl">
        Cargando ubicación...
      </div>
    );

  const direccion = location?.direccion || "Ubicación no disponible";
  const status = selectedPet.activo ? "Activo" : "Inactivo";
 
  return (
    <div className={` rounded-2xl overflow-hidden shadow ${modalOpen ? "pointer-events-none z-0" : "z-10"}`}>
     
     <div className="flex justify-between bg-[#f5dcb3] h-20 py-3 px-3">
  <div>
    <h2 className="font-semibold text-lg text-[#22687b]">{capitalizeAll(selectedPet.nombre)}</h2>
    <p className="text-sm text-gray-700">
      Última Localización: <span className="font-medium">{capitalizeAll(direccion)}</span>
    </p>
  </div>
 {/*  <PetStatus activo={selectedPet.activo} /> */}
</div>

      <div className=" h-[270px] w-[450px]">
        <MapContainer
          center={[petPosition.lat, petPosition.lng]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          dragging={!modalOpen}
          scrollWheelZoom={!modalOpen}
          doubleClickZoom={!modalOpen}
          touchZoom={!modalOpen}
          keyboard={!modalOpen}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[petPosition.lat, petPosition.lng]}>
            <Popup>
              <strong>{selectedPet.nombre}</strong> 🐾
            </Popup>
          </Marker>
          <ChangeView center={[petPosition.lat, petPosition.lng]} />
        </MapContainer>
      </div>
    </div>
  );
}
