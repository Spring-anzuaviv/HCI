import { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { getStats } from '../api/stats';

interface StatsData {
  completedToday: number;
  lateOrders: number;
  machineEfficiency: number;
  weekChart: { label: string; val: number; bottom: number; highlight?: boolean }[];
  services: { color: string; label: string; pct: string }[];
}

// Fallback khi chưa có dữ liệu thật (dùng khi DB chưa có data, không phải khi API lỗi)
const FALLBACK: StatsData = {
  completedToday: 0,
  lateOrders: 0,
  machineEfficiency: 0,
  weekChart: [
    { label: 'T2', val: 0, bottom: 28 },
    { label: 'T3', val: 0, bottom: 28 },
    { label: 'T4', val: 0, bottom: 28 },
    { label: 'T5', val: 0, bottom: 28 },
    { label: 'T6', val: 0, bottom: 28, highlight: true },
    { label: 'T7', val: 0, bottom: 28 },
    { label: 'CN', val: 0, bottom: 28 },
  ],
  services: [
    { color: 'var(--pu)', label: 'Giặt + Sấy', pct: '0%' },
    { color: 'var(--bl)', label: 'Chỉ Giặt',   pct: '0%' },
    { color: 'var(--am)', label: 'Sấy khô',     pct: '0%' },
  ],
};

const STATS_CACHE_TTL_MS = 30_000;
let statsCache: { data: StatsData; storedAt: number } | null = null;

export default function StatsPage() {
  const { store } = useApp();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Luồng 4 – Lấy thống kê từ Backend
  useEffect(() => {
    const fetchStats = async () => {
      const cached = statsCache && Date.now() - statsCache.storedAt < STATS_CACHE_TTL_MS
        ? statsCache.data
        : null;
      if (cached) {
        setStats(cached);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        if (!store) return;
        const result = await getStats(store.storeId);
        statsCache = { data: result, storedAt: Date.now() };
        setStats(result);
      } catch {
        setError('Không kết nối được Backend. Kiểm tra server có đang chạy không.');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [store]);

  const data = stats ?? FALLBACK;

  return (
    <div id="p-stats" className="page">
      {/* Hero */}
      <div className="hero hero-sub" style={{ minHeight: 90, padding: '16px 20px', background: 'linear-gradient(135deg,#c4b5fd 0%,#8b5cf6 100%)' }}>
        <div className="hero-txt">
          <h2 style={{ color: '#fff' }}>Thống kê &amp; Báo cáo</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 0 }}>
            Tổng quan tình hình hoạt động của tiệm hôm nay và trong tuần.
          </p>
        </div>
        <div className="hero-img">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
      </div>

      {/* Báo lỗi kết nối */}
      {error && (
        <div style={{ margin: '12px 16px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 12.5, color: '#b91c1c' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 50, color: 'var(--tl)', fontSize: 13 }}>
          Đang tải dữ liệu thống kê từ server...
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="srow">
            <div className="scard pur">
              <div className="snum">{data.completedToday}</div>
              <div className="slbl">Đơn hoàn thành</div>
            </div>
            <div className="scard red">
              <div className="snum">{data.lateOrders}</div>
              <div className="slbl">Đơn bị trễ hẹn</div>
            </div>
            <div className="scard grn">
              <div className="snum">{data.machineEfficiency}%</div>
              <div className="slbl">Hiệu suất máy</div>
            </div>
          </div>

          {/* Charts row */}
          <div className="crow">
            {/* Line chart – khách hàng tuần này */}
            <div className="card" style={{ flex: 2 }}>
              <div className="ch"><div className="ctitle">Khách hàng tuần này</div></div>
              <div className="bwrap" style={{ height: 150, position: 'relative', alignItems: 'flex-end' }}>
                <svg style={{ position: 'absolute', top: 40, left: 0, width: '100%', height: 90, zIndex: 0, overflow: 'visible' }} viewBox="0 0 700 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--pu)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--pu)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M50,70 L150,56 L250,64 L350,40 L450,10 L550,100 L650,100" fill="none" stroke="var(--pu)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <path d="M50,70 L150,56 L250,64 L350,40 L450,10 L550,100 L650,100 L650,100 L50,100 Z" fill="url(#lineGrad)" />
                </svg>

                {data.weekChart.map((d) => (
                  <div key={d.label} className="bbar-g" style={{ flex: 1, position: 'relative', zIndex: 1, height: '100%' }}>
                    <div className="bnum" style={{ position: 'absolute', bottom: d.bottom, color: d.highlight ? 'var(--pu)' : undefined, fontSize: d.highlight ? 11 : undefined }}>{d.val}</div>
                    <div style={{ position: 'absolute', bottom: d.bottom - 12, width: d.highlight ? 12 : 10, height: d.highlight ? 12 : 10, background: d.highlight ? 'var(--pu)' : '#fff', border: `2.5px solid var(--pu)`, borderRadius: '50%', boxShadow: d.highlight ? '0 0 0 1px var(--pu)' : undefined }} />
                    <div className="blbl" style={{ position: 'absolute', bottom: 0, fontWeight: d.highlight ? 700 : undefined, color: d.highlight ? 'var(--pu)' : undefined }}>{d.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut chart – dịch vụ */}
            <div className="card" style={{ flex: 1 }}>
              <div className="ch"><div className="ctitle">Dịch vụ</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, marginTop: 10 }}>
                <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'conic-gradient(var(--pu) 0% 55%, var(--bl) 55% 85%, var(--am) 85% 100%)' }} />
                <div style={{ width: '100%', fontSize: '11.5px', color: 'var(--tx)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.services.map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        <span style={{ display: 'inline-block', width: 10, height: 10, background: item.color, borderRadius: 2, marginRight: 5 }} />
                        {item.label}
                      </span>
                      <strong>{item.pct}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
