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
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!selectedPet)
    return (
      <div className="flex justify-center items-center py-10">
        <h2 className="text-3xl font-black text-[#22687b] text-center">
          Todavía no has agregado una mascota
        </h2>
      </div>
    );

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
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      const { error } = await supabase.from("mascotas").delete().eq("id", id);
      if (error) throw error;

      setDeleteMessage("Mascota borrada correctamente");

      await refreshPets?.();
      onPetDeleted?.(); // notifica al padre
    } catch (err) {
      console.error(err);
      setDeleteMessage("error al borrar la mascota");
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 justify-center items-center w-full mb-10 bg-[#f5f5f5]/60 rounded-3xl p-10 shadow-sm">

      <div className="bg-gray-200 w-72 h-80 rounded-2xl overflow-hidden shadow-md">
        <img
          src={foto_url || "/default-pet.png"}
          alt={nombre}
          className="object-cover w-full h-full"
        />
      </div>

 
      <div className="flex flex-col gap-4 max-w-2xl w-full">
        <AppH1 className="estilosH1">{capitalizeAll(nombre)}</AppH1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-gray-800">
          <Info label="Especie" value={especie} />
          <Info label="Raza" value={raza} />
          <Info label="Fecha de nacimiento" value={fecha_nacimiento} />
          <Info label="Sexo" value={sexo} />
          <Info label="Color" value={color} />
          <Info label="Estado de salud" value={estado_salud} />
          <Info label="Peso" value={`${peso} kg`} />
          <Info
            label="Ubicación dueño"
            value={`${capitalizeAll(
              userDireccion
            )}, ${userCodigoPostal}, ${userProvincia}`}
          />
          <Info
            label="Última ubicación"
            value={`${capitalizeAll(direccion)}, ${codigoPostal}, ${provincia}`}
          />
        </div>

      
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-4">
         
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btnTransparente w-full"
            >
              Editar informes
            </button>

       
            <button
              type="button"
              onClick={handleDelete}
              className={`w-full font-bold py-2 rounded-xl transition ${
                confirmDelete
                  ? "bg-red-600 text-white"
                  : "bg-[#22687b] text-white hover:bg-[#1a5361] cursor-pointer"
              }`}
            >
              {confirmDelete ? "Confirmar Borrar" : "Borrar Mascota"}
            </button>

       
            <button type="button" className="btnNaranja w-full">
              Informe Chip
            </button>
          </div>

          {deleteMessage && (
            <p
              className={`mt-2 text-center text-sm font-medium ${
                deleteMessage.includes("✅") ? "text-green-600" : "text-red-500"
              }`}
            >
              {deleteMessage}
            </p>
          )}
        </div>
      </div>

    
      {isModalOpen && (
        <EditPetModal
          pet={selectedPet}
          onClose={() => setIsModalOpen(false)}
          onSave={async (updatedPet) => {
            await refreshPets();
            onPetUpdated(updatedPet);
          }}
        />
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <p>
      <strong className="text-[#22687b] font-semibold">{label}:</strong>{" "}
      <span className="text-gray-700">{value || "—"}</span>
    </p>
  );
}
