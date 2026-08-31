/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Machine, Staff, Config, Order, Page, ModalOrderParams, OrderFilter } from '../types';
import { MOCK_MACHINES, MOCK_STAFF, MOCK_CONFIG } from '../data/mockData';
import { apiGet } from '../api/client';
import type { StoreSession } from '../api/auth';

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
  orderSearch: string;
  setOrderSearch: React.Dispatch<React.SetStateAction<string>>;
  orderFilter: OrderFilter;
  setOrderFilter: React.Dispatch<React.SetStateAction<OrderFilter>>;
  store: StoreSession | null;
  refreshOrders: () => Promise<void>;

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [store, setStore] = useState<StoreSession | null>(null);
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
  const closeM = useCallback((id: string) => { void id; setOpenModal(null); }, []);

  const refreshOrders = useCallback(async () => {
    if (!store) return;
    const [data, machineData] = await Promise.all([
      apiGet<Record<string, unknown>[]>(`/stores/${store.storeId}/orders?limit=100`),
      apiGet<Record<string, unknown>[]>(`/stores/${store.storeId}/machines`),
    ]);
    setOrders(data.map(mapApiOrder));
    setMachines(machineData.map(mapApiMachine));
  }, [store]);

  // The provider is mounted only after App has confirmed the cookie session.
  useEffect(() => {
    apiGet<StoreSession>('/auth/me').then(setStore).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (store) void refreshOrders();
  }, [store, refreshOrders]);

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      machines, setMachines,
      staff, setStaff,
      config, setConfig,
      orders, setOrders, store, refreshOrders, orderSearch, setOrderSearch, orderFilter, setOrderFilter,
      toasts, showToast,
      openModal, setOpenModal, openM, closeM,
      orderModalParams, setOrderModalParams,
    }}>
      {children}
    </AppContext.Provider>
  );
}

function mapApiOrder(order: any): Order {
  const service = order.serviceType === 'WASH_DRY' ? 'combo' : order.serviceType === 'DRY' ? 'dry' : 'wash';
  const status = order.status === 'COMPLETED' ? 'done' : 'pending';
  const eta = order.estimatedAt ? new Date(order.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
  return {
    id: String(order.orderId), orderId: order.orderId, name: order.customer.name, phone: order.customer.phone,
    receivedAt: new Date(order.createdAt).toLocaleString('vi-VN'), service, serviceType: order.serviceType,
    kg: order.weightKg, deadline: order.pickupAt ? new Date(order.pickupAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
    deadlineFull: order.pickupAt ? new Date(order.pickupAt).toLocaleString('vi-VN') : '', status,
    atRisk: order.riskLevel === 'HIGH' || order.riskLevel === 'MEDIUM', isWaiting: order.status === 'WAITING',
    chipLabel: order.currentMachine ? `${order.currentMachine.name} · ${order.currentStage ?? ''} · Dự kiến xong: ${eta}` : undefined,
    machine: order.currentMachine?.name, readyAt: order.readyAt, pickupAt: order.pickupAt, estimatedAt: order.estimatedAt,
    groupCode: order.groupCode, riskLevel: order.riskLevel, currentStage: order.currentStage,
    currentMachine: order.currentMachine, nextAction: order.nextAction, priorityReason: order.priorityReason, stages: order.stages,
  };
}

function mapApiMachine(machine: any): Machine {
  const type = machine.type === 'DRYER' ? 'dry' : 'wash';
  const activeStage = machine.stages?.[0];
  return {
    id: machine.machineId, name: machine.name, type, kg: machine.capacityKg, time: machine.processingMinutes,
    st: machine.status === 'RUNNING' ? type : 'trong', user: activeStage?.order?.customer?.name ?? '',
    timeLeft: machine.timeLeft ?? 0,
  };
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
