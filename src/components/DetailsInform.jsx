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

function getPlanBadgeClasses(label) {
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";
  if (label === "Premium") return `${base} bg-[#FF8C09]/10 border-[#FF8C09]/30 text-[#b45f00]`;
  if (label === "Plus") return `${base} bg-[#22687B]/10 border-[#22687B]/30 text-[#22687B]`;
  return `${base} bg-gray-100 border-gray-200 text-gray-700`;
}

export default function DetailsInform({ details, ubicacion }) {
  if (!details) return null;

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
    membresia_codigo,
  } = details;

  const {
    direccion: direccionLoc,
    codigoPostal: codigoPostalLoc,
    provincia: provinciaLoc,
  } = ubicacion || {};

  const direccionMostrar = direccionLoc || direccionUser || "";
  const codigoPostalMostrar = codigoPostalLoc || codigoPostalUser || "";
  const provinciaMostrar = provinciaLoc || provinciaUser || "";

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

  const planLabel = getPlanLabel(userData?.membresia_codigo ?? membresia_codigo);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-5xl">
        <div className="bg-white border border-black/5 shadow-sm rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">
            {/* Foto */}
            <div className="shrink-0">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden bg-gray-100 border border-black/10 shadow-sm">
                <img
                  src={userData?.foto_url || foto_url || "/default-avatar.png"}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  draggable="false"
                />
              </div>

            
            </div>

            {/* Info */}
            <div className="w-full">
              {/* Header desktop (en mobile ya lo mostramos bajo la foto) */}
              <div className="hidden md:flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#22687b]">
                    {nombre} {apellido}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Información de tu cuenta
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={getPlanBadgeClasses(planLabel)}>{planLabel}</span>

                  <Link
                    to="/planes"
                    className="inline-flex items-center rounded-[10px] px-4 py-2 text-sm font-semibold
                               bg-[#FF8C09] text-white hover:brightness-110 active:brightness-95 transition"
                  >
                    Cambiar plan
                  </Link>
                </div>
              </div>

              {/* Datos */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-black/5 bg-gray-50/60 p-4">
                  <p className="text-xs text-gray-500">Fecha de nacimiento</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {fechaNacimiento || "No especificada"}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/5 bg-gray-50/60 p-4">
                  <p className="text-xs text-gray-500">Género</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {genero || "No especificado"}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/5 bg-gray-50/60 p-4 sm:col-span-2">
                  <p className="text-xs text-gray-500">Dirección</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {direccionMostrar
                      ? `${capitalizeAll(direccionMostrar)}, ${codigoPostalMostrar}, ${provinciaMostrar}`
                      : "No especificada"}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/5 bg-gray-50/60 p-4">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="mt-1 font-semibold text-gray-800 break-all">
                    {email || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/5 bg-gray-50/60 p-4">
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {telefono || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-black/5 bg-gray-50/60 p-4 sm:col-span-2">
                  <p className="text-xs text-gray-500">Documento</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {tipoDocumento || "DNI"} {documento || "-"}
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setOpenModal(true)}
                  className="inline-flex justify-center items-center rounded-[10px]
                             bg-[#22687b] text-white px-6 py-3 font-semibold
                             hover:brightness-110 active:brightness-95 transition"
                >
                  Editar perfil
                </button>

                {/* en mobile mostramos cambiar plan acá también */}
                <Link
                  to="/planes"
                  className="md:hidden inline-flex justify-center items-center rounded-[10px]
                             bg-white text-[#22687B] px-6 py-3 font-semibold border border-[#22687B]
                             hover:bg-[#22687B]/5 active:bg-[#22687B]/10 transition"
                >
                  Cambiar plan
                </Link>
              </div>
            </div>
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
    </section>
  );
}