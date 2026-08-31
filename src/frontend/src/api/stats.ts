/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiGet } from './client';
export const getStats = (storeId: number) => apiGet<any>(`/stores/${storeId}/stats`);
