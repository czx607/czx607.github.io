import { NavLink } from 'react-router-dom';
import { ScanLine, Receipt, User } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: typeof ScanLine;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '扫码', icon: ScanLine, end: true },
  { path: '/bill', label: '账单', icon: Receipt },
  { path: '/mine', label: '我的', icon: User },
];

export default function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-card/90 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform`}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
