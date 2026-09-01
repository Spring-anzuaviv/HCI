/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiPatch, apiPost } from './client';
import type { MachineCompletionResult } from '../types';

export const startRun = (orderId: number, stage: string, machineId: number) => 
  apiPost<any>(`/orders/${orderId}/stages/${stage}/start`, { machineId });

export const completeRun = (orderStageId: number) => 
  apiPatch<MachineCompletionResult>(`/order-stages/${orderStageId}/complete`);

export const cancelOrder = (orderId: number) =>
  apiPatch<{ status: string }>(`/orders/${orderId}/cancel`);

export const checkExpedite = (orderId: number, _storeId: number, newPickupAt: string) => 
  apiPost<any>(`/orders/${orderId}/expedite`, { newPickupAt });

export const confirmExpedite = (orderId: number, _storeId: number, newPickupAt: string, reason: string, simulationToken: string) => 
  apiPost<any>(`/orders/${orderId}/expedite/confirm`, { newPickupAt, reason, simulationToken });
