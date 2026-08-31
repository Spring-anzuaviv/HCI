// ─── Kiểu dữ liệu chung cho toàn bộ app ───

export type SvcType = 'wash' | 'dry' | 'combo';
export type MachineStatus = 'trong' | 'wash' | 'dry';
export type OrderStatus = 'pending' | 'done';

export interface Machine {
  id: number;
  name: string;
  type: 'wash' | 'dry';
  kg: number;
  time: number; // phút
  st: MachineStatus;
  user: string;
  timeLeft: number; // phút còn lại
}

export interface Staff {
  id: number;
  name: string;
  phone: string;
  shiftId: number;
  ava: string;
}

export interface Shift {
  id: number;
  name: string;
  start: string;
  end: string;
}

export interface Order {
  id: string;
  name: string;
  phone: string;
  receivedAt: string;
  service: SvcType;
  kg: number;
  deadline: string; // HH:mm
  deadlineFull: string; // hiển thị đầy đủ
  status: OrderStatus;
  atRisk: boolean;
  isWaiting: boolean;
  priority?: number;
  chipLabel?: string;
  chipStyle?: { background: string; color: string };
  machine?: string;
  orderId?: number;
  serviceType?: string;
  readyAt?: string | null;
  pickupAt?: string | null;
  estimatedAt?: string | null;
  groupCode?: string | null;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  currentStage?: string;
  currentMachine?: { name: string; type: string } | null;
  nextAction?: string;
  priorityReason?: string;
  stages?: ApiOrderStage[];
}

export interface ApiOrderStage {
  orderStageId: number;
  stage: string;
  status: string;
  machineId: number | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  actualStartedAt: string | null;
  actualEndedAt: string | null;
  machine?: { name: string; type: string; processingMinutes: number } | null;
}

export interface Config {
  shifts: Shift[];
  shopName: string;
}

export type Page = 'db' | 'q' | 'orders' | 'n' | 'stats';
export type OrderFilter = 'all' | OrderStatus;

export interface ModalOrderParams {
  orderId?: number;
  name: string;
  phone?: string;
  deadline: string;
  atRisk: boolean;
  svcType: SvcType;
  isWaiting: boolean;
}
