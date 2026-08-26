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
}

export interface Config {
  shifts: Shift[];
  shopName: string;
}

export type Page = 'db' | 'q' | 'orders' | 'n' | 'stats';

export interface ModalOrderParams {
  name: string;
  deadline: string;
  atRisk: boolean;
  svcType: SvcType;
  isWaiting: boolean;
}
