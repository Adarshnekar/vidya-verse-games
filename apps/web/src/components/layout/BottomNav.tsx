import { NavLink } from 'react-router-dom';
import { Home, Gamepad2, Cpu, Code2, Search } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const MOBILE_NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/playlab', label: 'PlayLab', icon: Gamepad2 },
  { to: '/circuitverse', label: 'Circuit', icon: Cpu },
  { to: '/codeverse', label: 'Code', icon: Code2 },
];

export function BottomNav() {
  const { setCommandPaletteOpen } = useUIStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 lg:hidden shadow-game"
      aria-label="Mobile bottom navigation"
    >
      {MOBILE_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-[#6541F5] dark:text-[#7C5CFA] font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#6541F5] dark:bg-[#7C5CFA] mt-0.5" />
              )}
            </>
          )}
        </NavLink>
      ))}

      {/* Quick Search Button in Bottom Nav */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl text-text-muted hover:text-text-primary transition-all duration-150"
        aria-label="Open command search"
      >
        <div className="p-1 rounded-lg">
          <Search className="w-5 h-5" />
        </div>
        <span className="text-[10px] tracking-tight">Search</span>
      </button>
    </nav>
  );
}
