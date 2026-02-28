import { useEffect, useState } from "react";
import Logo from "../../assets/logo.png";

export default function LoadingScreen({
  text = "Cargando",
  fullScreen = true,
  className = "",
}) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 450);

    return () => clearInterval(id);
  }, []);

  const Wrapper = fullScreen ? "div" : "div";

  return (
    <Wrapper
      className={[
        fullScreen
          ? "min-h-screen w-full flex items-center justify-center bg-white"
          : "w-full flex items-center justify-center",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <img
          src={Logo}
          alt="Cute Rescue"
          className="w-16 h-16 object-contain"
        />

        <div className="text-[#22687B] font-semibold text-lg">
          {text}
          <span className="inline-block w-6 text-left">{dots}</span>
        </div>

        {/* detalle visual sutil */}
        <div className="h-1 w-32 bg-[#22687B]/15 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-[#22687B] rounded-full animate-loadingBar" />
        </div>
      </div>
    </Wrapper>
  );
}