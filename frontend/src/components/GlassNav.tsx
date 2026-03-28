import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, PlusCircle, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/add-client', icon: PlusCircle, label: 'Add' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function GlassNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 px-4">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass-strong rounded-2xl px-6 py-3 flex gap-8"
      >
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <div
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer select-none ${
                active ? 'text-violet-400' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.6} />
              <span className="text-[10px] font-medium">{label}</span>
            </div>
          );
        })}
      </motion.nav>
    </div>
  );
}
