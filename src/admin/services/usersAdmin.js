import { supabase } from "../../services/supabase";


export async function adminGetUsers() {
  const { data: users, error: usersError } = await supabase
    .from("usuarios")
    .select("id, nombre, apellido, email, documento, telefono, created_at, membresia_codigo")
    .order("created_at", { ascending: false });

  if (usersError) throw usersError;

  const { data: pets, error: petsError } = await supabase
    .from("mascotas")
    .select("id, owner_id");

  if (petsError) throw petsError;

  const petsCountByOwner = new Map();
  (pets ?? []).forEach((p) => {
    petsCountByOwner.set(p.owner_id, (petsCountByOwner.get(p.owner_id) ?? 0) + 1);
  });

  return (users ?? []).map((u) => ({
    ...u,
    petsCount: petsCountByOwner.get(u.id) ?? 0,
  }));
}

export async function adminGetUserById(id) {
  const { data: user, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  const { data: pets, error: petsError } = await supabase
    .from("mascotas")
    .select("id, nombre, especie, raza, sexo, estado_salud, created_at")
    .eq("owner_id", id)
    .order("created_at", { ascending: false });

  if (petsError) throw petsError;

  return { user, pets: pets ?? [] };
}

export async function adminUpdateUser(id, payload) {
  const { error } = await supabase.from("usuarios").update(payload).eq("id", id);
  if (error) throw error;
}

export async function adminGetMembershipOptions() {
  const { data, error } = await supabase
    .from("membresias")
    .select("codigo, titulo")
    .eq("activa", true)
    .order("precio_mensual", { ascending: true });

  if (error) throw error;
  return data ?? [];
}