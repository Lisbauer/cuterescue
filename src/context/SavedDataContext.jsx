import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { supabase } from "../services/supabase";
import {
  getSelectedPetService,
  setSelectedPet as setSelectedPetService,
  subscribeSelectedPet,
} from "../services/SelectedPet";

const SavedDataContext = createContext();
/**
 * un contexto global de datos con relacion a:
-mascota seleccionada / selectedpet
-ubicación en tiempo real 
-manejo de alertas y modales
-manejo de simulacion GPS
 */

export function SavedDataProvider({ children }) {
  const [location, setLocation] =
    useState(null); //guarda la ultim ubic de la mascota 
  const [selectedPet, setSelectedPetState] =
    useState(null); // mascota seleccionada 

  const [alert, setAlert] = useState(null);
  const [showAlert, setShowAlert] =
    useState(false); //  controla si el modal de alerta se muestra 
  const [alertOn, setAlertOn] =
    useState(
      false
    ); //indica si el modo alerta (la ui en naranjha) esta activa

  const simStopRef = useRef(null);

  //  si la simulacion esta corriendo 
  const [simulationRunning, setSimulationRunning] = useState(false);

  const realtimeChannelRef = useRef(null);

  // cargar mascota seleccionada
  useEffect(() => {
    const saved = getSelectedPetService();
    if (saved) setSelectedPetState(saved);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeSelectedPet(setSelectedPetState);
    return unsubscribe;
  }, []);

  const MASCOTA_ID = selectedPet?.id ?? null;

  // obtener ubicacion inicial
  useEffect(() => {
    if (!MASCOTA_ID) return;

    async function loadLocation() {
      const { data } = await supabase
        .from("localizacion")
        .select("*")
        .eq("mascota_id", MASCOTA_ID)
        .single();

      if (data) setLocation(data);
    }
    loadLocation();
  }, [MASCOTA_ID]);

  //  realtime
  useEffect(() => {
    if (!selectedPet) return;

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`realtime-location-${selectedPet.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "localizacion",
          filter: `mascota_id=eq.${selectedPet.id}`,
        },
        (payload) => {
          console.log("Nueva ubicación:", payload.new);

          if (simulationRunning) {
            setLocation(payload.new);
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => supabase.removeChannel(channel);
  }, [selectedPet, simulationRunning]);

  const setSelectedPet = (pet) => {
    setSelectedPetState(pet);
    setSelectedPetService(pet);
  };

  // Cuando entra una alerta se inicia UI
  useEffect(() => {
    if (alert) {
      setShowAlert(true);
      setAlertOn(true);
    }
  }, [alert]);

  const closeAlert = () => setShowAlert(false);

  //  detiene la simulacion
  const stopSimulation = () => {
    console.log("simulacion en stop");

    setSimulationRunning(false);
    setAlertOn(false);
    setShowAlert(false);

    //  detener intervalo real
    if (simStopRef.current) {
      simStopRef.current();
      simStopRef.current = null;
    }

    //  cortar realtime
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
  };

  return (
    <SavedDataContext.Provider
      value={{
        location,
        selectedPet,
        setSelectedPet,
        showAlert,
        closeAlert,
        setAlert,
        alertOn,
        setAlertOn,
        alert,

        // estado simulación
        simulationRunning,
        setSimulationRunning,

        // manejar intervalos
        simStopRef,

        // detener simulación completa
        stopSimulation,
      }}
    >
      {children}
    </SavedDataContext.Provider>
  );
}

export function useSavedData() {
  return useContext(SavedDataContext);
}
