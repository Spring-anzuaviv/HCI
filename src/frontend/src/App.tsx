import { useEffect, useState } from 'react';
import { getCurrentStore } from './api/auth';
import { AppProvider } from './context/AppContext';
import SVGSprite from './components/SVGSprite';
// Note: styles are in index.css
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import RightPanel from './components/RightPanel';
import { ToastContainer } from './components/Modals';
import { AddOrderModal, SettingsModal, MachineModal, OrderDetailModal } from './components/AppModals';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QueuePage from './pages/QueuePage';
import OrdersPage from './pages/OrdersPage';
import NotifyPage from './pages/NotifyPage';
import StatsPage from './pages/StatsPage';

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
          {currentPage === 'db'     && <DashboardPage />}
          {currentPage === 'q'      && <QueuePage />}
          {currentPage === 'orders' && <OrdersPage />}
          {currentPage === 'n'      && <NotifyPage />}
          {currentPage === 'stats'  && <StatsPage />}
        </div>
      </main>
      <RightPanel />

      {/* All Modals */}
      <AddOrderModal />
      <SettingsModal />
      <MachineModal />
      <OrderDetailModal />

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
