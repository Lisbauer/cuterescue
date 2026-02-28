import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import ModalDocumentacion from "../components/ModalDocumentation";
import AppH1 from "../components/ui/AppH1";
import { useAuth } from "../context/AuthContext";

export default function Documentation() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [selectedMascota, setSelectedMascota] = useState(null);

  const [vacunas, setVacunas] = useState([]);
  const [pipetas, setPipetas] = useState([]);
  const [desparasitaciones, setDesparasitaciones] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoModal, setTipoModal] = useState("");
  const [editData, setEditData] = useState(null);

  // plan + limite docs (por mascota)
  const [planCode, setPlanCode] = useState("freemium");
  const [maxDocs, setMaxDocs] = useState(null); // null = infinito
  const [docsCount, setDocsCount] = useState(0);
  const [checkingDocLimit, setCheckingDocLimit] = useState(true);

  const canAddDoc = useMemo(() => {
    if (!selectedMascota) return false; // sin mascota, no agrego nada
    if (maxDocs === null) return true;
    return (docsCount ?? 0) < (maxDocs ?? 0);
  }, [docsCount, maxDocs, selectedMascota]);

  // Mascotas del usuario
  useEffect(() => {
    if (!user) return;

    async function fetchMascotas() {
      const { data, error } = await supabase
        .from("mascotas")
        .select("*")
        .eq("owner_id", user.id);

      if (error) {
        console.error("Error cargando mascotas:", error);
        return;
      }

      setMascotas(data || []);
      setSelectedMascota(null);
      setVacunas([]);
      setPipetas([]);
      setDesparasitaciones([]);
    }

    fetchMascotas();
  }, [user]);

  // Genera notifs si está por vencer (queda igual, solo lo ordené un poco)
  const generateNotifications = async (items, mascota, userId) => {
    if (!userId || !mascota) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of items) {
      if (!item.fecha_vencimiento) continue;

      const fechaVenc = new Date(item.fecha_vencimiento);
      fechaVenc.setHours(0, 0, 0, 0);

      const diffDays = (fechaVenc - today) / (1000 * 60 * 60 * 24);
      const diasPrevios = [7, 1, 0];
      if (!diasPrevios.includes(diffDays)) continue;

      const tratamiento =
        item.tipo === "vacuna"
          ? item.tipo_vacuna
          : item.tipo === "pipeta"
          ? item.producto
          : item.antiparasitario;

      const nombreMascota = mascota.nombre || "tu mascota";

      const mensaje =
        diffDays === 0
          ? `¡Hoy vence ${tratamiento} de ${nombreMascota}!`
          : `Falta ${diffDays} día para que venza ${tratamiento} de ${nombreMascota}`;

      const { data: existing, error } = await supabase
        .from("notificaciones")
        .select("id")
        .eq("documentacion_id", item.id)
        .eq("user_id", userId)
        .eq("mensaje", mensaje)
        .limit(1);

      if (error) {
        console.error("Error buscando notificaciones:", error);
        continue;
      }

      if (!existing || existing.length === 0) {
        await supabase.from("notificaciones").insert([
          {
            user_id: userId,
            documentacion_id: item.id,
            mensaje,
            fecha_alerta: today,
            vista: false,
          },
        ]);
      }
    }
  };

  // Trae documentación de una mascota (para render)
  const fetchDocumentation = async (mascota) => {
    if (!user || !mascota?.id) return;

    const { data, error } = await supabase
      .from("documentacion")
      .select("*")
      .eq("user_id", user.id)
      .eq("mascota_id", mascota.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando documentación:", error);
      return;
    }

    const vacunasData = (data || []).filter((d) => d.tipo === "vacuna");
    const pipetasData = (data || []).filter((d) => d.tipo === "pipeta");
    const desparasitacionesData = (data || []).filter(
      (d) => d.tipo === "desparasitacion"
    );

    setVacunas(vacunasData);
    setPipetas(pipetasData);
    setDesparasitaciones(desparasitacionesData);

    await generateNotifications(
      [...vacunasData, ...pipetasData, ...desparasitacionesData],
      mascota,
      user.id
    );
  };

  const handleSelectPet = async (e) => {
    const mascotaId = e.target.value;

    if (!mascotaId) {
      setSelectedMascota(null);
      setVacunas([]);
      setPipetas([]);
      setDesparasitaciones([]);
      return;
    }

    const mascota = mascotas.find((m) => m.id.toString() === mascotaId);
    setSelectedMascota(mascota);
    await fetchDocumentation(mascota);
  };

  // Cuenta docs POR MASCOTA + saca limite por plan
  useEffect(() => {
    async function checkDocLimit() {
      try {
        setCheckingDocLimit(true);

        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;

        const authUid = authData?.user?.id;
        if (!authUid) return;

        // plan del usuario
        const { data: userRow, error: userErr } = await supabase
          .from("usuarios")
          .select("membresia_codigo")
          .eq("id", authUid)
          .maybeSingle();

        if (userErr) throw userErr;

        const code = String(userRow?.membresia_codigo || "freemium")
          .trim()
          .toLowerCase();

        setPlanCode(code);

        // limite del plan
        const { data: membershipRow, error: memErr } = await supabase
          .from("membresias")
          .select("slots_documentacion")
          .eq("codigo", code)
          .maybeSingle();

        if (memErr) throw memErr;

        if (!membershipRow) {
          const fallback = code === "premium" ? 8 : code === "plus" ? null : 3;
          setMaxDocs(fallback);
        } else {
          const rawMax = membershipRow.slots_documentacion;
          const parsedMax =
            rawMax === null || rawMax === undefined ? null : Number(rawMax);

          setMaxDocs(Number.isFinite(parsedMax) ? parsedMax : null);
        }

        // docs por mascota (si no hay mascota seleccionada, no muestro nada)
        if (!selectedMascota?.id) {
          setDocsCount(0);
          return;
        }

        const { data: docsRows, error: docsErr } = await supabase
          .from("documentacion")
          .select("id")
          .eq("user_id", authUid)
          .eq("mascota_id", selectedMascota.id);

        if (docsErr) throw docsErr;
        setDocsCount(docsRows?.length ?? 0);
      } catch (err) {
        console.error("checkDocLimit error:", err?.message || err);
        setPlanCode("freemium");
        setMaxDocs(3);
        setDocsCount(0);
      } finally {
        setCheckingDocLimit(false);
      }
    }

    checkDocLimit();
  }, [user?.id, selectedMascota?.id]);

  // Chequea duplicados (por mascota)
  async function isDuplicate({ authUid, petId, tipo, registro }) {
    let q = supabase
      .from("documentacion")
      .select("id")
      .eq("user_id", authUid)
      .eq("mascota_id", petId)
      .eq("tipo", tipo);

    if (tipo === "vacuna") q = q.eq("tipo_vacuna", registro.tipo_vacuna);
    if (tipo === "pipeta") q = q.eq("producto", registro.producto);
    if (tipo === "desparasitacion")
      q = q.eq("antiparasitario", registro.antiparasitario);

    const { data, error } = await q.limit(1);
    if (error) throw error;

    return (data?.length ?? 0) > 0;
  }

  // Abre modal o manda a planes
  const openModal = (tipo, data = null) => {
    if (!selectedMascota) {
      alert("Selecciona una mascota primero");
      return;
    }

    // si está creando nuevo y ya llegó al límite
    if (!data && !checkingDocLimit && !canAddDoc) {
      navigate("/planes");
      return;
    }

    setTipoModal(tipo);
    setEditData(data);
    setIsModalOpen(true);
  };

  const handleAddOrUpdate = async (data) => {
    if (!selectedMascota || !user) return;

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const authUid = authData?.user?.id;
      if (!authUid) return;

      const registro = {
        user_id: authUid,
        mascota_id: selectedMascota.id,
        tipo: tipoModal,
        fecha_aplicacion: data.fecha_aplicacion || null,
        fecha_vencimiento: data.fecha_vencimiento || null,
        alerta: data.alerta || "Activo",
        tipo_vacuna: data.tipo_vacuna || null,
        producto: data.producto || null,
        antiparasitario: data.antiparasitario || null,
        presentacion: data.presentacion || null,
        foto_url: data.foto_url || null,
      };

      if (!editData) {
        // limite por mascota
        if (!checkingDocLimit && !canAddDoc) {
          navigate("/planes");
          return;
        }

        // no duplicar lo mismo
        const dup = await isDuplicate({
          authUid,
          petId: selectedMascota.id,
          tipo: tipoModal,
          registro,
        });

        if (dup) {
          alert(
            "Esto ya lo tenés cargado para esta mascota. Si querés cambiar fechas, editá el registro."
          );
          return;
        }

        const { error } = await supabase.from("documentacion").insert([registro]);
        if (error) throw error;

        setDocsCount((prev) => (prev ?? 0) + 1);
      } else {
        const { error } = await supabase
          .from("documentacion")
          .update(registro)
          .eq("id", editData.id);

        if (error) throw error;
      }

      await fetchDocumentation(selectedMascota);
      setIsModalOpen(false);
      setEditData(null);
    } catch (err) {
      console.error("Error guardando documentación:", err);
      alert("Ocurrió un error al guardar la documentación.");
    }
  };

  const handleDelete = async (_tipo, id) => {
    await supabase.from("documentacion").delete().eq("id", id);
    setDocsCount((prev) => Math.max(0, (prev ?? 0) - 1));
    await fetchDocumentation(selectedMascota);
  };

  const renderAlerta = (alerta) => (
    <span
      className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
        alerta === "Activo" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {alerta}
    </span>
  );

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

return (
  <div className="min-h-screen bg-gradient-to-b from-[#22687B]/5 to-white px-4 md:px-16 lg:px-32 py-10">
    <div className="max-w-7xl mx-auto">

      {/* header */}
      <div className="rounded-2xl shadow-sm p-8 text-center">
        <h1 className="text-3xl font-bold text-[#22687B]">
          Ficha médica de tus mascotas
        </h1>
        <p className="text-gray-600 mt-2">
          Mantén organizada toda la información de salud de tus mascotas.
        </p>

        <div className="mt-6 max-w-md mx-auto">
          <select
            value={selectedMascota ? selectedMascota.id.toString() : ""}
            onChange={handleSelectPet}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 shadow-sm focus:ring-2 focus:ring-[#22687B]/30"
          >
            <option value="">Selecciona a tu mascota</option>
            {mascotas.map((m) => (
              <option key={m.id} value={m.id.toString()}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* cards de documentacion */}
      {selectedMascota ? (
        ["vacuna", "pipeta", "desparasitacion"].map((categoria) => {
          let items = [];
          let titulo = "";

          if (categoria === "vacuna") {
            items = vacunas;
            titulo = "Vacunas";
          }
          if (categoria === "pipeta") {
            items = pipetas;
            titulo = "Pipetas";
          }
          if (categoria === "desparasitacion") {
            items = desparasitaciones;
            titulo = "Desparasitaciones";
          }

          return (
            <section key={categoria} className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {titulo}
              </h2>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-500">
                          {categoria === "vacuna"
                            ? "Vacuna"
                            : categoria === "pipeta"
                            ? "Producto"
                            : "Antiparasitario"}
                        </p>

                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.alerta === "Activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {item.alerta}
                        </span>
                      </div>

                      <p className="font-bold text-lg mt-1">
                        {categoria === "vacuna"
                          ? item.tipo_vacuna
                          : categoria === "pipeta"
                          ? item.producto
                          : item.antiparasitario}
                      </p>

                      <div className="mt-4 text-sm text-gray-600 space-y-1">
                        <p>
                          Aplicación:{" "}
                          <span className="font-medium">
                            {item.fecha_aplicacion || "-"}
                          </span>
                        </p>
                        <p>
                          Vencimiento:{" "}
                          <span className="font-medium">
                            {item.fecha_vencimiento || "-"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      className="mt-6 bg-[#22687B] text-white py-2 rounded-xl hover:bg-[#1c5563] transition"
                      onClick={() => openModal(categoria, item)}
                    >
                      Ver información
                    </button>
                  </div>
                ))}

                {/* agregar boton */}
                <div
                  onClick={() => openModal(categoria)}
                  className="bg-white rounded-2xl border-dashed border-2 border-gray-300 p-6 flex flex-col items-center justify-center hover:shadow-md cursor-pointer transition"
                >
                  <div className="text-4xl text-[#22687B] font-bold">+</div>
                  <p className="mt-2 font-semibold text-gray-700">
                    Agregar {titulo.slice(0, -1)}
                  </p>
                </div>

              </div>
            </section>
          );
        })
      ) : (
        <p className="text-center text-gray-500 mt-12">
          Selecciona una mascota para ver su documentación.
        </p>
      )}

      <ModalDocumentacion
        isOpen={isModalOpen}
        tipo={tipoModal}
        data={editData}
        petSpecies={selectedMascota?.especie}
        existingItems={{
          vacuna: vacunas,
          pipeta: pipetas,
          desparasitacion: desparasitaciones,
        }}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onAddOrUpdate={handleAddOrUpdate}
        onDelete={handleDelete}
      />
    </div>
  </div>
);
}