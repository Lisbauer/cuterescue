import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../context/AuthContext";

export default function AdminProtection({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_roles")
        .select("user_id, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error verificando admin:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }

      setChecking(false);
    }

    checkAdmin();
  }, [user]);

  if (authLoading || checking) {
    return <div className="p-6">Verificando acceso...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}