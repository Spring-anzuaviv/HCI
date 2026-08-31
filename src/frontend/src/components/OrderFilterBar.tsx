import { useApp } from '../context/AppContext';
import type { OrderFilter } from '../types';

const FILTERS: { id: OrderFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Đang xử lý' },
  { id: 'done', label: 'Hoàn tất' },
];

export default function OrderFilterBar() {
  const { orderSearch, setOrderSearch, orderFilter, setOrderFilter } = useApp();
  return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
    <div className="searchbar" style={{ flex: '1 1 260px', maxWidth: 'none' }}>
      <svg className="icon icon-sm"><use href="#i-search" /></svg>
      <input aria-label="Tìm kiếm order" placeholder="Tìm theo mã order, tên hoặc số điện thoại" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
    </div>
    <div style={{ display: 'flex', gap: 6 }}>
      {FILTERS.map(item => <button key={item.id} className="bs" onClick={() => setOrderFilter(item.id)} style={{ borderRadius: 100, padding: '7px 12px', background: orderFilter === item.id ? 'var(--pu)' : '#fff', color: orderFilter === item.id ? '#fff' : 'var(--ts)', borderColor: orderFilter === item.id ? 'var(--pu)' : '#e2e8f0' }}>{item.label}</button>)}
    </div>
  </div>;
}
