import React, { useState } from "react";
import { Link } from "react-router-dom";
import ModalEdicionUsuario from "./modals/ModalEditUser";
import { supabase } from "../services/supabase";
import { capitalizeAll } from "../utils/text";

function getPlanLabel(code) {
  const c = (code || "freemium").toLowerCase();

  if (c === "premium") return "Premium";
  if (c === "plus") return "Plus";
  return "Freemium";
}

export default function DetailsInform({ details, ubicacion }) {
  if (!details) return <div>Loading...</div>;

  const {
    email,
    fechaNacimiento,
    documento,
    telefono,
    nombre,
    apellido,
    tipoDocumento,
    foto_url,
    direccion: direccionUser,
    codigoPostal: codigoPostalUser,
    provincia: provinciaUser,
    genero,
    membresia_codigo, // 👈 plan actual desde DB
  } = details;

  const {
    direccion: direccionLoc,
    codigoPostal: codigoPostalLoc,
    provincia: provinciaLoc,
    direccion_segura,
  } = ubicacion || {};

  const direccionMostrar = direccionLoc || direccionUser || "";
  const codigoPostalMostrar = codigoPostalLoc || codigoPostalUser || "";
  const provinciaMostrar = provinciaLoc || provinciaUser || "";

  const esSegura = direccion_segura === true || direccion_segura === "true";
  const estadoSeguridad = esSegura ? "Sí" : "No";
  const colorSeguridad = esSegura ? "bg-green-500" : "bg-red-500";

  const [openModal, setOpenModal] = useState(false);
  const [userData, setUserData] = useState(details);

  const handleSave = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", details.id)
      .single();

    if (!error) setUserData(data);
  };

  // ✅ Plan dinámico desde userData (así se actualiza tras checkout)
  const planLabel = getPlanLabel(userData?.membresia_codigo ?? membresia_codigo);

  return (
    <div className="flex flex-col md:flex-row gap-10 justify-center items-center w-full">
      {/* Foto */}
      <div className="bg-gray-200 w-72 h-80 rounded-2xl overflow-hidden shadow-md">
        <img
          src={userData.foto_url || "/default-avatar.png"}
          alt="Foto de perfil"
          className="object-cover w-full h-full"
        />
      </div>

      {/* info del usuario */}
      <div className="flex flex-col gap-4 max-w-2xl">
        <h2 className="font-bold text-4xl text-[#22687b]">
          {nombre} {apellido}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-gray-800">
          <p>
            <strong>Fecha de nacimiento:</strong> {fechaNacimiento}
          </p>
          <p>
            <strong>Género:</strong> {genero || "No especificado"}
          </p>

          <p>
            <strong>Dirección:</strong>{" "}
            {direccionMostrar
              ? `${capitalizeAll(direccionMostrar)}, ${codigoPostalMostrar}, ${provinciaMostrar}`
              : "No especificada"}
            <span
              className={`${colorSeguridad} py-1 px-5 ml-2 rounded-2xl text-white`}
            >
              {estadoSeguridad}
            </span>
          </p>

          <p>
            <strong>Email:</strong> {email}
          </p>
          <p>
            <strong>Teléfono:</strong> {telefono}
          </p>

          <p>
            <strong>Documento:</strong> {tipoDocumento || "DNI"} {documento}
          </p>

          <p>
            <strong>Plan:</strong> {planLabel}{" "}
            <Link
              to="/planes"
              className="ml-3 px-4 py-1 bg-[#FF8C09] text-white font-medium rounded-md hover:bg-[#e07e07] transition"
            >
              Cambiar
            </Link>
          </p>

          <p>
            <strong>GPS Activo:</strong> Sí{" "}
            <Link
              to="/#"
              className="ml-3 px-4 py-1 bg-[#22687B] text-white font-medium rounded-md hover:bg-[#1b5056] transition"
            >
              Acceder
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setOpenModal(true)}
            className="bg-[#22687b] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1b5056] transition"
          >
            Editar perfil
          </button>
        </div>
      </div>

      <ModalEdicionUsuario
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        currentUser={userData}
        ubicacion={ubicacion}
        onSave={handleSave}
      />
    </div>
  );
}