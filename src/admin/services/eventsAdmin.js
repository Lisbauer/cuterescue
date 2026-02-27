import { supabase } from "../../services/supabase";

export async function adminGetEvents() {
  const { data, error } = await supabase
    .from("eventos")
    .select("id, title, summary, activa, created_at, updated_at")
    .order("activa", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function adminGetEventById(id) {
  const { data: event, error } = await supabase
    .from("eventos")
    .select(
      "id, title, summary, details, access, requirements, free, notes, source_url, imagen_url, activa"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  const { data: locations, error: locErr } = await supabase
    .from("eventos_ubicaciones")
    .select("id, name, address")
    .eq("evento_id", id)
    .order("id", { ascending: true });

  if (locErr) throw locErr;

  return { event, locations: locations ?? [] };
}

export async function adminCreateEvent(payload, locations) {
  const { error: evErr } = await supabase.from("eventos").insert(payload);
  if (evErr) throw evErr;

  if (locations?.length) {
    const rows = locations.map((l) => ({
      evento_id: payload.id,
      name: l.name,
      address: l.address,
    }));

    const { error: locErr } = await supabase
      .from("eventos_ubicaciones")
      .insert(rows);

    if (locErr) throw locErr;
  }
}

export async function adminUpdateEvent(id, payload, locations) {
  const { error: evErr } = await supabase.from("eventos").update(payload).eq("id", id);
  if (evErr) throw evErr;

  
  const { error: delErr } = await supabase
    .from("eventos_ubicaciones")
    .delete()
    .eq("evento_id", id);

  if (delErr) throw delErr;

  if (locations?.length) {
    const rows = locations.map((l) => ({
      evento_id: id,
      name: l.name,
      address: l.address,
    }));

    const { error: locErr } = await supabase
      .from("eventos_ubicaciones")
      .insert(rows);

    if (locErr) throw locErr;
  }
}

export async function adminToggleEventActive(id, isActive) {
  const { error } = await supabase
    .from("eventos")
    .update({ activa: !isActive })
    .eq("id", id);

  if (error) throw error;
}