import { useEffect, useState, lazy, Suspense } from 'react';
import { getCurrentStore } from './api/auth';
import { AppProvider } from './context/AppContext';
import SVGSprite from './components/SVGSprite';
// Note: styles are in index.css
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import RightPanel from './components/RightPanel';
import MachineCompletionAlert from './components/MachineCompletionAlert';
import { ToastContainer } from './components/Modals';
import { AddOrderModal, SettingsModal, MachineModal, EmployeeModal, AssignEmployeeModal, RemoveEmployeeModal, OrderDetailModal } from './components/AppModals';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QueuePage from './pages/OperationsQueuePage';
import NotifyPage from './pages/NotifyPage';
// StatsPage ít dùng — lazy load để không block bundle chính
const StatsPage = lazy(() => import('./pages/StatsPage'));

import { useApp } from './context/AppContext';

// ─── Inner App (cần context) ───
function AppShell() {
  const { currentPage } = useApp();

  return (
    <div className="shell" id="app-shell">
      <SVGSprite />
      <Sidebar />
      <main className="main">
        <TopBar />
        <div className="pwrap">
          {/* Dùng CSS visibility thay vì && để trang không bị unmount khi chuyển tab */}
          <div hidden={currentPage !== 'db'}><DashboardPage /></div>
          <div hidden={currentPage !== 'q'}><QueuePage /></div>
          <div hidden={currentPage !== 'n'}><NotifyPage /></div>
          <Suspense fallback={<div style={{ padding: 30, color: 'var(--ts)' }}>Đang tải...</div>}>
            <div hidden={currentPage !== 'stats'}><StatsPage /></div>
          </Suspense>
        </div>
      </main>
      <RightPanel />

      {/* All Modals */}
      <AddOrderModal />
      <SettingsModal />
      <MachineModal />
      <EmployeeModal />
      <AssignEmployeeModal />
      <RemoveEmployeeModal />
      <OrderDetailModal />
      <MachineCompletionAlert />

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}

// ─── Root App ───
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getCurrentStore().then(() => setIsLoggedIn(true)).catch(() => setIsLoggedIn(false));
  }, []);

  if (isLoggedIn === null) return <div style={{ padding: 40, fontFamily: 'Inter, sans-serif' }}>Đang kiểm tra phiên đăng nhập...</div>;

  if (!isLoggedIn) {
    return (
      <>
        <SVGSprite />
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      </>
    );
  }

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
