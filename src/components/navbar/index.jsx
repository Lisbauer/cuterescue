import { useState } from "react";
import Logo from "../../assets/logo.png";
import LogoNombre from "../../assets/logo-2.png";
import { Link } from "react-router-dom";
import { LinkButton } from "../ui/LinkButton";
import { Item } from "./Item";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={{ background: "#F5F5DC" }} className="bg-navbar shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/">
            <div className="flex">
              <img className="h-30 w-auto" src={Logo} alt="Logo" />
              <img className="h-35 w-auto" src={LogoNombre} alt="Logo" />
            </div>
          </Link>

          {/* 🔸 Menú desktop (idéntico al tuyo) */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <ul className="flex space-x-6 text-lg">
              <Item href="/">Home</Item>
              <Item href="/veterinarias">Veterinarias 24hrs</Item>
              <Item href="/documentacion">Documentación</Item>
              <Item href="/eventos">Eventos</Item>
            </ul>

            {/* Botones desktop (idénticos) */}
            <div className="ml-6 flex space-x-2">
              <LinkButton href="/formulario-de-ingreso">Ingresar</LinkButton>
              <LinkButton variant="outline" href="/formulario-titular">
                Registrarte
              </LinkButton>
            </div>
          </div>

          {/* 🔸 Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#3D8E88] focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 🔸 Menú móvil (actualizado con tus colores y links) */}
      {isOpen && (
        <div
          className="md:hidden px-4 pt-2 pb-4 space-y-2 transition-all duration-300 ease-in-out"
          style={{ backgroundColor: "#F5F5DC" }}
        >
          <ul className="space-y-2 text-lg">
            <li>
              <Link
                to="/"
                className="block text-[#3D8E88] hover:text-[#2f6f6c]"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/veterinarias"
                className="block text-[#3D8E88] hover:text-[#2f6f6c]"
                onClick={() => setIsOpen(false)}
              >
                Veterinarias 24hrs
              </Link>
            </li>
            <li>
              <Link
                to="/documentacion"
                className="block text-[#3D8E88] hover:text-[#2f6f6c]"
                onClick={() => setIsOpen(false)}
              >
                Documentación
              </Link>
            </li>
            <li>
              <Link
                to="/eventos"
                className="block text-[#3D8E88] hover:text-[#2f6f6c]"
                onClick={() => setIsOpen(false)}
              >
                Eventos
              </Link>
            </li>
          </ul>

          {/* Botones móvil con mismos colores */}
          <div className="mt-2 flex flex-col space-y-2">
            <button
              className="w-full px-4 py-2 border rounded text-[#3D8E88] hover:text-white transition"
              style={{ borderColor: "#3D8E88" }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#32726b";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#3D8E88";
              }}
            >
              Ingresar
            </button>

            <Link to="/formulario-titular" onClick={() => setIsOpen(false)}>
              <button
                className="w-full px-4 py-2 rounded text-white transition"
                style={{ backgroundColor: "#3D8E88" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#32726b")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3D8E88")
                }
              >
                Registrarte
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
