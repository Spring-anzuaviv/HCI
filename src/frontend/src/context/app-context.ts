import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { StoreSession } from '../api/auth';
import type { ShiftSummary } from '../api/summary';
import type {
  Config,
  Machine,
  ModalOrderParams,
  Order,
  OrderFilter,
  Page,
  QueueSnapshot,
  Staff,
  WorkShift,
} from '../types';

export interface ToastItem {
  id: number;
  msg: string;
  type: 'grn' | 'red' | 'pu' | string;
}

export interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  machines: Machine[];
  setMachines: Dispatch<SetStateAction<Machine[]>>;
  staff: Staff[];
  setStaff: Dispatch<SetStateAction<Staff[]>>;
  config: Config;
  setConfig: Dispatch<SetStateAction<Config>>;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  orderSearch: string;
  setOrderSearch: Dispatch<SetStateAction<string>>;
  orderFilter: OrderFilter;
  setOrderFilter: Dispatch<SetStateAction<OrderFilter>>;
  store: StoreSession | null;
  queueSnapshot: QueueSnapshot | null;
  operationsLoading: boolean;
  queueRefreshing: boolean;
  operationsError: string;
  refreshOperations: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshStaff: () => Promise<void>;
  selectedWorkDate: string;
  setSelectedWorkDate: Dispatch<SetStateAction<string>>;
  workShifts: WorkShift[];
  shiftSummary: ShiftSummary | null;
  refreshShiftSummary: () => Promise<void>;
  toasts: ToastItem[];
  showToast: (message: string, type?: string) => void;
  openModal: string | null;
  setOpenModal: (id: string | null) => void;
  openM: (id: string) => void;
  closeM: (id: string) => void;
  orderModalParams: ModalOrderParams | null;
  setOrderModalParams: (params: ModalOrderParams | null) => void;
}

export const AppContext = createContext<AppContextType | null>(null);
