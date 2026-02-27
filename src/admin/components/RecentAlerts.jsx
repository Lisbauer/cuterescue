export default function RecentAlerts({ alerts }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Alertas recientes</h3>

      <ul className="space-y-3">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={`p-3 rounded border ${
              alert.vista ? "bg-gray-50" : "bg-orange-50 border-orange-300"
            }`}
          >
            <p className="font-medium text-gray-800">{alert.mensaje}</p>
            <p className="text-sm text-gray-500">
              {alert.mascota} • {alert.fecha}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
