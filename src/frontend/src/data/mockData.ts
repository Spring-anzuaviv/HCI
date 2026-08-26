import type { Machine, Staff, Config, Order } from '../types';

export const MOCK_MACHINES: Machine[] = [
  { id: 1, name: 'Máy 1', type: 'wash', kg: 7,  time: 30, st: 'wash', user: 'Trần Văn B',  timeLeft: 12 },
  { id: 2, name: 'Máy 2', type: 'dry',  kg: 10, time: 45, st: 'dry',  user: 'Mai Nguyễn',  timeLeft: 40 },
  { id: 3, name: 'Máy 3', type: 'wash', kg: 15, time: 50, st: 'trong', user: '',            timeLeft: 0  },
];

export const MOCK_CONFIG: Config = {
  shopName: 'Như Ý',
  shifts: [
    { id: 1, name: 'Ca sáng',  start: '06:00', end: '14:00' },
    { id: 2, name: 'Ca chiều', start: '14:00', end: '22:00' },
  ],
};

export const MOCK_STAFF: Staff[] = [
  { id: 1, name: 'Mai Anh', phone: '0901234567', shiftId: 2, ava: 'MA' },
  { id: 2, name: 'Linh',    phone: '0987654321', shiftId: 1, ava: 'L'  },
  { id: 3, name: 'Hùng',    phone: '0912345678', shiftId: 2, ava: 'H'  },
  { id: 4, name: 'Đức',     phone: '0923456789', shiftId: 1, ava: 'Đ'  },
  { id: 5, name: 'Thảo',    phone: '0934567891', shiftId: 1, ava: 'T'  },
  { id: 6, name: 'Quân',    phone: '0945678912', shiftId: 2, ava: 'Q'  },
  { id: 7, name: 'Yến',     phone: '0956789123', shiftId: 2, ava: 'Y'  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'dqa', name: 'Đặng Quốc Anh',  phone: '0934 567 890',
    receivedAt: '15/08/2026, 13:45', service: 'combo', kg: 3,
    deadline: '19:30', deadlineFull: '15/08/2026, 19:30',
    status: 'pending', atRisk: false, isWaiting: false,
    chipLabel: 'Gửi thông báo', chipStyle: { background: '#fef08a', color: '#854d0e' },
    machine: undefined,
  },
  {
    id: 'nmt', name: 'Nguyễn Minh Tuấn', phone: '0901 234 567',
    receivedAt: '15/08/2026, 16:30', service: 'wash', kg: 5,
    deadline: '17:30', deadlineFull: '15/08/2026, 17:30',
    status: 'pending', atRisk: false, isWaiting: false, priority: 1,
    chipLabel: 'Máy 1 · Đang giặt · Dự kiến xong: 18:35',
    chipStyle: { background: '#dbeafe', color: '#1e40af' },
    machine: 'Máy 1',
  },
  {
    id: 'dqh', name: 'Đinh Quang Hiếu',  phone: '0977 888 999',
    receivedAt: '15/08/2026, 16:20', service: 'combo', kg: 6,
    deadline: '17:30', deadlineFull: '15/08/2026, 17:30',
    status: 'pending', atRisk: false, isWaiting: false, priority: 2,
    chipLabel: 'Máy 2 · Đang sấy · Dự kiến xong: 17:40',
    chipStyle: { background: '#fef3c7', color: '#92400e' },
    machine: 'Máy 2',
  },
  {
    id: 'tth', name: 'Trần Thị Hoa',   phone: '0987 654 321',
    receivedAt: '15/08/2026, 16:15', service: 'combo', kg: 4,
    deadline: '17:30', deadlineFull: '15/08/2026, 17:30',
    status: 'pending', atRisk: true, isWaiting: true, priority: 3,
  },
  {
    id: 'lvn', name: 'Lê Văn Nam',     phone: '0912 345 678',
    receivedAt: '15/08/2026, 15:00', service: 'dry', kg: 3,
    deadline: '18:00', deadlineFull: '15/08/2026, 18:00',
    status: 'pending', atRisk: true, isWaiting: true, priority: 4,
  },
  {
    id: 'pth', name: 'Phạm Thu Hiền', phone: '0923 456 789',
    receivedAt: '15/08/2026, 14:30', service: 'wash', kg: 7,
    deadline: '19:00', deadlineFull: '15/08/2026, 19:00',
    status: 'pending', atRisk: false, isWaiting: true, priority: 5,
  },
  {
    id: 'htm', name: 'Hoàng Thị Mai', phone: '0945 678 901',
    receivedAt: '15/08/2026, 14:00', service: 'wash', kg: 4.5,
    deadline: '20:00', deadlineFull: '15/08/2026, 20:00',
    status: 'pending', atRisk: false, isWaiting: true, priority: 6,
  },
  {
    id: 'btt', name: 'Bùi Thanh Tú',  phone: '0988 123 456',
    receivedAt: '15/08/2026, 11:30', service: 'wash', kg: 6,
    deadline: '', deadlineFull: '',
    status: 'done', atRisk: false, isWaiting: false,
  },
  {
    id: 'ntt', name: 'Ngô Trọng Trí', phone: '0911 222 333',
    receivedAt: '15/08/2026, 09:15', service: 'dry', kg: 2,
    deadline: '', deadlineFull: '',
    status: 'done', atRisk: false, isWaiting: false,
  },
  {
    id: 'tml', name: 'Trương Mỹ Linh', phone: '0933 444 555',
    receivedAt: '14/08/2026, 18:00', service: 'combo', kg: 5,
    deadline: '', deadlineFull: '',
    status: 'done', atRisk: false, isWaiting: false,
  },
  {
    id: 'phs', name: 'Phan Hồng Sơn', phone: '0909 999 888',
    receivedAt: '14/08/2026, 14:20', service: 'wash', kg: 8,
    deadline: '', deadlineFull: '',
    status: 'done', atRisk: false, isWaiting: false,
  },
];
