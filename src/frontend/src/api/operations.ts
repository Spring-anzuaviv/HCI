import { apiGet } from './client';
import type { QueueSnapshot } from '../types';

export interface OperationsPayload {
  orders: Record<string, unknown>[];
  machines: Record<string, unknown>[];
  queue: QueueSnapshot;
}

export const getOperations = (storeId: number) =>
  apiGet<OperationsPayload>(`/stores/${storeId}/operations`);
