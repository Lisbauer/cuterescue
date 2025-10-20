import React from "react";
import logo from "../assets/logo.png"; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo + nombre */}
        <div className="footer-logo">
          <img src={logo} alt="Logo" className="footer-img" />
          <span className="footer-title">Cute Rescue</span>
        </div>

        {/* Links */}
        <ul className="footer-links">
          <li><a href="#" className="footer-link">Inicio</a></li>
          <li><a href="#" className="footer-link">Sobre Nosotros</a></li>
          <li><a href="#" className="footer-link">Contacto</a></li>
        </ul>
      </div>

      {/* Línea inferior */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Cute Rescue — Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
