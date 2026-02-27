export default function AdminStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md shadow-gray-300/50">
        <p className="text-sm text-gray-500 mb-1">Nuevos usuarios</p>
        <p className="text-3xl font-semibold text-gray-800">
          {stats.nuevosUsuariosHoy}
        </p>
        <p className="text-xs text-gray-400 mt-1">hoy</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md shadow-gray-300/50">
        <p className="text-sm text-gray-500 mb-1">Mascotas activas</p>
        <p className="text-3xl font-semibold text-gray-800">
          {stats.mascotasActivas}
        </p>
        <p className="text-xs text-gray-400 mt-1">últimos 7 días</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md shadow-gray-300/50">
        <p className="text-sm text-gray-500 mb-1">Total usuarios</p>
        <p className="text-3xl font-semibold text-gray-800">
          {stats.totalUsuarios}
        </p>
      </div>
    </div>
  );
}