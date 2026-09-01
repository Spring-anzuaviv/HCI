import { useApp } from '../context/useApp';
import type { Page } from '../types';
import { BarChart3, House, Layers3, Send, WashingMachine } from 'lucide-react';

const NAV_ICONS = { db: House, q: Layers3, n: Send, stats: BarChart3 } as const;

interface NavItem {
  id: Page;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'db', label: 'Tổng quan' },
  { id: 'q', label: 'Hàng đợi' },
  { id: 'n', label: 'Thông báo' },
  { id: 'stats', label: 'Thống kê' },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, config } = useApp();

  const shopName = config.shopName || 'WashTrack';
  const parts = shopName.trim().split(' ');
  let initials = 'WT';
  if (parts.length >= 2) initials = (parts[0][0] + parts[1][0]).toUpperCase();
  else if (parts.length === 1) initials = parts[0].substring(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="logo-box">
        <WashingMachine className="icon icon-xl" style={{ color: '#5b21b6' }} aria-hidden="true" />
      </div>
      <div className="logo-name">Wash<br />Track</div>

      <nav className="snav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`ni${currentPage === item.id ? ' on' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            {(() => { const Icon = NAV_ICONS[item.id as keyof typeof NAV_ICONS]; return <Icon className="icon icon-lg" aria-hidden="true" />; })()}
            <span className="lbl">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="su">
        <div className="su-av" style={{ marginBottom: 6 }}>{initials}</div>
        <div className="su-name" style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.9)', textAlign: 'center', lineHeight: 1.25 }}>
          {shopName}<br />Laundry
        </div>
      </div>
    </aside>
  );
}
