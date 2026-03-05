import React, { useState } from "react";
import { Link } from "react-router-dom";
import BtnViaje from "./ui/BtnTrip";
import BtnEmergency from "./ui/BtnEmergency";
import ModalViajeCard from "./modals/ModalTripCard";
import ModalAlert from "./modals/ModalAlert";
import { useSavedData } from "../context/SavedDataContext";
import AppH1 from "./ui/AppH1";
import { capitalizeAll } from "../utils/text";

/**
 componente encargado de mostrar la info principal del usuario
incluye accesos directos:
  modo viaje
  boton de emergencia
  Modal de viaje
  Modal de alerta global */

export default function PersonalInform({ details, locations }) {
  const [showModal, setShowModal] = useState(false);
  const { showAlert, alert, setAlert, closeAlert } = useSavedData();

  //  bloquea si todavía no tenemos al usuario
  if (!details) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  const {
    nombre = "",
    apellido = "",
    foto_url = "",
    direccion: direccionUser = "",
    codigoPostal: codigoPostalUser = "",
    provincia: provinciaUser = "",
  } = details;

  const {
    direccion: direccionLoc = "",
    codigoPostal: codigoPostalLoc = "",
    provincia: provinciaLoc = "",
  } = locations || {};

  //  tomo primero de localización_usuario y si no hay, de usuarios
  const direccionMostrar = direccionLoc || direccionUser || "";
  const codigoPostalMostrar = codigoPostalLoc || codigoPostalUser || "";
  const provinciaMostrar = provinciaLoc || provinciaUser || "";

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-0">
      {/* dirección */}
      {(direccionMostrar || codigoPostalMostrar || provinciaMostrar) && (
        <div className="flex flex-wrap gap-3 text-gray-700 text-sm sm:text-base">
          <span>{`${capitalizeAll(
            direccionMostrar
          )}, ${codigoPostalMostrar}`}</span>

          <span>|</span>
          <span>{provinciaMostrar}</span>
        </div>
      )}

      {/* Nombre */}
      <AppH1 className="mt-4 sm:text-5xl">
        {`${capitalizeAll(nombre)} ${capitalizeAll(apellido)}`}
      </AppH1>

      {/* botones */}
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 mt-4">
        <BtnViaje onClick={() => setShowModal(true)} />
        <BtnEmergency />
      </div>

      {/* Avatar + visualizar el perfil */}
      <div className="flex flex-row justify-end items-center gap-5 mt-4">
        <div className="bg-gray-300 rounded-full w-16 h-16 overflow-hidden">
          <img
            src={foto_url || "/default-avatar.png"}
            alt={`Foto de ${nombre || "usuario"}`}
            className="w-full h-full object-cover"
          />
        </div>
        <Link
          to="/detalles"
          className="text-[#d5d5d5] hover:text-gray-700 text-sm sm:text-base mt-1"
        >
          Visualizar perfil
        </Link>
      </div>

      {/* Modal viaje */}
      {showModal && <ModalViajeCard onClose={() => setShowModal(false)} />}

      {/* Modal emergencia */}
      <ModalAlert show={showAlert} alert={alert} onClose={closeAlert} />
    </div>
  );
}
