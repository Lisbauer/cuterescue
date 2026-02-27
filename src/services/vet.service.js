import { supabase } from "./supabase";

export async function getVeterinarias24() {
  const { data, error } = await supabase
    .from("veterinarias_24hs")
    .select("id, nombre, direccion, telefono, lat, lng, link, imagen_url")
    .eq("activa", true)
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data ?? [];
}