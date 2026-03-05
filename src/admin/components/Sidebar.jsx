import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logoWhite from "../../assets/logo-white.png";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);

    // soporte nuevos/viejos browsers
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);

    setIsDesktop(mq.matches);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  return isDesktop;
}

export default function Sidebar({ isOpen, onClose }) {
  const asideRef = useRef(null);
  const isDesktop = useIsDesktop();

  const menuItems = [
    { label: "Dashboard", path: "/admin" },
    { label: "Usuarios", path: "/admin/usuarios" },
    { label: "Veterinarias", path: "/admin/veterinarias" },
    { label: "Eventos", path: "/admin/eventos" },
    { label: "Membresías", path: "/admin/membresias" },
    { label: "Mapeo general", path: "/admin/mapa" },
    { label: "Cute Rescue", path: "/" },
  ];

 
  useEffect(() => {
    if (isDesktop) return;
    if (!isOpen) return;

    const el = asideRef.current;
    if (!el) return;

    const focusable = el.querySelector(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, [isOpen, isDesktop]);


  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;

    if (isDesktop) {
      el.removeAttribute("inert");
      return;
    }

    if (!isOpen) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }, [isOpen, isDesktop]);

  return (
    <>
    
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        ref={asideRef}
        className={`
          fixed top-0 left-0 z-50 h-screen  w-64 bg-[#22687B] text-white p-6 flex flex-col
          transform transition-transform duration-200
          lg:static lg:translate-x-0 lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      
        role={isDesktop ? undefined : "dialog"}
        aria-modal={isDesktop ? undefined : "true"}
        aria-label="Menú administrador"
      >
        <div className="flex items-start justify-between mb-10">
          <div className="flex flex-col items-center w-full">
            <a href="#"><img src={logoWhite} alt="Cute Rescue Logo" className="w-28 object-contain mb-2" /></a>
            <h2 className="text-sm font-medium tracking-wide text-white/80">
              Panel Administrador
            </h2>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden ml-3 text-white/90 hover:text-white"
            aria-label="Cerrar menú"
            type="button"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                // cerrar al navegar solo en mobile
                if (!isDesktop) onClose?.();
              }}
              className={({ isActive }) =>
                `px-4 py-2 rounded transition ${
                  isActive ? "bg-[#2f7f96]" : "hover:bg-[#2f7f96]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}