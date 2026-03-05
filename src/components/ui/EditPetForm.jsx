import React, { useState } from "react";
import EditPetModal from "../modals/EditPetModal";
import { supabase } from "../../services/supabase";
import AppH1 from "./AppH1";
import { capitalizeAll } from "../../utils/text";

export default function EditPetForm({
  selectedPet,
  location,
  ubicacion,
  refreshPets,
  onPetDeleted,
  onPetUpdated,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("idle"); // idle | success | error
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!selectedPet) {
    return (
      <section className="w-full">
        <div className="bg-white border border-black/5 shadow-sm rounded-3xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#22687b]">
            Todavía no has agregado una mascota
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Cuando agregues una, vas a poder ver y editar toda su info acá.
          </p>
        </div>
      </section>
    );
  }

  const {
    nombre,
    especie,
    raza,
    fecha_nacimiento,
    peso,
    sexo,
    color,
    estado_salud,
    foto_url,
    id,
  } = selectedPet;

  const { direccion = "", codigoPostal = "", provincia = "" } = location || {};
  const {
    direccion: userDireccion = "",
    codigoPostal: userCodigoPostal = "",
    provincia: userProvincia = "",
  } = ubicacion || {};

  const handleDelete = async () => {
    setDeleteMessage("");
    setDeleteStatus("idle");

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      const { error } = await supabase.from("mascotas").delete().eq("id", id);
      if (error) throw error;

      setDeleteMessage("Mascota borrada correctamente.");
      setDeleteStatus("success");

      await refreshPets?.();
      onPetDeleted?.();
    } catch (err) {
      console.error(err);
      setDeleteMessage("Error al borrar la mascota.");
      setDeleteStatus("error");
    } finally {
      setConfirmDelete(false);
    }
  };

  const ownerLocationText =
    userDireccion || userCodigoPostal || userProvincia
      ? `${capitalizeAll(userDireccion)}, ${userCodigoPostal}, ${userProvincia}`
      : "—";

  const lastLocationText =
    direccion || codigoPostal || provincia
      ? `${capitalizeAll(direccion)}, ${codigoPostal}, ${provincia}`
      : "—";

  return (
    <section className="w-full">
      <div className="bg-white border border-black/5 shadow-sm rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">
          {/* Foto */}
          <div className="shrink-0 w-full md:w-auto">
            <div className="w-full max-w-[320px] mx-auto md:mx-0 md:w-64 md:h-64 h-72 rounded-3xl overflow-hidden bg-gray-100 border border-black/10 shadow-sm">
              <img
                src={foto_url || "/default-pet.png"}
                alt={nombre}
                className="w-full h-full object-cover"
                draggable="false"
              />
            </div>

            {/* Nombre en mobile debajo de la foto */}
            <div className="mt-4 text-center md:hidden">
              <h2 className="text-2xl font-extrabold text-[#22687b]">
                {capitalizeAll(nombre)}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Editá la info y los informes de tu mascota
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="w-full">
            {/* Header desktop */}
            <div className="hidden md:block">
              <AppH1 className="estilosH1">{capitalizeAll(nombre)}</AppH1>
              <p className="text-sm text-gray-500 mt-1">
                Editá la información y gestioná los informes de tu mascota.
              </p>
            </div>

            {/* “Cajitas” de datos */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard label="Especie" value={especie} />
              <InfoCard label="Raza" value={raza} />
              <InfoCard label="Fecha de nacimiento" value={fecha_nacimiento} />
              <InfoCard label="Sexo" value={sexo} />
              <InfoCard label="Color" value={color} />
              <InfoCard label="Estado de salud" value={estado_salud} />
              <InfoCard label="Peso" value={peso ? `${peso} kg` : "—"} />

              <InfoCard
                label="Ubicación dueño"
                value={ownerLocationText}
                className="sm:col-span-2"
              />

              <InfoCard
                label="Última ubicación"
                value={lastLocationText}
                className="sm:col-span-2"
              />
            </div>

            {/* Acciones */}
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full inline-flex justify-center items-center rounded-[10px]
                             bg-white text-[#22687B] px-6 py-3 font-semibold
                             border border-[#22687B] transition
                             hover:bg-[#22687B]/5 active:bg-[#22687B]/10"
                >
                  Editar informes
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className={`w-full inline-flex justify-center items-center rounded-[10px]
                              px-6 py-3 font-extrabold transition
                    ${
                      confirmDelete
                        ? "bg-red-600 text-white hover:brightness-110 active:brightness-95"
                        : "bg-[#22687b] text-white hover:brightness-110 active:brightness-95"
                    }`}
                >
                  {confirmDelete ? "Confirmar borrar" : "Borrar mascota"}
                </button>
              </div>

              {/* Mensaje */}
              {confirmDelete && (
                <p className="text-xs sm:text-sm text-center text-red-700 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  Tocá otra vez para confirmar. Esta acción no se puede deshacer.
                </p>
              )}

              {deleteMessage && (
                <p
                  className={`text-center text-sm font-semibold rounded-2xl px-4 py-3 border
                    ${
                      deleteStatus === "success"
                        ? "text-green-700 bg-green-50 border-green-200"
                        : "text-red-700 bg-red-50 border-red-200"
                    }`}
                >
                  {deleteMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <EditPetModal
            pet={selectedPet}
            onClose={() => setIsModalOpen(false)}
            onSave={async (updatedPet) => {
              await refreshPets?.();
              onPetUpdated?.(updatedPet);
            }}
          />
        )}
      </div>
    </section>
  );
}

function InfoCard({ label, value, className = "" }) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-gray-50/60 p-4 ${className}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-800 break-words">
        {value || "—"}
      </p>
    </div>
  );
}