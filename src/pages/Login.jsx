import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import tramaBg from "../assets/vetorpatas_trama.png";
import logo from "../assets/logo-2.png";

export default function LogIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password } = formData;

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <img
        src={tramaBg}
        alt=""
        className="absolute w-full h-full object-cover -z-10 opacity-30"
      />

      <form
        onSubmit={handleLogin}
        className="bg-gray-500/50 backdrop-blur-md w-[450px] h-auto rounded-2xl flex flex-col justify-center items-center gap-10 px-10 py-12 shadow-xl"
      >
        <div className="m-0">
          <img src={logo} alt="Logo" className="h-40 w-full m-0 object-contain" />
        </div>

        <p className="text-white text-xl text-center mb-2">
          Ingresa tu correo y contraseña
        </p>

        <div className="flex flex-col gap-4 w-full">
          <input
            type="email"
            name="email"
            placeholder="nombre@mail.com"
            value={formData.email}
            onChange={handleChange}
            className="bg-white p-2 mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
            className="bg-white p-2 mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600"
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-700 text-center px-10 py-2 text-white font-semibold rounded-md hover:bg-cyan-800 transition-all w-full"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-sm text-cyan-100 hover:text-white mt-2 text-center">
          <a href="#" className="underline hover:text-gray-200">
            ¿Olvidaste tu contraseña?
          </a>
        </p>
      </form>
    </div>
  );
}