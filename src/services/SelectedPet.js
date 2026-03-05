
/**
 *  gestionar la mascota seleccionada por el usuario
 * 
 * Este servicio:
 * - guarda la mascota seleccionada en memoria 
 * - guarda la seleccion en el localstorage
 *
 * se usa en toda la app para sincronizar que mascota está activa
 */

let currentPet = null;
let subscribers = [];

/**
 * lista de campos válidos permitidos para persistir la mascota
 * evita almacenar información innecesaria o insegura
 *
 * @constant
 * @type {string[]}
 */

const VALID_PET_FIELDS = [
  "id",
  "owner_id",
  "nombre",
  "especie",
  "raza",
  "color",
  "sexo",
  "estado_salud",
  "peso",
  "fecha_nacimiento",
  "foto_url" 
];


/**
 * filtra un objeto mascota para que solo incluya los campos válidos

 pet objeto de mascota completo recibido desde supabase
 objeto mascota filtrado y seguro para almacenar
 */
function cleanPetForStorage(pet) {
  const cleaned = {};
  VALID_PET_FIELDS.forEach((key) => {
    if (pet[key] !== undefined) cleaned[key] = pet[key];
  });
  return cleaned;
}


/**
 * guarda la mascota seleccionada
 * - filtra los datos
 * - actualiza la variable global
 * - persiste en localstorage
 * @param  pet - mascota seleccionada
 */
export function setSelectedPet(pet) {
  if (!pet) return;

  // filtrar antes de guardar
  const cleanedPet = cleanPetForStorage(pet);

  currentPet = cleanedPet;

  localStorage.setItem("selectedPet", JSON.stringify(cleanedPet));

  subscribers.forEach((cb) => cb(cleanedPet));
}

// obtiene la mascota seleccionada
export function getSelectedPetService() {
  if (currentPet) return currentPet;

  const saved = localStorage.getItem("selectedPet");
  return saved ? JSON.parse(saved) : null;
}

// subscripcion a cambios
export function subscribeSelectedPet(callback) {
  if (typeof callback !== "function") return () => {};
  subscribers.push(callback);

  return () => {
    subscribers = subscribers.filter((cb) => cb !== callback);
  };
}

/**
 * reinicia la mascota seleccionada
 *  limpia la variable en memoria y localstorage
 */
export function clearSelectedPet() {
  currentPet = null;
  localStorage.removeItem("selectedPet");

  subscribers.forEach((cb) => cb(null));
}
