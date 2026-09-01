/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiDelete, apiGet, apiPatch, apiPost } from './client';
export const listEmployees = (storeId: number) => apiGet<any[]>(`/stores/${storeId}/employees`);
export const createEmployee = (storeId: number, data: unknown) => apiPost<any>(`/stores/${storeId}/employees`, data);
export const updateEmployee = (id: number, data: unknown) => apiPatch<any>(`/employees/${id}`, data);
export const deleteEmployee = (id: number) => apiDelete<{ deleted: boolean }>(`/employees/${id}`);
export const listShifts = (storeId: number, date: string) => apiGet<any[]>(`/stores/${storeId}/shifts?date=${date}`);
export const updateShift = (storeId: number, shiftId: number, data: { name: string; start: string; end: string }) => apiPatch<any>(`/stores/${storeId}/shifts/${shiftId}`, data);
export const assignEmployee = (storeId: number, shiftId: number, employeeId: number) => apiPost<any>(`/stores/${storeId}/shifts/${shiftId}/assignments`, { employeeId });
export const unassignEmployee = (storeId: number, shiftId: number, employeeId: number) => apiDelete<any>(`/stores/${storeId}/shifts/${shiftId}/assignments/${employeeId}`);
