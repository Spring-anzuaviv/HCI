import { apiGet } from './client';

export interface ShiftSummary {
  generatedAt: string;
  totals: { orders: number; completed: number; active: number; atRisk: number; waiting: number };
  machines: { running: number; available: number; total: number };
  attention: Array<{ orderId: number; customerName: string; status: string; riskLevel: string; nextAction: string; pickupAt: string | null }>;
}

export const getShiftSummary = (storeId: number) => apiGet<ShiftSummary>(`/stores/${storeId}/shift-summary`);
