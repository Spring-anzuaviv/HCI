/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Machine, Staff, Config, Order, Page, ModalOrderParams, OrderFilter, WorkShift, QueueSnapshot } from '../types';
import { MOCK_STAFF, MOCK_CONFIG } from '../data/mockData';
import { apiGet } from '../api/client';
import type { StoreSession } from '../api/auth';
import { listEmployees, listShifts } from '../api/staff';
import { getShiftSummary, type ShiftSummary } from '../api/summary';

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
  queueSnapshot: QueueSnapshot | null;
  operationsLoading: boolean;
  operationsError: string;
  refreshOperations: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshStaff: () => Promise<void>;
  selectedWorkDate: string;
  setSelectedWorkDate: React.Dispatch<React.SetStateAction<string>>;
  workShifts: WorkShift[];
  shiftSummary: ShiftSummary | null;
  refreshShiftSummary: () => Promise<void>;

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
  const [machines, setMachines] = useState<Machine[]>([]);
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [config, setConfig] = useState<Config>(MOCK_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [store, setStore] = useState<StoreSession | null>(null);
  const [selectedWorkDate, setSelectedWorkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);
  const [queueSnapshot, setQueueSnapshot] = useState<QueueSnapshot | null>(null);
  const [operationsLoading, setOperationsLoading] = useState(true);
  const [operationsError, setOperationsError] = useState('');
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

  const refreshOperations = useCallback(async () => {
    if (!store) return;
    setOperationsLoading(true);
    setOperationsError('');
    try {
      const [data, machineData, queueData] = await Promise.all([
        apiGet<Record<string, unknown>[]>(`/stores/${store.storeId}/orders?limit=100`),
        apiGet<Record<string, unknown>[]>(`/stores/${store.storeId}/machines`),
        apiGet<QueueSnapshot>(`/stores/${store.storeId}/queue`),
      ]);
      setOrders(data.map(mapApiOrder));
      setMachines(machineData.map(mapApiMachine));
      setQueueSnapshot(queueData);
    } catch (error) {
      setQueueSnapshot(null);
      setOperationsError(error instanceof Error ? error.message : 'Không thể tải trạng thái vận hành');
    } finally {
      setOperationsLoading(false);
    }
  }, [store]);
  const refreshStaff = useCallback(async () => {
    if (!store) return;
    const [employeeData, shiftData] = await Promise.all([listEmployees(store.storeId), listShifts(store.storeId, selectedWorkDate)]);
    const mappedShifts = shiftData.map((shift: any) => ({ id: shift.shiftId, name: shift.name, start: new Date(shift.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), end: new Date(shift.endAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), employees: shift.employees?.map((item: any) => ({ id: item.employee.employeeId, name: item.employee.name, phone: item.employee.phone ?? '', role: item.employee.role, shiftId: shift.shiftId, ava: item.employee.name.split(' ').map((part: string) => part[0]).join('').slice(-2).toUpperCase() })) ?? [] }));
    setWorkShifts(mappedShifts);
    setConfig(previous => ({ ...previous, shifts: mappedShifts.map(shift => ({ id: shift.id, name: shift.name, start: shift.start, end: shift.end })) }));
    setStaff(employeeData.map((employee: any) => ({ id: employee.employeeId, name: employee.name, phone: employee.phone ?? '', role: employee.role, shiftId: mappedShifts.find(shift => shift.employees.some((item: { id: number }) => item.id === employee.employeeId))?.id ?? 0, ava: employee.name.split(' ').map((part: string) => part[0]).join('').slice(-2).toUpperCase() })));
  }, [store, selectedWorkDate]);
  const refreshShiftSummary = useCallback(async () => {
    if (!store) return;
    setShiftSummary(await getShiftSummary(store.storeId));
  }, [store]);

  const refreshOrders = refreshOperations;

  // The provider is mounted only after App has confirmed the cookie session.
  useEffect(() => {
    apiGet<StoreSession>('/auth/me').then(setStore).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (store) void refreshOperations();
  }, [store, refreshOperations]);
  useEffect(() => { if (store) void refreshStaff(); }, [store, refreshStaff]);
  useEffect(() => { if (store) void refreshShiftSummary(); }, [store, refreshShiftSummary]);

  // UC-SQ-02: chỉ polling projection máy từ database để phát hiện mẻ vừa xong.
  useEffect(() => {
    if (!store) return;
    const pollMachines = async () => {
      try {
        const machineData = await apiGet<Record<string, unknown>[]>(`/stores/${store.storeId}/machines`);
        setMachines(machineData.map(mapApiMachine));
        setOperationsError('');
      } catch (error) {
        setOperationsError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái máy');
      }
    };
    const intervalId = window.setInterval(() => { void pollMachines(); }, 15_000);
    return () => window.clearInterval(intervalId);
  }, [store]);

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      machines, setMachines,
      staff, setStaff,
      config, setConfig,
      orders, setOrders, store, refreshOrders, refreshStaff, selectedWorkDate, setSelectedWorkDate, workShifts, shiftSummary, refreshShiftSummary, orderSearch, setOrderSearch, orderFilter, setOrderFilter, queueSnapshot, operationsLoading, operationsError, refreshOperations,
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
     currentMachine: order.currentMachine, nextAction: order.nextAction, priorityReason: order.priorityReason, stages: order.stages, groupETA: order.groupETA,
  };
}

function mapApiMachine(machine: any): Machine {
  const type = machine.type === 'DRYER' ? 'dry' : 'wash';
  const activeStage = machine.currentStage ?? machine.stages?.find((stage: any) => stage.status === 'RUNNING');
  const state = machine.operationalState === 'NEEDS_REVIEW'
    ? 'review'
    : machine.status === 'BROKEN'
      ? 'broken'
      : machine.status === 'INACTIVE'
        ? 'inactive'
        : machine.status === 'RUNNING'
          ? type
          : 'trong';
  return {
    id: machine.machineId, name: machine.name, type, kg: machine.capacityKg, time: machine.processingMinutes,
    st: state, status: machine.status, statusRaw: machine.status, locked: machine.locked, user: activeStage?.order?.customer?.name ?? '',
    timeLeft: machine.timeLeft ?? null, operationalState: machine.operationalState,
    reviewReasons: machine.reviewReasons ?? [], currentStage: machine.currentStage ?? null,
    nextPlannedStage: machine.nextPlannedStage ?? null,
    finishAt: machine.finishAt ?? null, completionDue: Boolean(machine.completionDue),
    completionActionAllowed: Boolean(machine.completionActionAllowed),
    completionBlockedReason: machine.completionBlockedReason ?? null,
  };
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
