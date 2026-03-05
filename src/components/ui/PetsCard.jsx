import React from "react";
import AddPets from "../modals/AddPets";
import PetStatus from "./PetStatus";

export default function PetsCard({
  pets = [],
  selectedPet,
  setSelectedPet,
  onPetAdded,
}) {
  return (
<div
  className="
    w-full h-full max-w-3xl
    flex flex-row gap-10
    overflow-x-auto overflow-y-visible
    py-6 px-4
    items-center
  "
>
      {pets && pets.length > 0 ? (
        <>
          {pets.map((pet) => {
            const { nombre, localizacion, foto_url } = pet;
            const direccion = localizacion?.direccion || "Ubicación no disponible";
            const isSelected = selectedPet?.id === pet.id;

            return (
              <article
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className={`
                  relative
                  bg-[#22687b] w-[256px] h-[420px] flex-shrink-0
                  rounded-2xl p-5 flex flex-col cursor-pointer
                  transition duration-300 ease-in-out
                  ${isSelected ? "scale-[1.04]" : "hover:scale-[1.03]"}
                  ${
                    isSelected
                      ? "ring-4 ring-[#71dd5b]/70 ring-offset-4 ring-offset-white shadow-lg"
                      : "shadow-sm"
                  }
                `}
              >
                <div className="w-full h-60 mb-5 bg-gray-50 rounded-xl overflow-hidden">
                  <img
                    src={foto_url || "https://via.placeholder.com/256x208?text=Mascota"}
                    alt={nombre}
                    className="w-full h-full object-cover"
                    draggable="false"
                  />
                </div>

                <div className="text-white flex flex-col justify-center">
                  <h3 className="text-lg font-semibold">{nombre}</h3>

                  {/* <span className="mt-1">
                    <strong className="text-orange-300">Status: </strong>
                    <PetStatus activo={pet.activo} />
                  </span> */}

                  <strong className="text-orange-300 mt-3">Ubicación:</strong>
                  <span className="h-[70px] leading-snug">{direccion}</span>
                </div>
              </article>
            );
          })}

          <AddPets onPetAdded={onPetAdded} />
        </>
      ) : (
        <AddPets onPetAdded={onPetAdded} />
      )}
    </div>
  );
}