import { supabase } from "../../services/supabase";

export async function adminGetVets() {
  const { data, error } = await supabase
    .from("veterinarias_24hs")
    .select("id, nombre, direccion, telefono, link, lat, lng, imagen_url, activa, updated_at, created_at")
    .order("activa", { ascending: false })
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function adminGetVetById(id) {
  const { data, error } = await supabase
    .from("veterinarias_24hs")
    .select("id, nombre, direccion, telefono, link, lat, lng, imagen_url, activa")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data; // puede ser null si no existe
}

export async function adminCreateVet(payload) {
  const { data, error } = await supabase
    .from("veterinarias_24hs")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function adminUpdateVet(id, payload) {
  const { error } = await supabase
    .from("veterinarias_24hs")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

export async function adminToggleVetActive(id, activa) {
  const { error } = await supabase
    .from("veterinarias_24hs")
    .update({ activa: !activa })
    .eq("id", id);

  if (error) throw error;
}