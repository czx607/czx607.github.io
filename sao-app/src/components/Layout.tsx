import { Outlet, useLocation } from 'react-router-dom';
import BottomTabBar from '@/components/BottomTabBar';

export function Layout() {
  const { pathname } = useLocation();
  const showTabBar = !pathname.startsWith('/result/');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="w-full" style={{ height: 'env(safe-area-inset-top)' }} />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {showTabBar && (
        <div
          className="w-full"
          style={{
            height: 'calc(4rem + env(safe-area-inset-bottom))',
          }}
        />
      )}

      {showTabBar && <BottomTabBar />}
    </div>
  );
}
