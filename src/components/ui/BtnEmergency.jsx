import { startRealTimeSimulation } from "../../services/MovimentPet.js";
import { useSavedData } from "../../context/SavedDataContext";

export default function BtnEmergency() {
  const { selectedPet, location, setAlert, simStopRef, setSimulationRunning } =
    useSavedData();

  async function handleClick() {
    if (!selectedPet || !location) return;

    console.log("Emergencia activada:", selectedPet.id);

    setAlert({ variant: "activate" });

    const stopFn = await startRealTimeSimulation(
      selectedPet,
      location,
      "emergency",
      null
    );

    // guardo stopFn en contexto
    simStopRef.current = stopFn;
    setSimulationRunning(true);
  }

  return (
    <button
      onClick={handleClick}
      className="btnNaranja px-8"
    >
      Emergencias
    </button>
  );
}
