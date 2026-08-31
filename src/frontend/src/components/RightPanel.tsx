import { useApp } from '../context/AppContext';
import type { Machine } from '../types';

// ─── Machine Card ───
function MachineCard({ machine, onEdit }: { machine: Machine; onEdit: (id: number) => void }) {
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
        <svg className="icon" style={{ width: 22, height: 22 }}><use href="#i-washer" /></svg>
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
    </div>
  );
}

// ─── Staff Row ───
function StaffSection() {
  const { staff, config, openM } = useApp();

  return (
    <div>
      <div className="frow" style={{ alignItems: 'center', marginBottom: 12, justifyContent: 'space-between', gap: 5 }}>
        <div className="rpt" style={{ marginBottom: 0 }}>Nhân viên</div>
        <button className="bs" style={{ padding: '4px 8px', fontSize: '10.5px' }} onClick={() => openM('sm-staff')}>
          <svg className="icon icon-sm" style={{ color: 'var(--pu)' }}><use href="#i-plus" /></svg>
          Thêm NV
        </button>
      </div>
      <div id="staff-container" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {config.shifts.map(shift => {
          const staffInShift = staff.filter(s => s.shiftId === shift.id);
          return (
            <div key={shift.id}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ts)', marginBottom: 6 }}>
                {shift.name} ({shift.start} - {shift.end})
              </div>
              <div className="strow">
                {staffInShift.length === 0
                  ? <div style={{ fontSize: 11, color: '#a1a1aa', fontStyle: 'italic' }}>Chưa có nhân viên</div>
                  : staffInShift.map(s => (
                    <div key={s.id} className="stav" title={s.name} style={{ background: 'var(--pu)', color: '#fff' }}>
                      {s.ava}
                    </div>
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Right Panel ───
export default function RightPanel() {
  const { machines, openM, queueSnapshot, operationsLoading } = useApp();

  const waitingCount = queueSnapshot?.summary.statusCounts.WAITING ?? 0;

  return (
    <aside className="rp">
      {/* Machines */}
      <div>
        <div className="frow" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 5 }}>
          <div className="rpt" style={{ marginBottom: 0 }}>Trạng thái máy</div>
          <button className="bs" style={{ padding: '4px 8px', fontSize: '10.5px' }} onClick={() => openM('sm-machine')}>
            <svg className="icon icon-sm" style={{ color: 'var(--pu)' }}><use href="#i-plus" /></svg>
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
          <div className="bbar-g"><div className="bnum">3</div><div className="bbar b1" style={{ height: 52 }}></div><div className="blbl">9h</div></div>
          <div className="bbar-g"><div className="bnum">5</div><div className="bbar b2" style={{ height: 44 }}></div><div className="blbl">11h</div></div>
          <div className="bbar-g"><div className="bnum">4</div><div className="bbar b3" style={{ height: 35 }}></div><div className="blbl">13h</div></div>
          <div className="bbar-g"><div className="bnum">2</div><div className="bbar b4" style={{ height: 18 }}></div><div className="blbl">15h</div></div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--tl)', marginTop: 5 }}>Số đơn tiếp nhận theo giờ</div>
      </div>
    </aside>
  );
}
