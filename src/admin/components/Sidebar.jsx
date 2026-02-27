import { NavLink } from "react-router-dom";
import logo from "../../assets/logo-2.png";

export default function Sidebar() {
  const menuItems = [
    { label: "Dashboard", path: "/admin" },
    { label: "Usuarios", path: "/admin/usuarios" },
    { label: "Veterinarias", path: "/admin/veterinarias" },
    { label: "Eventos", path: "/admin/eventos" },
    { label: "Membresías", path: "/admin/membresias" },
    { label: "Alertas / Reportes", path: "/admin/alertas" },
    { label: "Configuración", path: "/admin/configuracion" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#22687B] text-white p-6 flex flex-col">
      
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <img
          src={logo}
          alt="Cute Rescue"
          className="w-28 object-contain mb-2"
        />
        <h2 className="text-sm font-medium tracking-wide text-white/80">
          Panel Administrador
        </h2>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded transition ${
                isActive
                  ? "bg-[#2f7f96]"
                  : "hover:bg-[#2f7f96]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}