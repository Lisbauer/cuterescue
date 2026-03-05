import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PetCards from "../components/ui/PetsCard";
import DetailsInform from "../components/DetailsInform";
import usePets from "../hooks/usePets";
import { supabase } from "../services/supabase";
import LoadingScreen from "../components/ui/LoadingScreen";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [userData, setUserData] = useState(null);

  const {
    mascotas,
    ubicacionUsuario,
    selectedPet,
    setSelectedPet,
  } = usePets();

  // proteccion de ruta
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  //  datos del usuario
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) {
        setUserData(data);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading || !userData) {
    return <p className="text-center mt-10">Cargando perfil...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-5">
      {/* info del usuario */}
      <section>
        <DetailsInform details={userData} ubicacion={ubicacionUsuario} />
      </section>

      <div className="bg-gray-300/50 w-full h-px my-10" />

      {/* mascotas */}
      <section>
        <PetCards
          pets={mascotas}
          selectedPet={selectedPet}
          setSelectedPet={setSelectedPet}
        />
      </section>
    </div>
  );
}
