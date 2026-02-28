import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { capitalizeAll } from "../../utils/text";
import { useAuth } from "../../context/AuthContext";

/**
 * AddPets
 * - Abre modal para registrar nueva mascota
 * - Valida límite por plan (freemium/premium/plus)
 * - Si alcanza el límite: bloquea UI y redirige a /planes
 */
export default function AddPets({ onPetAdded }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    especie: "",
    raza: "",
    fecha_nacimiento: "",
    peso: "",
    sexo: "",
    color: "",
    estado_salud: "",
    foto_url: null,
  });

  const [ubicacion, setUbicacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // Plan / límite
  const [planCode, setPlanCode] = useState("freemium");
  const [maxPets, setMaxPets] = useState(1);
  const [currentPetsCount, setCurrentPetsCount] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(true);

  const canAddPet = useMemo(() => {
    return (currentPetsCount ?? 0) < (maxPets ?? 1);
  }, [currentPetsCount, maxPets]);

  // 1) Chequear límite (plan + count mascotas)
  useEffect(() => {
    async function checkPetLimit() {
      try {
        setCheckingLimit(true);
        if (!user?.id) return;

        // a) plan del usuario
        const { data: userRow, error: userErr } = await supabase
          .from("usuarios")
          .select("membresia_codigo")
          .eq("id", user.id)
          .single();

        if (userErr) throw userErr;

        const code = (userRow?.membresia_codigo || "freemium").toLowerCase();
        setPlanCode(code);

        // b) límite del plan
        const { data: membershipRow, error: memErr } = await supabase
          .from("membresias")
          .select("max_mascotas")
          .eq("codigo", code)
          .single();

        if (memErr) throw memErr;

        const max = Number(membershipRow?.max_mascotas);
        setMaxPets(Number.isFinite(max) ? max : 1);

        // c) cuántas mascotas tiene el usuario
        const { count, error: countErr } = await supabase
          .from("mascotas")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id);

        if (countErr) throw countErr;

        setCurrentPetsCount(count ?? 0);
      } catch (err) {
        console.error("Error checking pet limit:", err);
        // fallback seguro
        setPlanCode("freemium");
        setMaxPets(1);
      } finally {
        setCheckingLimit(false);
      }
    }

    checkPetLimit();
  }, [user?.id]);

  // 2) Obtener ubicación del usuario cuando se abre el modal
  useEffect(() => {
    const fetchUbicacion = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("localizacion_usuario")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (error) {
        console.error("Error al obtener ubicación:", error.message);
        return;
      }

      setUbicacion(data);
    };

    if (showModal) fetchUbicacion();
  }, [showModal, user]);

  // 3) Manejo de inputs
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "foto_url" && files?.[0]) {
      setForm((prev) => ({ ...prev, foto_url: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
      return;
    }

    if (name === "peso") {
      if (value === "" || Number(value) >= 0) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 4) Click en la card “Agregar mascota”
  const handleOpen = () => {
    setMessage("");

    // mientras chequea, no abrimos (evita bugs)
    if (checkingLimit) return;

    if (!canAddPet) {
      // UX: llevamos a planes
      navigate("/planes");
      return;
    }

    setShowModal(true);
  };

  // 5) Guardar mascota
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Chequeo UI extra (por si cambió el estado)
    if (!canAddPet) {
      setLoading(false);
      navigate("/planes");
      return;
    }

    if (
      !form.nombre ||
      !form.especie ||
      !form.raza ||
      !form.fecha_nacimiento ||
      !form.peso ||
      !form.color ||
      !form.sexo
    ) {
      setMessage("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    if (!user) {
      alert("Usuario no autenticado.");
      setLoading(false);
      return;
    }

    try {
      // Subir foto si corresponde
      let fotoUrl = null;

      if (form.foto_url instanceof File) {
        const fileName = `${user.id}_${Date.now()}_${form.foto_url.name}`;

        const { error: uploadError } = await supabase.storage
          .from("mascotas")
          .upload(fileName, form.foto_url);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("mascotas")
          .getPublicUrl(fileName);

        fotoUrl = publicUrl.publicUrl;
      }

      // Insert mascota (acá también te protege el trigger PET_LIMIT_REACHED)
      const { data: pet, error: insertError } = await supabase
        .from("mascotas")
        .insert([
          {
            owner_id: user.id,
            nombre: form.nombre,
            especie: form.especie,
            raza: form.raza,
            fecha_nacimiento: form.fecha_nacimiento,
            peso: parseInt(form.peso),
            sexo: form.sexo,
            color: form.color,
            estado_salud: form.estado_salud,
            foto_url: fotoUrl,
            ubicacion_usuario: ubicacion?.id || null,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Insert ubicación inicial
      if (ubicacion) {
        const { direccion, codigoPostal, provincia, lat, lng, source } =
          ubicacion;

        const { error: locError } = await supabase.from("localizacion").insert([
          {
            owner_id: user.id,
            mascota_id: pet.id,
            chip_id: "1111",
            direccion,
            codigoPostal,
            provincia,
            lat,
            lng,
            source,
            localizacion_segura: true,
            created_at: new Date(),
          },
        ]);

        if (locError) throw locError;
      }

      // refrescar contador local (para que se deshabilite si llegó al límite)
      setCurrentPetsCount((prev) => (prev ?? 0) + 1);

      onPetAdded?.(pet);
      setMessage("✅ Mascota registrada correctamente.");
      setShowModal(false);

      setForm({
        nombre: "",
        especie: "",
        raza: "",
        fecha_nacimiento: "",
        peso: "",
        sexo: "",
        color: "",
        estado_salud: "",
        foto_url: null,
      });
      setPreview(null);
    } catch (err) {
      console.error("Error al agregar pet:", err);

      const msg = String(err?.message || "");

      // Si el trigger bloqueó (seguridad real)
      if (msg.includes("PET_LIMIT_REACHED")) {
        alert(
          "Alcanzaste el límite de mascotas de tu plan. Mejorá tu plan para agregar más."
        );
        navigate("/planes");
      } else {
        alert("❌ Falló al agregar mascota: " + msg);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const maxDate = new Date().toISOString().split("T")[0];

  const disabledCard = !checkingLimit && !canAddPet;

  return (
    <>
      {/* Card que abre el modal (o redirige a planes si no puede) */}
      <article
        className={`mx-auto w-[256px] flex-shrink-0 rounded-3xl h-[250px] p-5 flex justify-center items-center flex-col shadow-md transition-all duration-300
          ${
            disabledCard
              ? "bg-gray-200 cursor-not-allowed opacity-80"
              : "bg-[#f5f5dc]/50 cursor-pointer hover:shadow-xl hover:scale-105"
          }`}
        onClick={handleOpen}
        title={
          disabledCard
            ? `Límite alcanzado (${currentPetsCount}/${maxPets}). Mejorá tu plan.`
            : "Agregar mascota"
        }
      >
        <span
          className={`text-3xl font-bold ${
            disabledCard ? "text-gray-600" : "text-[#22687b]"
          }`}
        >
          +
        </span>

        <p className={`${disabledCard ? "text-gray-600" : "text-[#22687b]"} mt-2`}>
          {disabledCard ? "Mejorar plan" : "Agregar mascota"}
        </p>

        {!checkingLimit && (
          <p className="text-xs mt-2 text-gray-500">
            {currentPetsCount}/{maxPets} mascotas usadas • Plan {planCode}
          </p>
        )}
      </article>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center w-full z-[1000]">
          <div className="modalGlobal relative ">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-white hover:text-blue-300"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              Agregar mascota
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto"
            >
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre || ""}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Especie */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Especie
                </label>
                <select
                  name="especie"
                  value={form.especie || ""}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Seleccionar</option>
                  <option value="Canino">Canino</option>
                  <option value="Felino">Felino</option>
                </select>
              </div>

              {/* Raza */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Raza
                </label>
                <input
                  type="text"
                  name="raza"
                  value={form.raza || ""}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={form.fecha_nacimiento || ""}
                  max={maxDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Peso */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  name="peso"
                  min="0"
                  step="0.1"
                  value={form.peso || ""}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={form.color || ""}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Sexo */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Sexo
                </label>
                <select
                  name="sexo"
                  value={form.sexo || ""}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Seleccionar</option>
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>

              {/* Estado de salud */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Estado de salud
                </label>
                <input
                  type="text"
                  name="estado_salud"
                  value={form.estado_salud || ""}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Foto */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-white mb-1">
                  Foto
                </label>
                <input
                  type="file"
                  name="foto_url"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                />
                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    className="mt-3 w-40 h-40 object-cover rounded-xl mx-auto"
                  />
                )}
              </div>

              {/* Ubicación */}
              {ubicacion && (
                <div className="col-span-2 bg-gray-100 p-3 rounded-lg text-sm text-gray-700 border">
                  <p>
                    <strong>Dirección:</strong>{" "}
                    {capitalizeAll(ubicacion.direccion)}
                  </p>
                  <p>
                    <strong>Código Postal:</strong> {ubicacion.codigoPostal}
                  </p>
                  <p>
                    <strong>Provincia:</strong> {ubicacion.provincia}
                  </p>
                  <p className="text-green-700 font-medium mt-1">
                    📍 Esta será la ubicación inicial de tu mascota.
                  </p>
                </div>
              )}

              {message && (
                <p
                  className={`col-span-2 text-center mt-2 ${
                    message.includes("⚠️") || message.includes("❌")
                      ? "text-red-400"
                      : "text-green-300"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="col-span-2 flex justify-center mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btnNaranja px-8"
                >
                  {loading ? "Guardando..." : "Guardar mascota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}