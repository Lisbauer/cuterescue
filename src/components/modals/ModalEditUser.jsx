import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { provinciasArg } from "../../constants/provincias";

export default function ModalEdicionUsuario({
  isOpen,
  onClose,
  currentUser,
  ubicacion,
  onSave,
}) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    genero: "",
    fechaNacimiento: "",
    tipoDocumento: "",
    documento: "",
    direccion: "",
    codigoPostal: "",
    provincia: "",
    foto_url: "",
  });

  const maxDate = new Date().toISOString().split("T")[0]; // no queremos que el usuario nazca ma;ana

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      setForm({
        nombre: currentUser.nombre || "",
        apellido: currentUser.apellido || "",
        email: currentUser.email || "",
        telefono: currentUser.telefono || "",
        genero: currentUser.genero || "",
        fechaNacimiento: currentUser.fechaNacimiento || "",
        tipoDocumento: currentUser.tipoDocumento || "",
        documento: currentUser.documento || "",
        direccion: currentUser.direccion || ubicacion?.direccion || "",
        codigoPostal: currentUser.codigoPostal || ubicacion?.codigoPostal || "",
        provincia: currentUser.provincia || ubicacion?.provincia || "",
        foto_url: currentUser.foto_url || "",
      });
    }
  }, [currentUser, ubicacion, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.nombre || !form.apellido) {
        setMessage("El nombre y apellido son obligatorios.");
        return;
      }

      let fotoPublicUrl = form.foto_url;
      if (file) {
        const fileName = `${currentUser.id}-${Date.now()}.${file.name
          .split(".")
          .pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        fotoPublicUrl = data.publicUrl;
      }

      const { error: userError } = await supabase
        .from("usuarios")
        .update({
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          genero: form.genero,
          fechaNacimiento: form.fechaNacimiento,
          tipoDocumento: form.tipoDocumento,
          documento: form.documento,
          email: form.email,
          foto_url: fotoPublicUrl,
          direccion: form.direccion,
          codigoPostal: form.codigoPostal,
          provincia: form.provincia,
        })
        .eq("id", currentUser.id);

      if (userError) throw userError;

      const { error: locError } = await supabase
        .from("localizacion_usuario")
        .update({
          direccion: form.direccion,
          codigoPostal: form.codigoPostal,
          provincia: form.provincia,
          update_at: new Date(),
        })
        .eq("owner_id", currentUser.id);

      if (locError) throw locError;

      setMessage("Perfil actualizado correctamente!");
      await onSave();

      setTimeout(() => {
        setMessage("");
        onClose();
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("error al actualizar los datos");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999] p-3">
      <div
        className="
          modalGlobal"
      >
        <h2 className="text-xl font-bold mb-3 text-center text-white">
          Editar perfil
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white">
          <div>
            <label className="label-edit">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="input-edit"
            />
          </div>

          <div>
            <label className="label-edit">Apellido</label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              className="input-edit"
            />
          </div>

          <div>
            <label className="label-edit">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-edit"
            />
          </div>

          <div>
            <label className="label-edit">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="input-edit"
            />
          </div>

          <div>
            <label className="label-edit">Fecha de nacimiento</label>
            <input
              type="date"
              max={maxDate}
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="input-edit"
            />
          </div>

          <div>
            <label className="label-edit">Género</label>
            <select
              name="genero"
              value={form.genero}
              onChange={handleChange}
              className="input-edit"
            >
              <option value="">Seleccione</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="No binario">No binario</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="label-edit">Tipo de documento</label>
            <input
              name="tipoDocumento"
              value={form.tipoDocumento}
              onChange={handleChange}
              className="input-edit"
            />
          </div>

          <div>
            <label className="label-edit">N° documento</label>
            <input
              name="documento"
              value={form.documento}
              onChange={handleChange}
              className="input-edit"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label-edit">Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="input-edit"
            />
          </div>

          <div>
            <label className="label-edit">Código Postal</label>
            <input
              name="codigoPostal"
              value={form.codigoPostal}
              onChange={handleChange}
              className="input-edit"
            />
          </div>

          <div>
            <label className="label-edit">Provincia</label>
            <select
              name="provincia"
              value={form.provincia}
              onChange={handleChange}
              className="input-edit"
            >
              <option value="">Seleccionar provincia</option>
              {provinciasArg.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="label-edit">Foto de perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full bg-white text-black rounded-lg p-2"
          />
        </div>

        {message && <p className="mt-3 text-center text-white">{message}</p>}

        <div className="flex justify-center gap-4 mt-5">
          <button onClick={onClose} className="btnTransparente px-8">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="btnNaranja  px-8">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
