import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import { useEffect } from "react";

// funcion  para mover  mapa dinamicamente
function ChangeView({ lat, lng, nombre }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 17, { duration: 1.2 }); 
    }
  }, [lat, lng, map]);

  return null;
}

export default function MapaVet({ lat, lng, nombre, userLocation }) {
  if (!lat || !lng) return null;

  return (
    <div id="map-section" className="w-full h-96 rounded-2xl overflow-hidden mb-10 scroll-mt-20">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]}>
          <Popup autoOpen>{nombre}</Popup>
        </Marker>

        {userLocation && (
  <Marker position={[userLocation.lat, userLocation.lng]}>
    <Popup>Tu ubicación</Popup>
  </Marker>
)}

{userLocation && (
  <Polyline
    positions={[
      [userLocation.lat, userLocation.lng],
      [lat, lng],
    ]}
    pathOptions={{ color: "red", weight: 4 }}
  />
)}

    
        <ChangeView lat={lat} lng={lng} nombre={nombre} />
      </MapContainer>
    </div>
  );
}