import { supabase } from "./supabase";

export async function getEvents() {
  // Trae eventos activos
  const { data: eventos, error } = await supabase
    .from("eventos")
    .select("id, title, summary, details, access, requirements, free, notes, source_url, imagen_url")
    .eq("activa", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!eventos || eventos.length === 0) return [];

  // Trae ubicaciones de esos eventos
  const ids = eventos.map((e) => e.id);

  const { data: locs, error: locErr } = await supabase
    .from("eventos_ubicaciones")
    .select("evento_id, name, address")
    .in("evento_id", ids)
    .order("id", { ascending: true });

  if (locErr) throw locErr;

  const locsByEvent = new Map();
  (locs ?? []).forEach((l) => {
    if (!locsByEvent.has(l.evento_id)) locsByEvent.set(l.evento_id, []);
    locsByEvent.get(l.evento_id).push({ name: l.name, address: l.address });
  });

  return eventos.map((e) => ({
    ...e,
    locations: locsByEvent.get(e.id) ?? [],
  }));
}