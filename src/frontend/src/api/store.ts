import { apiPatch } from './client';

export const updateStoreName = (storeId: number, name: string) => apiPatch<{ storeId: number; name: string }>(`/stores/${storeId}`, { name });
