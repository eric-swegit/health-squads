
import { Home, Trophy, Activity as ActivityIcon, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import NotificationBell from "./notifications/NotificationBell";
import { useFeedIndicator } from "@/hooks/useFeedIndicator";

const NavBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { hasNewPosts } = useFeedIndicator();

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
      <nav className="flex justify-around items-center py-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(item.path);
          const showNewIndicator = item.path === '/' && hasNewPosts;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative"
              aria-label={item.label}
            >
              <Icon 
                className={`h-7 w-7 ${active ? "text-purple-600" : "text-gray-500"}`} 
                aria-hidden="true"
              />
              
              {showNewIndicator && (
                <span className="absolute top-0 right-0 flex h-2 w-2 rounded-full bg-red-500">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                </span>
              )}
            </Link>
          );
        })}
        
        <div className="relative">
          <NotificationBell />
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
