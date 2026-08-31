// ─── Kiểu dữ liệu chung cho toàn bộ app ───

export type SvcType = 'wash' | 'dry' | 'combo';
export type MachineStatus = 'trong' | 'wash' | 'dry' | 'hong' | 'ngung' | 'broken' | 'inactive' | 'review';
export type OrderStatus = 'pending' | 'done';

export interface Machine {
  id: number;
  name: string;
  type: 'wash' | 'dry';
  kg: number;
  time: number; // phút
  st: MachineStatus;
  statusRaw?: string;
  user: string;
  timeLeft: number | null; // phút còn lại
  status?: 'AVAILABLE' | 'RUNNING' | 'BROKEN' | 'INACTIVE';
  locked?: boolean;
  operationalState?: 'NORMAL' | 'NEEDS_REVIEW';
  reviewReasons?: string[];
  currentStage?: ApiMachineStage | null;
  nextPlannedStage?: ApiMachineStage | null;
  finishAt?: string | null;
  completionDue?: boolean;
  completionActionAllowed?: boolean;
  completionBlockedReason?: string | null;
}

export interface Staff {
  id: number;
  name: string;
  phone: string;
  shiftId: number;
  ava: string;
  role?: string;
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
  groupETA?: string | null;
  groupCode?: string | null;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  currentStage?: string;
  currentMachine?: { name: string; type: string } | null;
  nextAction?: string;
  priorityReason?: string;
  stages?: ApiOrderStage[];
}

export interface WorkShift extends Shift {
  employees: Staff[];
}

export interface ApiOrderStage {
  orderStageId: number;
  orderId?: number;
  stage: string;
  status: string;
  machineId: number | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  actualStartedAt: string | null;
  actualEndedAt: string | null;
  machine?: { name: string; type: string; processingMinutes: number } | null;
}

export interface ApiMachineStage extends ApiOrderStage {
  order?: {
    orderId: number;
    status: string;
    serviceType: string;
    customer?: { name: string; phone: string };
  };
}

export type QueueRisk = 'FEASIBLE' | 'AT_RISK' | 'NOT_FEASIBLE' | 'UNKNOWN';

export interface QueueItem {
  rank: number;
  orderId: number;
  customer: { name: string; phone: string } | null;
  status: string;
  serviceType: string;
  weightKg: number;
  readyAt: string | null;
  pickupAt: string | null;
  estimatedAt: string | null;
  groupCode: string | null;
  currentStage: string;
  nextStage: string | null;
  orderStageId: number | null;
  machineId: number | null;
  machineName: string | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  riskLevel: QueueRisk;
  slackMinutes: number | null;
  riskMessage: string;
  missingFields: string[];
  priorityReason: string;
  priorityReasons: string[];
  nextAction: string;
  operationalState: 'NORMAL' | 'NEEDS_REVIEW';
  reviewReasons: string[];
  canStart: boolean;
  recommendationBlockedReasons: string[];
  remainingStages: number;
  createdAt: string;
}

export interface QueueSnapshot {
  generatedAt: string;
  recommendation: QueueItem | null;
  recommendations: QueueItem[];
  items: QueueItem[];
  attentionItems: QueueItem[];
  summary: {
    totalOrders: number;
    atRiskOrders: number;
    unknownDeadlineOrders: number;
    needsReviewOrders: number;
    availableMachines: number;
    runningMachines: number;
    statusCounts: Record<string, number>;
  };
}

export interface MachineCompletionResult {
  completedStage: ApiMachineStage;
  orderStatus: string;
  machine: {
    machineId: number;
    name: string;
    status: string;
  } | null;
  recommendation: QueueItem | null;
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
  readOnly?: boolean;
}
