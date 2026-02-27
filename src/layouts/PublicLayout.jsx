import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ModalAlert from "../components/modals/ModalAlert";
import { Outlet, useLocation } from "react-router-dom";
import { useSavedData } from "../context/SavedDataContext";

/* componente que utilizamos en toda la pagina para mostrar globalmente el alerta de la alscota en modo emergencia */ 

export default function PublicLayout() {
  const { showAlert, alert, closeAlert, alertOn } = useSavedData();
  const location = useLocation();

  const showModalOnRoute = location.pathname !== "/maps";

  return (
    <>
      <Navbar />

      <ModalAlert show={showAlert} alert={alert} onClose={closeAlert} />

      {alertOn && showModalOnRoute && (
        <ModalAlert
          show
          alert={{
            color: "#F7612A",
            title: "Tu mascota está actualmente en modo emergencia",
            message: "Podrás ver sus movimientos en tiempo real.",
            button: "Ir al mapa",
            redirect: "/maps",
          }}
          onClose={() => {}}
        />
      )}

      <Outlet />

      <Footer />
    </>
  );
}
