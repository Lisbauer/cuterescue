import { supabase } from "../../services/supabase";

export async function adminGetMemberships() {
  const { data, error } = await supabase
    .from("membresias")
    .select("*")
    .order("precio_mensual", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateMembership(id, payload) {
  const { error } = await supabase
    .from("membresias")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}