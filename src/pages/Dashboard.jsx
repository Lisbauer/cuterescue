import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedData } from "../context/SavedDataContext";
import usePets from "../hooks/usePets";
import PersonalInform from "../components/PersonalData";
import Maps from "../components/maps/Maps";
import MapsViewer from "../components/maps/MapsViewer";
import PetCards from "../components/ui/PetsCard";
import BtnPetMove from "../components/ui/BtnPetMove";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { selectedPet, setSelectedPet, location } = useSavedData();
  const { mascotas, ubicacionUsuario, refreshPets } = usePets();

  const [userData, setUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // cargar perfil del usuario
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error cargando perfil:", error);
      }

      setUserData(data);
      setProfileLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, navigate]);

  const handlePetAdded = (newPet) => {
    refreshPets();
    if (newPet) setSelectedPet(newPet);
  };



  return (
    <div className="w-full px-4 lg:px-0 max-w-7xl mx-auto mt-5">
      <section className="flex flex-col lg:flex-row gap-10 lg:gap-20 justify-between mb-10 w-full">
        <PersonalInform details={userData} locations={ubicacionUsuario} />

        <div className="flex flex-col gap-2 w-full lg:w-1/2">
          <MapsViewer selectedPet={selectedPet} location={location} />
          <BtnPetMove pet={selectedPet} userLocation={location} />
        </div>
      </section>

      <div className="bg-gray-300/50 w-full h-px my-10" />

      <section className="flex flex-col lg:flex-row gap-10 lg:gap-20 mb-10 w-full justify-center items-center">
        <PetCards
          pets={mascotas}
          selectedPet={selectedPet}
          setSelectedPet={setSelectedPet}
          onPetAdded={handlePetAdded}
          refreshPets={refreshPets}
        />

        <div className="w-full lg:w-auto">
          <Maps selectedPet={selectedPet} location={location} />
        </div>
      </section>
    </div>
  );
}
