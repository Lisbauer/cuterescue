import "./fonts.css";
import Navbar from "./components/navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FormDelTitular from "./pages/FormTitular";
import FormDeMascota from "./pages/FormMascota";
import FormRegistroConfirmacion from "./pages/Confirmacion";
import FormLogin from "./pages/FormLogin";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/formulario-titular" element={<FormDelTitular />} />
        <Route path="/formulario-mascota" element={<FormDeMascota />} />
        <Route
          path="/formulario-registro-confirmacion"
          element={<FormRegistroConfirmacion />}
        />
        <Route path="/formulario-de-ingreso" element={<FormLogin />} />
      </Routes>
    </>
  );
}

export default App;
