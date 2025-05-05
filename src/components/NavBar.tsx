
import { Home, Trophy, Activity as ActivityIcon, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();
  const path = location.pathname;

  const isActivePath = (route: string) => {
    return path === route;
  };

  const menuItems = [
    { icon: Home, label: "Feed", path: "/" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: ActivityIcon, label: "Aktivitet", path: "/activities" },
    { icon: User, label: "Profil", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <nav className="flex justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-4 ${
                active ? "text-purple-600" : "text-gray-600"
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? "text-purple-600" : "text-gray-500"}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default NavBar;
