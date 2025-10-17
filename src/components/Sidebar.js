import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ onLinkClick }) {
  const location = useLocation();

  const links = [
    { to: "/", label: "📊 Dashboard" },
    { to: "/stockin", label: "📥 Stock-In" },
    { to: "/stockout", label: "📤 Stock-Out" },
    { to: "/defects", label: "🛠 Defect" },
    { to: "/check", label: "🔍 Check Item" },
  ];

  return (
    <aside className="h-full p-4 overflow-y-auto">
      <div className="font-bold text-lg mb-6 px-2">Inventory App</div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onLinkClick}
            className={`block rounded-lg p-4 text-center shadow-sm transition
              ${
                location.pathname === link.to
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
