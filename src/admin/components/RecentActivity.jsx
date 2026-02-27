export default function RecentActivity({ activity }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Actividad reciente</h3>

      <ul className="space-y-3">
        {activity.map((item) => (
          <li key={item.id} className="text-sm text-gray-700">
            <span className="font-medium">{item.mascota}</span> •{" "}
            {item.provincia} •{" "}
            <span className="text-gray-500">{item.hora}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
