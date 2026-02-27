import "./fonts.css";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import PrivateRoute from "./router/PrivateRoute";
import AdminProtection from "./admin/components/AdminProtection";

// paginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Vets from "./pages/Vets";
import Documentation from "./pages/Documentation";
import UserProfile from "./pages/UserProfile";
import Events from "./pages/Events";
import Maps from "./pages/Maps";
import DataPet from "./pages/DataPet";
import Planes from "./pages/Plans";

// admin
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminVets from "./admin/pages/AdminVetsList";
import AdminVetCreate from "./admin/pages/actions/AdminVetCreate";
import AdminVetEdit from "./admin/pages/actions/AdminVetEdit";
import AdminEventsList from "./admin/pages/AdminEventsList";
import AdminEventCreate from "./admin/pages/actions/AdminEventCreate";
import AdminEventEdit from "./admin/pages/actions/AdminEventEdit";
import AdminMembershipsList from "./admin/pages/AdminMembershipsList";
import AdminMembershipEdit from "./admin/pages/actions/AdminMembershipEdit";
import AdminUsersList from "./admin/pages/AdminUsersList";
import AdminUserDetails from "./admin/pages/AdminUserDetails";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Register />} />
        <Route path="/eventos" element={<Events />} />

        {/* protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/veterinarias-24-hrs"
          element={
            <PrivateRoute>
              <Vets />
            </PrivateRoute>
          }
        />

        <Route
          path="/documentacion"
          element={
            <PrivateRoute>
              <Documentation />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/detalles"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/maps"
          element={
            <PrivateRoute>
              <Maps />
            </PrivateRoute>
          }
        />

        <Route
          path="/informe"
          element={
            <PrivateRoute>
              <DataPet />
            </PrivateRoute>
          }
        />

        <Route
          path="/planes"
          element={
            <PrivateRoute>
              <Planes />
            </PrivateRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminProtection>
              <AdminLayout />
            </AdminProtection>
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
          <Route path="veterinarias" element={<AdminVets />} />
  <Route path="veterinarias/nueva" element={<AdminVetCreate />} />
  <Route path="veterinarias/:id/editar" element={<AdminVetEdit />} />

    <Route path="eventos" element={<AdminEventsList />} />
  <Route path="eventos/nuevo" element={<AdminEventCreate />} />
  <Route path="eventos/:id/editar" element={<AdminEventEdit />} />
  <Route path="membresias" element={<AdminMembershipsList />} />
<Route path="membresias/:id/editar" element={<AdminMembershipEdit />} />
<Route path="usuarios" element={<AdminUsersList />} />
<Route path="usuarios/:id" element={<AdminUserDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
