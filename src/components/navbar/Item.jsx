import { Link } from "react-router-dom";

export const Item = ({ href, children }) => {
  return (
    <li>
      <Link to={href} className="text-[#3D8E88] hover:text-[#2f6f6c]">
        {children}
      </Link>
    </li>
  );
};
