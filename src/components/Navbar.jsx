import React, { useEffect, useRef, useState } from "react";
import Logo from "../assets/logo.png";
import LogoNombre from "../assets/logo-2.png";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import PetLink from "./ui/PetLink";
import { useSavedData } from "../context/SavedDataContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import LoadingScreen from "./ui/LoadingScreen";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { selectedPet, alertOn } = useSavedData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [alerts, setAlerts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Informe", path: "/informe" },
    { name: "Vet 24hrs", path: "/veterinarias-24-hrs" },
    { name: "Documentación", path: "/documentacion" },
    { name: "Eventos", path: "/eventos" },
  ];

  const formatDate = (value) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return "";
    }
  };

  const fetchIsAdmin = async (userId) => {
    try {
      setCheckingAdmin(true);
      const { data, error } = await supabase
        .from("admin_roles")
        .select("is_active")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data?.is_active);
    } catch (e) {
      console.error("error chequeando admin:", e?.message || e);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchAlerts = async (userId) => {
    const { data, error } = await supabase
      .from("notificaciones")
      .select(`id, mensaje, fecha_alerta, vista, documentacion:documentacion_id (alerta)`)
      .eq("user_id", userId)
      .order("fecha_alerta", { ascending: true });

    if (error) return;

    const today = new Date();
    const filtered = (data || []).filter(
      (n) =>
        new Date(n.fecha_alerta) <= today &&
        n.documentacion?.alerta === "Activo" &&
        n.vista === false
    );

    setAlerts(filtered);
  };

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setIsAdmin(false);
      return;
    }

    fetchAlerts(user.id);
    fetchIsAdmin(user.id);
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const markAllAsSeen = async () => {
    if (alerts.length === 0) return;
    const ids = alerts.map((a) => a.id);
    await supabase.from("notificaciones").update({ vista: true }).in("id", ids);
    setAlerts([]);
  };

  const toggleNotifications = async () => {
    setNotificationsOpen((prev) => !prev);

    // si estaba abierto y hay alerts, marcamos visto al cerrar
    if (notificationsOpen && alerts.length > 0) {
      await markAllAsSeen();
    }
  };

  // click afuera (notifs + perfil)
  useEffect(() => {
    const onMouseDown = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Esc cierra todo
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // cuando pasa a desktop, cerramos el menú mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    handleChange();
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // bloquear scroll cuando drawer open (mobile)
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  if (loading) return <LoadingScreen />;

  return (
    <nav className={`${alertOn ? "bg-[#FBC68F]" : "bg-white"} z-[5000] py-5 shadow`}>
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto h-20 px-4 flex items-center justify-between gap-3">
        {/* Logo (siempre) */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img className="h-25 w-auto" src={Logo} alt="Logo" draggable="false" />
          <img className="h-25 w-auto hidden sm:block" src={LogoNombre} alt="Logo nombre" draggable="false" />
        </Link>

        {/* Desktop menu */}
        <div className="hidden lg:flex flex-1 justify-center">
          <ul className="flex flex-nowrap bg-[#22687B]/20 rounded-lg overflow-hidden text-base p-2 gap-2">
            {menuItems.map((item) => (
              <li key={item.name} className="flex-shrink-0">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 transition-colors duration-300 ${
                      isActive
                        ? "bg-white text-[#22687B] rounded-lg border border-gray-300"
                        : "text-[#22687B] hover:bg-white rounded-lg"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Right actions (DESKTOP) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {!user && (
            <>
              <Link
                to="/login"
                className="px-4 py-2 bg-[#22687B] text-white font-semibold rounded-md shadow hover:bg-[#1c5563] transition"
              >
                Ingresar
              </Link>
              <Link
                to="/registrar"
                className="px-4 py-2 bg-white text-[#22687B] font-semibold rounded-md shadow border border-[#22687B] hover:bg-[#f0fafa] transition"
              >
                Registrarme
              </Link>
            </>
          )}

          {user && <PetLink pet={selectedPet} />}

          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  toggleNotifications();
                }}
                className="relative text-[#22687B] rounded-full p-2 transition hover:bg-[#22687B]/10 active:scale-95
                           focus:outline-none focus:ring-2 focus:ring-[#22687B]/25"
                aria-label="Notificaciones"
                aria-haspopup="menu"
                aria-expanded={notificationsOpen}
              >
                <FiBell size={22} />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full px-1.5 shadow">
                    {alerts.length > 9 ? "9+" : alerts.length}
                  </span>
                )}
              </button>

              <div
                className={[
                  "absolute right-0 mt-2 w-80 max-w-[90vw] z-[6000]",
                  "origin-top-right transition-all duration-200",
                  notificationsOpen
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 -translate-y-2 scale-[0.98] pointer-events-none",
                ].join(" ")}
              >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-b from-[#22687B]/10 to-white border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#22687B]">Notificaciones</p>
                        <p className="text-xs text-gray-500">
                          {alerts.length > 0
                            ? `Tenés ${alerts.length} alerta${alerts.length === 1 ? "" : "s"} pendiente${alerts.length === 1 ? "" : "s"}`
                            : "Todo al día por ahora 🐾"}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={alerts.length === 0}
                        onClick={async () => {
                          await markAllAsSeen();
                          setNotificationsOpen(false);
                        }}
                        className="text-xs font-semibold text-[#22687B] px-3 py-1.5 rounded-lg
                                   hover:bg-[#22687B]/10 transition
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Marcar visto
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto p-2">
                    {alerts.length === 0 ? (
                      <div className="px-3 py-4">
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
                          <p className="text-sm font-semibold text-gray-800">Sin alertas</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Cuando algo venza o requiera atención, va a aparecer acá.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {alerts.map((alert) => (
                          <li key={alert.id}>
                            <div className="rounded-xl px-3 py-2 hover:bg-gray-50 transition">
                              <div className="flex gap-3">
                                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400 flex-none shadow-sm" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-800 leading-snug">
                                    {alert.mensaje}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(alert.fecha_alerta)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Esc para cerrar</span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-[#22687B] hover:underline"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                className="px-4 py-2 bg-white text-[#22687B] font-semibold rounded-md shadow hover:bg-[#f0fafa] transition"
              >
                Mi Perfil
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-[6000] border border-gray-200">
                  <ul className="flex flex-col">
                    <li>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/detalles");
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-[#e6f2f2] transition text-[#22687B] font-medium"
                      >
                        Mi Cuenta
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/planes");
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-[#e6f2f2] transition text-[#22687B] font-medium"
                      >
                        Mi Plan
                      </button>
                    </li>

                    {!checkingAdmin && isAdmin && (
                      <li>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigate("/admin");
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-[#e6f2f2] transition text-[#22687B] font-medium"
                        >
                          Panel de control
                        </button>
                      </li>
                    )}

                    <li>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-[#ffe5e5] font-medium transition"
                      >
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE ACTIONS (nunca se superponen) */}
        <div className="lg:hidden flex items-center gap-2">
          {user && (
            <button
              onClick={() => {
                setProfileOpen(false);
                toggleNotifications();
              }}
              className="relative text-[#22687B] rounded-full p-2 transition hover:bg-[#22687B]/10 active:scale-95"
              aria-label="Notificaciones"
            >
              <FiBell size={22} />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full px-1.5 shadow">
                  {alerts.length > 9 ? "9+" : alerts.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md border border-black/10 px-3 py-2 text-[#22687B]"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            <span className="relative block h-5 w-6">
              <span
                className={`absolute left-0 top-1 block h-[2px] w-6 bg-[#22687B] transition ${
                  mobileMenuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 block h-[2px] w-6 bg-[#22687B] transition ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 bottom-1 block h-[2px] w-6 bg-[#22687B] transition ${
                  mobileMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* MOBILE NOTIFICATIONS DROPDOWN (simple) */}
      {user && (
        <div className="lg:hidden">
          <div
            className={[
              "px-4",
              "transition-all duration-200",
              notificationsOpen ? "block" : "hidden",
            ].join(" ")}
          >
            <div className="mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-b from-[#22687B]/10 to-white border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#22687B]">Notificaciones</p>
                    <p className="text-xs text-gray-500">
                      {alerts.length > 0
                        ? `Tenés ${alerts.length} alerta${alerts.length === 1 ? "" : "s"} pendiente${alerts.length === 1 ? "" : "s"}`
                        : "Todo al día por ahora 🐾"}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={alerts.length === 0}
                    onClick={async () => {
                      await markAllAsSeen();
                      setNotificationsOpen(false);
                    }}
                    className="text-xs font-semibold text-[#22687B] px-3 py-1.5 rounded-lg
                               hover:bg-[#22687B]/10 transition
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Marcar visto
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto p-2">
                {alerts.length === 0 ? (
                  <div className="px-3 py-4">
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">Sin alertas</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cuando algo venza o requiera atención, va a aparecer acá.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {alerts.map((alert) => (
                      <li key={alert.id}>
                        <div className="rounded-xl px-3 py-2 hover:bg-gray-50 transition">
                          <p className="text-sm font-medium text-gray-800 leading-snug">
                            {alert.mensaje}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(alert.fecha_alerta)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Esc para cerrar</span>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-[#22687B] hover:underline"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/30 z-[5200] backdrop-blur-sm"
          />

          <div className="fixed right-0 top-0 h-full w-[86%] max-w-sm bg-white z-[5300] shadow-2xl">
            <div className="h-20 px-4 flex items-center justify-between border-b border-black/5">
              <div className="flex items-center gap-2">
                <img className="h-10 w-auto" src={Logo} alt="Logo" />
                <img className="h-10 w-auto" src={LogoNombre} alt="Logo nombre" />
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md border border-black/10 px-3 py-2 text-[#22687B]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Links */}
              <div className="bg-[#22687B]/10 rounded-2xl p-3">
                <ul className="flex flex-col">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-3 rounded-xl transition ${
                            isActive ? "bg-white text-[#22687B] font-semibold" : "text-[#22687B] hover:bg-white/70"
                          }`
                        }
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PetLink (mobile) */}
              {user && (
                <div className="rounded-2xl border border-black/10 p-3">
                  <p className="text-xs text-black/60 mb-2">Mascota seleccionada</p>
                  <PetLink pet={selectedPet} />
                </div>
              )}

              {/* Profile actions (mobile) */}
              {user ? (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/detalles");
                    }}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-[#22687B] font-semibold hover:bg-black/5"
                  >
                    Mi Cuenta
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/planes");
                    }}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-[#22687B] font-semibold hover:bg-black/5"
                  >
                    Mi Plan
                  </button>

                  {!checkingAdmin && isAdmin && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/admin");
                      }}
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-[#22687B] font-semibold hover:bg-black/5"
                    >
                      Panel de control
                    </button>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-xl bg-red-500 text-white px-4 py-3 font-semibold hover:brightness-110"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center w-full rounded-xl bg-[#22687B] text-white px-4 py-3 font-semibold hover:brightness-110"
                  >
                    Ingresar
                  </Link>

                  <Link
                    to="/registrar"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center w-full rounded-xl bg-white text-[#22687B] px-4 py-3 font-semibold border border-[#22687B] hover:bg-[#f0fafa]"
                  >
                    Registrarme
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}