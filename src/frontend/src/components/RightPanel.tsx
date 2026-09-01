import React from 'react';
import { useApp } from '../context/useApp';
import { resetMachine } from '../api/machines';
import { getStats } from '../api/stats';
import type { Machine } from '../types';
import { CircleX, Plus, RefreshCw, WashingMachine } from 'lucide-react';

// ─── Machine Card ───
function MachineCard({ machine, onEdit }: { machine: Machine; onEdit: (id: number) => void }) {
  const { refreshMachines } = useApp();
  const isIdle = machine.st === 'trong';
  const needsReview = machine.operationalState === 'NEEDS_REVIEW';
  const unavailable = machine.st === 'broken' || machine.st === 'inactive';
  const label = machine.type === 'wash' ? 'Giặt' : 'Sấy';
  const colorClass = isIdle || needsReview || unavailable ? 'gy' : machine.type === 'wash' ? 'bl' : 'am';
  const statusLabel = needsReview
    ? 'Cần kiểm tra'
    : machine.st === 'broken'
      ? 'Đang hỏng'
      : machine.st === 'inactive'
        ? 'Tạm ngưng'
        : isIdle
          ? 'Trống'
          : machine.user || `Đang ${label.toLowerCase()}`;

  const [resetting, setResetting] = React.useState(false);
  const [resetError, setResetError] = React.useState<string | null>(null);

  async function handleReset(event: React.MouseEvent) {
    event.stopPropagation();
    if (!window.confirm(
      `Đặt lại "${machine.name}" về Sẵn sàng?\n` +
      `Lý do cần kiểm tra:\n${machine.reviewReasons?.join('\n') ?? '(không rõ)'}\n\n` +
      `Chỉ thực hiện khi chắc chắn máy không còn đồ bên trong.`
    )) return;
    setResetting(true);
    setResetError(null);
    try {
      await resetMachine(machine.id);
      await refreshMachines?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể đặt lại máy';
      setResetError(message);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div
      className={`mc ${colorClass}${!isIdle ? ' on' : ''}`}
      onClick={() => onEdit(machine.id)}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onEdit(machine.id); }}
      role="button"
      tabIndex={0}
      aria-label={`${machine.name}, ${statusLabel}`}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.06)', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 700, color: isIdle ? '#64748b' : '#fff' }}>
        {label}
      </div>
      <div className="mc-ico">
         <WashingMachine className="icon" style={{ width: 22, height: 22 }} aria-hidden="true" />
      </div>
      <div className="mc-name">{machine.name}</div>
      <div className="mc-st" style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>
        {isIdle || needsReview || unavailable ? (
          <>{statusLabel}<br /><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{machine.reviewReasons?.[0] ?? (isIdle && machine.nextPlannedStage ? `Tiếp: #${machine.nextPlannedStage.order?.orderId ?? ''} ${machine.nextPlannedStage.stage}` : '--')}</span></>
        ) : (
          <>
            {statusLabel}<br />
            <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.85 }}>
              {machine.timeLeft ?? '--'}p · {machine.currentStage?.stage ?? label}
            </span>
          </>
        )}
      </div>

      {/* Nút Đặt lại — chỉ hiện khi NEEDS_REVIEW */}
      {needsReview && (
        <button
          onClick={handleReset}
          disabled={resetting}
          title={machine.reviewReasons?.join('\n') ?? 'Máy cần kiểm tra trước khi sử dụng'}
          style={{
            position: 'absolute', bottom: 7, right: 7,
            background: resetting ? '#e5e7eb' : '#fee2e2',
            color: resetting ? '#9ca3af' : '#b91c1c',
            border: '1px solid #fca5a5',
            borderRadius: 6, padding: '2px 7px',
            fontSize: 9.5, fontWeight: 800,
            cursor: resetting ? 'wait' : 'pointer',
            lineHeight: 1.4, whiteSpace: 'nowrap',
          }}
        >
           {resetting ? '...' : <><RefreshCw className="icon icon-sm" aria-hidden="true" /> Đặt lại</>}
        </button>
      )}
      {resetError && (
        <div style={{ fontSize: 9, color: '#b91c1c', marginTop: 3, lineHeight: 1.3, padding: '0 4px' }}>
          {resetError}
        </div>
      )}
    </div>
  );
}

// ─── Staff Section ───
function StaffSection() {
  const { workShifts, selectedWorkDate, setSelectedWorkDate, openM } = useApp();

  return (
    <div>
      <div className="frow" style={{ alignItems: 'center', marginBottom: 12, justifyContent: 'space-between', gap: 5 }}>
        <div className="rpt" style={{ marginBottom: 0 }}>Nhân viên trong ca</div>
        <input className="finput" type="date" value={selectedWorkDate} onChange={event => setSelectedWorkDate(event.target.value)} style={{ width: 125, height: 30, fontSize: 11 }} />
        <button className="bs" style={{ padding: '4px 8px', fontSize: '10.5px' }} onClick={() => openM('sm-staff')}>
           <Plus className="icon icon-sm" style={{ color: 'var(--pu)' }} aria-hidden="true" />
          Thêm NV
        </button>
      </div>
      <div id="staff-container" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {workShifts.map(shift => {
          const staffInShift = shift.employees;
          return (
            <div key={shift.id}>
               <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ts)', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <span>{shift.name} ({shift.start} - {shift.end})</span>
                  <button className="bs" style={{ padding: '3px 6px', fontSize: 9 }} onClick={() => openM(`sm-assign-${shift.id}`)}><Plus className="icon icon-sm" aria-hidden="true" /> Phân ca</button>
              </div>
              <div className="strow">
                {staffInShift.length === 0
                  ? <div style={{ fontSize: 11, color: '#a1a1aa', fontStyle: 'italic' }}>Chưa có nhân viên</div>
                   : staffInShift.map(s => (
                    <div key={s.id} className="stav" title={`${s.name} - Nhấn để sửa`} onClick={() => openM(`sm-staff-${s.id}`)} style={{ background: 'var(--pu)', color: '#fff', position: 'relative' }}>
                      {s.ava}
                       <button aria-label={`Xóa ${s.name} khỏi ca`} onClick={event => { event.stopPropagation(); openM(`sm-remove-${shift.id}-${s.id}`); }} style={{ position: 'absolute', right: -5, top: -5, width: 16, height: 16, border: 0, borderRadius: '50%', background: 'var(--rd)', color: '#fff', padding: 0, cursor: 'pointer' }}><CircleX size={14} aria-hidden="true" /></button>
                    </div>
                  ))
                }
              </div>
            </div>
          );
        })}
        {workShifts.length === 0 && <div style={{ fontSize: 11, color: 'var(--ts)' }}>Không có ca trong ngày này</div>}
      </div>
    </div>
  );
}

// ─── Right Panel ───
interface HourlyStat { label: string; count: number }

export default function RightPanel() {
  const { machines, openM, queueSnapshot, operationsLoading, store } = useApp();
  const [hourlyStats, setHourlyStats] = React.useState<HourlyStat[]>([]);
  const [statsLoading, setStatsLoading] = React.useState(true);

  const waitingCount = queueSnapshot?.summary.statusCounts.WAITING ?? 0;
  React.useEffect(() => {
    if (!store) return;
    let active = true;
    getStats(store.storeId)
      .then(data => {
        if (active) setHourlyStats(data.hourlyBreakdown ?? []);
      })
      .catch(() => {
        if (active) setHourlyStats([]);
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });
    return () => { active = false; };
  }, [store]);

  const chartColors = ['var(--pu)', 'var(--pk)', 'var(--bl)', 'var(--ye)'];
  const chartStats = hourlyStats.map((item, index) => ({ ...item, color: chartColors[index % chartColors.length] }));
  const maxHourlyCount = Math.max(...chartStats.map(item => item.count), 1);

  return (
    <aside className="rp">
      {/* Machines */}
      <div>
        <div className="frow" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 5 }}>
          <div className="rpt" style={{ marginBottom: 0 }}>Trạng thái máy</div>
          <button className="bs" style={{ padding: '4px 8px', fontSize: '10.5px' }} onClick={() => openM('sm-machine')}>
             <Plus className="icon icon-sm" style={{ color: 'var(--pu)' }} aria-hidden="true" />
            Thêm máy
          </button>
        </div>
        <div className="mgrid">
          {machines.map(m => (
            <MachineCard key={m.id} machine={m} onEdit={(id) => openM(`sm-machine-${id}`)} />
          ))}
        </div>
        <div id="queue-count-text" style={{ fontSize: 12, color: 'var(--ts)', marginTop: 8, textAlign: 'left' }}>
          {operationsLoading ? 'Đang tải trạng thái vận hành...' : `${waitingCount} đơn đang chờ trong hàng đợi`}
        </div>
      </div>

      {/* Staff */}
      <StaffSection />

      {/* Mini bar chart */}
      <div>
        <div className="rpt" style={{ marginBottom: 20 }}>Thống kê hôm nay</div>
        <div className="bwrap">
          {chartStats.map(item => (
            <div className="bbar-g" key={item.label}>
              <div className="bnum">{item.count}</div>
               <div className="bbar" style={{ height: `${Math.max(item.count / maxHourlyCount * 52, item.count ? 8 : 3)}px`, background: item.color }} />
               <div className="blbl" title={`${item.label}: ${item.count} đơn`}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--tl)', marginTop: 5 }}>
          {statsLoading ? 'Đang tải thống kê...' : chartStats.every(item => item.count === 0) ? 'Chưa có đơn tiếp nhận trong các khoảng này' : 'Số đơn tiếp nhận theo khoảng giờ'}
        </div>
      </div>
    </aside>
  );
}
