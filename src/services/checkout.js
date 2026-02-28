import { supabase } from "./supabase";

export async function startDemoCheckout(membershipCode) {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;

  const userId = authData.user?.id;
  if (!userId) throw new Error("Usuario no autenticado.");

  const externalId = `demo_${Date.now()}`;

  const { data: sub, error: subErr } = await supabase
    .from("suscripciones")
    .insert({
      user_id: userId,
      membresia_codigo: membershipCode,
      estado: "pendiente",
      proveedor: "demo",
      external_id: externalId,
    })
    .select("id")
    .single();

  if (subErr) throw subErr;

  return sub.id;
}

export async function confirmDemoCheckout(subscriptionId, membershipCode) {
  // 1) activar suscripción
  const { error: upSubErr } = await supabase
    .from("suscripciones")
    .update({ estado: "activa" })
    .eq("id", subscriptionId);

  if (upSubErr) throw upSubErr;

  // 2) actualizar plan del usuario
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;

  const userId = authData.user?.id;
  if (!userId) throw new Error("Usuario no autenticado.");

  const { error: upUserErr } = await supabase
    .from("usuarios")
    .update({ membresia_codigo: membershipCode })
    .eq("id", userId);

  if (upUserErr) throw upUserErr;
}

export async function getMembershipByCode(code) {
  const { data, error } = await supabase
    .from("membresias")
    .select("codigo, titulo, precio_label, beneficios, activa, precio_mensual")
    .eq("codigo", code)
    .eq("activa", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}