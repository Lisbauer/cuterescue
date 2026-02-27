import { supabase } from "./supabase";

export async function getMemberships() {
  const { data, error } = await supabase
    .from("membresias")
    .select("codigo, titulo, precio_label, texto_boton, destacado, tema, beneficios")
    .eq("activa", true)
    .order("precio_mensual", { ascending: true });

  if (error) throw error;
  return data ?? [];
}