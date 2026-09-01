/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiDelete, apiPatch, apiPost } from './client';
export const createMachine = (storeId: number, data: unknown) => apiPost<any>(`/stores/${storeId}/machines`, data);
export const updateMachine = (id: number, data: unknown) => apiPatch<any>(`/machines/${id}`, data);
export const deleteMachine = (id: number) => apiDelete<{ deleted: boolean }>(`/machines/${id}`);
export const resetMachine = (id: number) => apiPost<any>(`/machines/${id}/reset`, {});
