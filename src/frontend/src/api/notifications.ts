/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiGet, apiPost } from './client';
export const pendingNotifications = (storeId: number) => apiGet<any[]>(`/stores/${storeId}/notifications/pending`);
export const notificationPreview = (orderId: number) => apiPost<any>(`/orders/${orderId}/notifications/preview`, { channel: 'ZALO' });
export const sendNotification = (orderId: number) => apiPost<any>(`/orders/${orderId}/notifications/send`, {});
