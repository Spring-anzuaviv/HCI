import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { getCurrentStore } from './api/auth';
import type { StoreSession } from './api/auth';
import { AppProvider } from './context/AppContext';
// Note: styles are in index.css
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import RightPanel from './components/RightPanel';
import MachineCompletionAlert from './components/MachineCompletionAlert';
import { ToastContainer } from './components/Modals';
import { AddOrderModal, SettingsModal, ShiftSettingsModal, MachineModal, EmployeeModal, AssignEmployeeModal, RemoveEmployeeModal, OrderDetailModal } from './components/AppModals';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QueuePage from './pages/OperationsQueuePage';
// Các trang không phải màn hình đầu tiên chỉ tải khi nhân viên thực sự mở.
const NotifyPage = lazy(() => import('./pages/NotifyPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));

import { useApp } from './context/useApp';

// ─── Inner App (cần context) ───
function ClickGuard({ children }: { children: ReactNode }) {
  const lastClickRef = useRef(new WeakMap<Element, number>());

  // Chặn click lặp nhanh cho toàn bộ control điều hướng/mở-đóng popup.
  // Mutation vẫn có khóa async riêng để giữ disabled đến khi request kết thúc.
  const guardRepeatedClick = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const control = target.closest('button, [role="button"]');
    if (!control || !event.currentTarget.contains(control)) return;
    if (control instanceof HTMLButtonElement && control.disabled) return;

    const now = performance.now();
    const previous = lastClickRef.current.get(control) ?? 0;
    if (now - previous < 300) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    lastClickRef.current.set(control, now);
  }, []);

  return <div style={{ display: 'contents' }} onClickCapture={guardRepeatedClick}>{children}</div>;
}

function AppShell() {
  const { currentPage, openModal } = useApp();

  const activePage = currentPage === 'db'
    ? <DashboardPage />
    : currentPage === 'n'
      ? <NotifyPage />
      : currentPage === 'stats'
        ? <StatsPage />
        : <QueuePage />;

  const activeModal = openModal === 'am'
    ? <AddOrderModal />
    : openModal === 'sm'
      ? <SettingsModal />
      : openModal === 'sm-shifts'
        ? <ShiftSettingsModal />
      : openModal?.startsWith('sm-machine')
        ? <MachineModal />
        : openModal?.startsWith('sm-staff')
          ? <EmployeeModal />
          : openModal?.startsWith('sm-assign')
            ? <AssignEmployeeModal />
            : openModal?.startsWith('sm-remove')
              ? <RemoveEmployeeModal />
              : openModal === 'om'
                ? <OrderDetailModal />
                : null;

  return (
    <div className="shell" id="app-shell">
      <Sidebar />
      <main className="main">
        <TopBar />
        <div className="pwrap">
          <Suspense fallback={<div style={{ padding: 30, color: 'var(--ts)' }}>Đang tải...</div>}>
            {activePage}
          </Suspense>
        </div>
      </main>
      <RightPanel />

      {/* Chỉ mount popup đang dùng để tránh chạy state/effect của mọi popup cùng lúc. */}
      {activeModal}
      <MachineCompletionAlert />

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}

// ─── Root App ───
export default function App() {
  // null = chưa biết, false = chưa đăng nhập, StoreSession = đã đăng nhập
  const [authState, setAuthState] = useState<StoreSession | null | false>(null);
  // Tránh gọi API 2 lần khi StrictMode mount 2 lần
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    getCurrentStore()
      .then(store => setAuthState(store))
      .catch(() => setAuthState(false));
  }, []);

  if (authState === null) return <div style={{ padding: 40, fontFamily: 'Inter, sans-serif' }}>Đang kiểm tra phiên đăng nhập...</div>;

  if (authState === false) {
    return (
      <ClickGuard>
        <LoginPage onLogin={store => setAuthState(store)} />
      </ClickGuard>
    );
  }

  return (
    <ClickGuard>
      {/* Truyền initialStore để AppContext không cần gọi /auth/me lần nữa */}
      <AppProvider initialStore={authState}>
        <AppShell />
      </AppProvider>
    </ClickGuard>
  );
}
