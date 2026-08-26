import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ModalOrderParams, OrderStatus } from '../types';

type FilterStatus = 'all' | OrderStatus;

const SVC_LABEL: Record<string, string> = {
  combo: 'Giặt + Sấy',
  wash: 'Chỉ Giặt',
  dry: 'Chỉ Sấy',
};

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  'Gửi thông báo': { bg: '#fef08a', color: '#854d0e', label: 'Gửi thông báo' },
  'Đang giặt':    { bg: '#dbeafe', color: '#1e40af', label: 'Đang giặt' },
  'Đang sấy':     { bg: '#fef3c7', color: '#92400e', label: 'Đang sấy' },
  'Chờ máy':      { bg: '#f3f4f6', color: '#374151', label: 'Chờ máy' },
  'Hoàn tất':     { bg: '#dcfce7', color: '#15803d', label: 'Hoàn tất' },
};

function getStatusBadge(order: { status: string; chipLabel?: string; isWaiting?: boolean }) {
  if (order.status === 'done') return STATUS_BADGE['Hoàn tất'];
  if (order.chipLabel === 'Gửi thông báo') return STATUS_BADGE['Gửi thông báo'];
  if (order.chipLabel?.includes('Đang giặt')) return STATUS_BADGE['Đang giặt'];
  if (order.chipLabel?.includes('Đang sấy')) return STATUS_BADGE['Đang sấy'];
  if (order.isWaiting) return STATUS_BADGE['Chờ máy'];
  return STATUS_BADGE['Đang giặt'];
}

export default function OrdersPage() {
  const { orders, openM, setOrderModalParams } = useApp();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filtered = orders.filter(o => filter === 'all' || o.status === filter);

  const openOrderModal = (params: ModalOrderParams) => {
    setOrderModalParams(params);
    openM('om');
  };

  return (
    <div id="p-orders" className="page">
      <div className="h3" style={{ marginBottom: 2, color: '#1e1b4b', fontWeight: 900, letterSpacing: '-0.5px', fontSize: 22, lineHeight: 1.8 }}>
        Quản lý Đơn hàng
      </div>
      <p style={{ color: '#3730a3', fontSize: 14, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.5 }}>
        Tất cả các đơn hàng từ đang chờ xử lý đến khi hoàn tất.
      </p>

      {/* Filter buttons */}
      <div className="frow" style={{ marginBottom: 8, gap: 8 }}>
        {(['all', 'pending', 'done'] as const).map(f => (
          <button
            key={f}
            className="bs"
            style={{
              borderRadius: 100, padding: '6px 14px', fontSize: 12,
              background: filter === f ? 'var(--pu)' : '#fff',
              color: filter === f ? '#fff' : 'var(--ts)',
              borderColor: filter === f ? 'var(--pu)' : '#e2e8f0',
            }}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Đang xử lý' : 'Hoàn tất'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="tb-wrap">
        <table className="tb">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Tiếp nhận</th>
              <th>Dịch vụ</th>
              <th>Khối lượng</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => {
              const badge = getStatusBadge(order);
              return (
                <tr
                  key={order.id}
                  data-status={order.status}
                  style={{ cursor: 'pointer' }}
                  onClick={() => order.status === 'pending' && openOrderModal({
                    name: order.name,
                    deadline: order.deadline,
                    atRisk: order.atRisk,
                    svcType: order.service,
                    isWaiting: order.isWaiting,
                  })}
                >
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ts)', marginTop: 2 }}>{order.phone}</div>
                  </td>
                  <td>{order.receivedAt}</td>
                  <td>{SVC_LABEL[order.service]}</td>
                  <td>{order.kg} kg</td>
                  <td>
                    <span className="tb-st" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--pu)' }}>
                    {order.status === 'pending' && <svg className="icon icon-sm"><use href="#i-chevron-right" /></svg>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
