import React, { useEffect, useMemo, useState } from "react";

export default function ModalDocumentacion({
  isOpen,
  tipo,
  data,
  petSpecies, // "Canino" | "Felino"
  existingItems, // { vacuna: [], pipeta: [], desparasitacion: [] }
  onClose,
  onAddOrUpdate,
  onDelete,
}) {
  const [formData, setFormData] = useState({ alerta: "Activo" });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const isEditing = !!data;

  // opciones base por especie
  const baseVaccineOptions = useMemo(() => {
    const sp = String(petSpecies || "").toLowerCase();
    const isCat = sp.includes("fel");

    if (isCat) {
      return ["Triple Felina", "Leucemia Felina (FeLV)", "Antirrábica"];
    }
    return ["Vacuna Séxtuple", "Antirrábica", "Bordetella (Tos de las perreras)"];
  }, [petSpecies]);

  // vacunas ya usadas (solo para esta mascota, ya viene filtrado desde Documentation.jsx)
  const usedVaccines = useMemo(() => {
    const list = existingItems?.vacuna ?? [];
    return new Set(list.map((x) => String(x.tipo_vacuna || "").trim()).filter(Boolean));
  }, [existingItems]);

  // opciones disponibles = base - usadas
  const availableVaccineOptions = useMemo(() => {
    return baseVaccineOptions.filter((v) => !usedVaccines.has(v));
  }, [baseVaccineOptions, usedVaccines]);

  // para pipeta/desparasitacion: si ya existe 1, no dejamos crear otra
  const alreadyHasOneForType = useMemo(() => {
    if (!existingItems) return false;

    if (tipo === "pipeta") return (existingItems.pipeta?.length ?? 0) >= 1;
    if (tipo === "desparasitacion") return (existingItems.desparasitacion?.length ?? 0) >= 1;

    return false;
  }, [existingItems, tipo]);

  // si estoy creando y no hay opciones, bloqueo
  const lockedForCreate = useMemo(() => {
    if (isEditing) return false;

    if (tipo === "vacuna") return availableVaccineOptions.length === 0;
    if (tipo === "pipeta" || tipo === "desparasitacion") return alreadyHasOneForType;

    return false;
  }, [isEditing, tipo, availableVaccineOptions.length, alreadyHasOneForType]);

  useEffect(() => {
    if (data) {
      setFormData({
        alerta: data.alerta || "Activo",
        tipo_vacuna: data.tipo_vacuna || "",
        producto: data.producto || "",
        antiparasitario: data.antiparasitario || "",
        presentacion: data.presentacion || "",
        fecha_aplicacion: data.fecha_aplicacion ? data.fecha_aplicacion.split("T")[0] : "",
        fecha_vencimiento: data.fecha_vencimiento ? data.fecha_vencimiento.split("T")[0] : "",
        foto_url: data.foto_url || "",
      });
    } else {
      setFormData({ alerta: "Activo" });
    }

    setErrors({});
    setErrorMessage("");
  }, [data, tipo]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? URL.createObjectURL(files?.[0]) : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: false }));
    setErrorMessage("");
  };

  const handleSubmit = () => {
    // si está bloqueado, ni intentamos
    if (lockedForCreate) return;

    const newErrors = {};

    if (!formData.fecha_aplicacion) newErrors.fecha_aplicacion = true;
    if (!formData.fecha_vencimiento) newErrors.fecha_vencimiento = true;

    if (tipo === "vacuna" && !formData.tipo_vacuna) newErrors.tipo_vacuna = true;
    if (tipo === "pipeta" && !formData.producto) newErrors.producto = true;

    if (tipo === "desparasitacion") {
      if (!formData.antiparasitario) newErrors.antiparasitario = true;
      if (!formData.presentacion) newErrors.presentacion = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorMessage("Por favor completá los campos obligatorios.");
      return;
    }

    onAddOrUpdate(formData);
    onClose();
  };

  const handleDelete = () => {
    if (!data) return;
    onDelete(tipo, data.id);
    onClose();
  };

  const renderLockedMessage = () => {
    if (!lockedForCreate) return null;

    const text =
      tipo === "vacuna"
        ? "Ya cargaste todas las vacunas disponibles para esta mascota. Editá o eliminá una previa."
        : `Ya existe un registro de ${tipo} para esta mascota. Editalo o eliminá el anterior.`;

    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded text-sm mb-3">
        {text}
      </div>
    );
  };

  const renderFields = () => {
    switch (tipo) {
      case "vacuna":
        return (
          <>
            {renderLockedMessage()}

            <div className="form-row">
              <div className="form-group">
                <label>Vacuna</label>
                <select
                  name="tipo_vacuna"
                  value={formData.tipo_vacuna || ""}
                  onChange={handleChange}
                  disabled={lockedForCreate}
                  className={`input-field ${errors.tipo_vacuna ? "border-red-500" : ""}`}
                >
                  {lockedForCreate ? (
                    <option value="">Editá o eliminá una previa</option>
                  ) : (
                    <>
                      <option value="">Seleccionar</option>
                      {availableVaccineOptions.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* si está bloqueado, no muestro el resto para no marear */}
            {!lockedForCreate && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Aplicación</label>
                    <input
                      type="date"
                      name="fecha_aplicacion"
                      value={formData.fecha_aplicacion || ""}
                      onChange={handleChange}
                      className={`input-field ${errors.fecha_aplicacion ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Vencimiento</label>
                    <input
                      type="date"
                      name="fecha_vencimiento"
                      value={formData.fecha_vencimiento || ""}
                      onChange={handleChange}
                      className={`input-field ${errors.fecha_vencimiento ? "border-red-500" : ""}`}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group w-full">
                    <label>Subir foto (opcional)</label>
                    <input
                      type="file"
                      name="foto_url"
                      onChange={handleChange}
                      className="input-field"
                    />
                    {formData.foto_url && (
                      <p className="file-name mt-1 text-sm text-gray-600">
                        Archivo cargado correctamente
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        );

      case "pipeta":
      case "desparasitacion": {
        const label = tipo === "pipeta" ? "Producto" : "Antiparasitario";
        const fieldName = tipo === "pipeta" ? "producto" : "antiparasitario";

        return (
          <>
            {renderLockedMessage()}

            {!lockedForCreate && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>{label}</label>
                    <input
                      type="text"
                      name={fieldName}
                      value={formData[fieldName] || ""}
                      onChange={handleChange}
                      className={`input-field ${errors[fieldName] ? "border-red-500" : ""}`}
                    />
                  </div>

                  <div className="form-group">
                    <label>Presentación</label>
                    <select
                      name="presentacion"
                      value={formData.presentacion || ""}
                      onChange={handleChange}
                      className={`input-field ${errors.presentacion ? "border-red-500" : ""}`}
                    >
                      <option value="">Seleccionar</option>
                      <option>Pipeta (aceite en la nuca)</option>
                      <option>Comprimido</option>
                      <option>Talco</option>
                      <option>Otro</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Aplicación</label>
                    <input
                      type="date"
                      name="fecha_aplicacion"
                      value={formData.fecha_aplicacion || ""}
                      onChange={handleChange}
                      className={`input-field ${errors.fecha_aplicacion ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Vencimiento</label>
                    <input
                      type="date"
                      name="fecha_vencimiento"
                      value={formData.fecha_vencimiento || ""}
                      onChange={handleChange}
                      className={`input-field ${errors.fecha_vencimiento ? "border-red-500" : ""}`}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">
          {data ? `Detalles de ${tipo}` : `Agregar ${tipo}`}
        </h2>

        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          {renderFields()}

          {/* alerta solo si no está bloqueado */}
          {!lockedForCreate && (
            <div className="form-row mt-3">
              <label>Alerta:</label>
              <select
                name="alerta"
                value={formData.alerta || "Activo"}
                onChange={handleChange}
                className="input-field"
              >
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </div>
          )}

          <div className="form-actions flex flex-col items-center mt-4">
            <div className="flex justify-center gap-3">
              {/* si está bloqueado: solo volver */}
              <button type="button" className="btnAzul w-32" onClick={onClose}>
                Volver
              </button>

              {!lockedForCreate && (
                <button
                  type="button"
                  className="btnNaranja w-32"
                  onClick={handleSubmit}
                >
                  {data ? "Editar" : "Agregar"}
                </button>
              )}

              {data && (
                <button
                  type="button"
                  className="btnTransparente delete w-32"
                  onClick={handleDelete}
                >
                  Borrar
                </button>
              )}
            </div>

            {errorMessage && (
              <p className="text-red-600 text-sm mt-3 text-center font-medium">
                {errorMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}