import { Link } from "react-router-dom";
import { cn } from "../../../lib/utils";

const linkButtonVariants = {
  solid: "text-white bg-[#3D8E88] hover:bg-[#32726b]",
  outline:
    "border border-[#3D8E88] text-[#3D8E88] hover:bg-[#32726b] hover:text-white",
};

export const LinkButton = ({
  href,
  children,
  variant = "solid",
  className,
}) => {
  return (
    <Link
      to={href}
      className={cn(
        "px-4 py-2 rounded transition-colors duration-300 cursor-pointer",
        linkButtonVariants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
};
