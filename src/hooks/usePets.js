import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useSavedData } from "../context/SavedDataContext";
import { useAuth } from "../context/AuthContext";

// modificacion: nombre de variables de m y l por pet y loc

export default function usePets() {
  const { user } = useAuth();
  const { selectedPet, setSelectedPet } = useSavedData();

  const [mascotas, setMascotas] = useState([]);
  const [location, setLocation] = useState(null);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);

  //  carga inicial de mascotas y la ubicacion del usuario
  const refreshPets = async () => {
    if (!user) {
      setMascotas([]);
      setLocation(null);
      setUbicacionUsuario(null);
      setSelectedPet(null);
      return;
    }

    //  Mascotas 
    const { data: mascotasData, error: petsError } = await supabase
      .from("mascotas")
      .select("*")
      .eq("owner_id", user.id);

    if (petsError) {
      console.error("Error cargando mascotas:", petsError);
      setMascotas([]);
      return;
    }

    let mascotasConUbicacion = [];

    // localizaciones de mascotas
    if (mascotasData && mascotasData.length > 0) {
      const { data: localizacionesData, error: locError } = await supabase
        .from("localizacion")
        .select("*")
        .in(
          "mascota_id",
          mascotasData.map((pet) => pet.id)
        );

      if (locError) {
        console.error("Error cargando localizaciones:", locError);
      }

      mascotasConUbicacion = mascotasData.map((pet) => {
        const locationRow = localizacionesData?.find(
          (loc) => loc.mascota_id === pet.id
        );

        return {
          ...pet,
          localizacion: locationRow || null,
        };
      });
    }

    setMascotas(mascotasConUbicacion);

    // ubic del usuario
    const { data: ubicacionData, error: ubicError } = await supabase
      .from("localizacion_usuario")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (ubicError) {
      console.error("Error cargando localizacion_usuario:", ubicError);
    }

    setUbicacionUsuario(ubicacionData || null);

    // manejo de mascota seleccionada + mapa
    if (mascotasConUbicacion.length === 0) {
      setLocation(null);
      setSelectedPet(null);
      return;
    }

    // si no hay mascota seleccionada selecciona la primera
    if (!selectedPet) {
      const firstPet = mascotasConUbicacion[0];
      setSelectedPet(firstPet);
      setLocation(firstPet.localizacion || null);
      return;
    }

    // si habia mascota seleccionada se mantiene seleccionada
    const selectedPetStillExists = mascotasConUbicacion.find(
      (pet) => pet.id === selectedPet.id
    );

    if (selectedPetStillExists) {
      setLocation(selectedPetStillExists.localizacion || null);
    } else {
      // la mascota seleccionada ya no existe
      setSelectedPet(null);
      setLocation(null);
    }
  };

  useEffect(() => {
    refreshPets();
  }, [user]);

  //  seleccionar mascota desde la UI
  const handleSelectPet = async (pet) => {
    if (!pet) return;

    setSelectedPet(pet);

    const { data, error } = await supabase
      .from("localizacion")
      .select("*")
      .eq("mascota_id", pet.id)
      .maybeSingle();

    if (error) {
      console.error("Error obteniendo localizacion de mascota:", error);
    }

    setLocation(data || null);
  };

  //  eliminar mascota
  const handleDeletePet = async (pet) => {
    const { error } = await supabase
      .from("mascotas")
      .delete()
      .eq("id", pet.id);

    if (!error) {
      setMascotas((prev) =>
        prev.filter((existingPet) => existingPet.id !== pet.id)
      );
      setSelectedPet(null);
      setLocation(null);
    }
  };

  //  agregar o actualizar mascota
  const handleSavePet = async (pet, file) => {
    if (!user) return;

    let fotoUrl = pet.foto_url || "";

    if (file) {
      const fileName = `${user.id}_${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("mascotas")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("mascotas")
        .getPublicUrl(fileName);

      fotoUrl = publicUrl.publicUrl;
    }

    if (pet.id) {
      // actualizar
      const { error } = await supabase
        .from("mascotas")
        .update({ ...pet, foto_url: fotoUrl })
        .eq("id", pet.id);

      if (error) {
        console.error("Error actualizando mascota:", error);
        return;
      }
    } else {
      //  crear
      const { data: inserted, error } = await supabase
        .from("mascotas")
        .insert([{ ...pet, owner_id: user.id, foto_url: fotoUrl }])
        .select()
        .single();

      if (error) {
        console.error("Error insertando mascota:", error);
        return;
      }

      setSelectedPet(inserted);
    }

    await refreshPets();
  };

  return {
    mascotas,
    location,
    ubicacionUsuario,
    selectedPet,
    setSelectedPet: handleSelectPet,
    handleDeletePet,
    handleSavePet,
    refreshPets,
  };
}
