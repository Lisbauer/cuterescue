import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/ui/LoadingScreen";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // mientras el contexto resuelve el usuario
  if (loading) {
    return <p className="text-center mt-10"><LoadingScreen/></p>;
  }

  // si no hay usuario → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // usuario autenticado
  return children;
}
