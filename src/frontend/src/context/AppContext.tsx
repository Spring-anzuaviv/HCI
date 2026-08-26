import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Machine, Staff, Config, Order, Page, ModalOrderParams } from '../types';
import { MOCK_MACHINES, MOCK_STAFF, MOCK_CONFIG, MOCK_ORDERS } from '../data/mockData';

// ─── Toast ───
export interface ToastItem {
  id: number;
  msg: string;
  type: 'grn' | 'red' | 'pu' | string;
}

// ─── Context Type ───
interface AppContextType {
  // Navigation
  currentPage: Page;
  setCurrentPage: (p: Page) => void;

  // State
  machines: Machine[];
  setMachines: React.Dispatch<React.SetStateAction<Machine[]>>;
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

  // Toasts
  toasts: ToastItem[];
  showToast: (msg: string, type?: string) => void;

  // Modal
  openModal: string | null;
  setOpenModal: (id: string | null) => void;
  openM: (id: string) => void;
  closeM: (id: string) => void;

  // Order modal params
  orderModalParams: ModalOrderParams | null;
  setOrderModalParams: (p: ModalOrderParams | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('db');
  const [machines, setMachines] = useState<Machine[]>(MOCK_MACHINES);
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [config, setConfig] = useState<Config>(MOCK_CONFIG);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [orderModalParams, setOrderModalParams] = useState<ModalOrderParams | null>(null);

  const showToast = useCallback((msg: string, type = 'grn') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const openM = useCallback((id: string) => setOpenModal(id), []);
  const closeM = useCallback((_id: string) => setOpenModal(null), []);

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      machines, setMachines,
      staff, setStaff,
      config, setConfig,
      orders, setOrders,
      toasts, showToast,
      openModal, setOpenModal, openM, closeM,
      orderModalParams, setOrderModalParams,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
