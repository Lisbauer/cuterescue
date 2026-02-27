import { supabase } from "../../services/supabase";

function startOfTodayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
}

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export async function getAdminStats() {
  const todayISO = startOfTodayISO();
  const last7DaysISO = daysAgoISO(7);

  const [totalUsuariosRes, nuevosHoyRes, locRes] = await Promise.all([
    supabase.from("usuarios").select("*", { count: "exact", head: true }),

    supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO),

    supabase
      .from("localizacion")
      .select("mascota_id")
      .gte("updated_at", last7DaysISO),
  ]);

  const error = totalUsuariosRes.error || nuevosHoyRes.error || locRes.error;
  if (error) throw error;

  const mascotasActivas = new Set((locRes.data ?? []).map((r) => r.mascota_id)).size;

  return {
    totalUsuarios: totalUsuariosRes.count ?? 0,
    nuevosUsuariosHoy: nuevosHoyRes.count ?? 0,
    mascotasActivas: mascotasActivas ?? 0,
  };
}

export async function getMembershipStats() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("membresia_codigo");

  if (error) throw error;

  const stats = {
    freemium: 0,
    premium: 0,
    plus: 0,
  };

  (data ?? []).forEach((u) => {
    const code = (u.membresia_codigo || "freemium").toLowerCase();
    if (stats[code] !== undefined) {
      stats[code]++;
    }
  });

  return stats;
}