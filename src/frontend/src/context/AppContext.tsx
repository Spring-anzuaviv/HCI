/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect, useRef, useTransition } from 'react';
import type { Machine, Staff, Config, Order, Page, ModalOrderParams, OrderFilter, WorkShift, QueueSnapshot } from '../types';
import { MOCK_STAFF, MOCK_CONFIG } from '../data/mockData';
import { apiGet } from '../api/client';
import { getOperations } from '../api/operations';
import type { StoreSession } from '../api/auth';
import { listEmployees, listShifts } from '../api/staff';
import { getShiftSummary, type ShiftSummary } from '../api/summary';
import { AppContext, type ToastItem } from './app-context';

interface AppProviderProps {
  children: React.ReactNode;
  /** Session đã được xác thực từ App — bỏ qua bước gọi /auth/me lần 2 */
  initialStore: StoreSession;
}

export function AppProvider({ children, initialStore }: AppProviderProps) {
  const [currentPage, setCurrentPageState] = useState<Page>('db');
  const [, startNavigationTransition] = useTransition();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [config, setConfig] = useState<Config>(MOCK_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  // Khởi tạo trực tiếp từ initialStore — không cần gọi /auth/me lần 2
  const [store] = useState<StoreSession | null>(initialStore);
  const [selectedWorkDate, setSelectedWorkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);
  const [queueSnapshot, setQueueSnapshot] = useState<QueueSnapshot | null>(null);
  const [operationsLoading, setOperationsLoading] = useState(true);
  const [queueRefreshing, setQueueRefreshing] = useState(false);
  const [operationsError, setOperationsError] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [orderModalParams, setOrderModalParams] = useState<ModalOrderParams | null>(null);

  // ── In-flight guards: tránh nhiều request song song khi user click nhanh ──
  const opsInflightRef = useRef<Promise<void> | null>(null);
  const staffInflightRef = useRef<Promise<void> | null>(null);
  const opsRefreshQueuedRef = useRef(false);
  const staffRefreshQueuedRef = useRef(false);

  // ── Dùng ref để đọc snapshot hiện tại mà không tạo deps ──
  const hasSnapshotRef = useRef(false);
  useEffect(() => { hasSnapshotRef.current = queueSnapshot !== null; }, [queueSnapshot]);

  const showToast = useCallback((msg: string, type = 'grn') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const openM = useCallback((id: string) => setOpenModal(id), []);
  const closeM = useCallback((id: string) => { void id; setOpenModal(null); }, []);
  const setCurrentPage = useCallback((page: Page) => {
    startNavigationTransition(() => {
      setCurrentPageState(current => current === page ? current : page);
    });
  }, []);

  // ── refreshOperations: deps ổn định, dùng ref để biết có snapshot chưa ──
  const refreshOperations = useCallback(async () => {
    if (!store) return;
    // Nếu có mutation trong lúc đang tải, gộp thành đúng một lượt tải kế tiếp.
    if (opsInflightRef.current) {
      opsRefreshQueuedRef.current = true;
      await opsInflightRef.current;
      return;
    }

    if (hasSnapshotRef.current) {
      setQueueRefreshing(true);
    } else {
      setOperationsLoading(true);
    }
    setOperationsError('');
    const refreshPromise = (async () => {
      do {
        opsRefreshQueuedRef.current = false;
        try {
          const data = await getOperations(store.storeId);
          setOrders(data.orders.map(mapApiOrder));
          setMachines(data.machines.map(mapApiMachine));
          setQueueSnapshot(data.queue);
          hasSnapshotRef.current = true;
        } catch (error) {
          setOperationsError(error instanceof Error ? error.message : 'Không thể tải trạng thái vận hành');
          break;
        }
      } while (opsRefreshQueuedRef.current);
    })();
    opsInflightRef.current = refreshPromise;
    try {
      await refreshPromise;
    } finally {
      setOperationsLoading(false);
      setQueueRefreshing(false);
      opsInflightRef.current = null;
    }
  // store là stable (chỉ set 1 lần từ initialStore) — không cần queueSnapshot trong deps
  }, [store]);

  const refreshStaff = useCallback(async () => {
    if (!store) return;
    if (staffInflightRef.current) {
      staffRefreshQueuedRef.current = true;
      await staffInflightRef.current;
      return;
    }
    const refreshPromise = (async () => {
      do {
        staffRefreshQueuedRef.current = false;
        const [employeeData, shiftData] = await Promise.all([listEmployees(store.storeId), listShifts(store.storeId, selectedWorkDate)]);
         const mappedShifts = shiftData.map((shift: any) => ({ id: shift.shiftId, name: shift.name, start: formatShiftTime(shift.startAt), end: formatShiftTime(shift.endAt), employees: shift.employees?.map((item: any) => ({ id: item.employee.employeeId, name: item.employee.name, phone: item.employee.phone ?? '', role: item.employee.role, shiftId: shift.shiftId, ava: item.employee.name.split(' ').map((part: string) => part[0]).join('').slice(-2).toUpperCase() })) ?? [] }));
        setWorkShifts(mappedShifts);
        setConfig(previous => ({ ...previous, shifts: mappedShifts.map(shift => ({ id: shift.id, name: shift.name, start: shift.start, end: shift.end })) }));
        setStaff(employeeData.map((employee: any) => ({ id: employee.employeeId, name: employee.name, phone: employee.phone ?? '', role: employee.role, shiftId: mappedShifts.find(shift => shift.employees.some((item: { id: number }) => item.id === employee.employeeId))?.id ?? 0, ava: employee.name.split(' ').map((part: string) => part[0]).join('').slice(-2).toUpperCase() })));
      } while (staffRefreshQueuedRef.current);
    })();
    staffInflightRef.current = refreshPromise;
    try {
      await refreshPromise;
    } catch (err) {
      console.warn('[refreshStaff] Lỗi khi tải danh sách nhân viên:', err);
    } finally {
      staffInflightRef.current = null;
    }
  }, [store, selectedWorkDate]);

  const refreshShiftSummary = useCallback(async () => {
    if (!store) return;
    try { setShiftSummary(await getShiftSummary(store.storeId)); } catch (err) { console.warn('[refreshShiftSummary]', err); }
  }, [store]);

  const refreshOrders = refreshOperations;

  // Nhường lượt render đầu tiên cho giao diện rồi tải dữ liệu ở macrotask kế tiếp.
  useEffect(() => {
    const id = window.setTimeout(() => { void refreshOperations(); }, 0);
    return () => window.clearTimeout(id);
  }, [refreshOperations]);
  useEffect(() => {
    const id = window.setTimeout(() => { void refreshStaff(); }, 0);
    return () => window.clearTimeout(id);
  }, [refreshStaff]);
  useEffect(() => {
    const id = window.setTimeout(() => { void refreshShiftSummary(); }, 0);
    return () => window.clearTimeout(id);
  }, [refreshShiftSummary]);

  // Polling và expose refreshMachines để component có thể gọi thủ công (vd sau khi reset máy)
  const refreshMachines = useCallback(async () => {
    if (!store) return;
    try {
      const machineData = await apiGet<Record<string, unknown>[]>(`/stores/${store.storeId}/machines`);
      setMachines(machineData.map(mapApiMachine));
      setOperationsError('');
    } catch (error) {
      setOperationsError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái máy');
    }
  }, [store]);

  useEffect(() => {
    if (!store) return;
    const machineInterval = window.setInterval(() => { void refreshMachines(); }, 60_000);
    return () => { window.clearInterval(machineInterval); };
  }, [store, refreshMachines]);

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      machines, setMachines, refreshMachines,
      staff, setStaff,
      config, setConfig,
      orders, setOrders, store, refreshOrders, refreshStaff, selectedWorkDate, setSelectedWorkDate, workShifts, shiftSummary, refreshShiftSummary, orderSearch, setOrderSearch, orderFilter, setOrderFilter, queueSnapshot, operationsLoading, queueRefreshing, operationsError, refreshOperations,
      toasts, showToast,
      openModal, setOpenModal, openM, closeM,
      orderModalParams, setOrderModalParams,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Giờ ca được lưu theo thành phần UTC để giữ nguyên giờ nhân viên nhập.
function formatShiftTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

function mapApiOrder(order: any): Order {
  const service = order.serviceType === 'WASH_DRY' ? 'combo' : order.serviceType === 'DRY' ? 'dry' : 'wash';
  const status = (order.status === 'COMPLETED' || order.status === 'NOTIFIED') ? 'done' : 'pending';
  const eta = order.estimatedAt ? new Date(order.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
  return {
    id: String(order.orderId), orderId: order.orderId, name: order.customer.name, phone: order.customer.phone,
    receivedAt: new Date(order.createdAt).toLocaleString('vi-VN'), service, serviceType: order.serviceType,
    kg: order.weightKg, deadline: order.pickupAt ? new Date(order.pickupAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
    deadlineFull: order.pickupAt ? new Date(order.pickupAt).toLocaleString('vi-VN') : '', status,
    atRisk: order.riskLevel === 'AT_RISK' || order.riskLevel === 'NOT_FEASIBLE', isWaiting: order.status === 'WAITING',
    chipLabel: order.currentMachine ? `${order.currentMachine.name} · ${order.currentStage ?? ''} · Dự kiến xong: ${eta}` : undefined,
    machine: order.currentMachine?.name, readyAt: order.readyAt, pickupAt: order.pickupAt, estimatedAt: order.estimatedAt,
    groupCode: order.groupCode, riskLevel: order.riskLevel, currentStage: order.currentStage,
    currentMachine: order.currentMachine, nextAction: order.nextAction, priorityReason: order.priorityReason, stages: order.stages, groupETA: order.groupETA,
    rawStatus: order.status,
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
