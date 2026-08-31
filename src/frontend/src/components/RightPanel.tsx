import { useApp } from '../context/AppContext';
import type { Machine } from '../types';

// ─── Machine Card ───
function MachineCard({ machine, onEdit }: { machine: Machine; onEdit: (id: number) => void }) {
  const isIdle = machine.st === 'trong';
  const isUnavailable = machine.st === 'hong' || machine.st === 'ngung';
  const label = machine.type === 'wash' ? 'Giặt' : 'Sấy';

  const colorClass = isUnavailable ? 'gy' : isIdle ? 'gy' : machine.type === 'wash' ? 'bl' : 'am';

  return (
    <div
      className={`mc ${colorClass}${!isIdle ? ' on' : ''}`}
      onClick={() => onEdit(machine.id)}
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
        {isUnavailable ? (
          <>{machine.st === 'hong' ? 'Hỏng' : 'Ngừng hoạt động'}<br /><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>--</span></>
        ) : isIdle ? (
          <>Trống<br /><span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>--</span></>
        ) : (
          <>
            {machine.user}<br />
            <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.85 }}>
              {machine.timeLeft}p · {machine.type === 'wash' ? 'Giặt' : 'Sấy'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Staff Row ───
function StaffSection() {
  const { workShifts, selectedWorkDate, setSelectedWorkDate, openM } = useApp();

  return (
    <div>
      <div className="frow" style={{ alignItems: 'center', marginBottom: 12, justifyContent: 'space-between', gap: 5 }}>
        <div className="rpt" style={{ marginBottom: 0 }}>Nhân viên trong ca</div>
        <input className="finput" type="date" value={selectedWorkDate} onChange={event => setSelectedWorkDate(event.target.value)} style={{ width: 125, height: 30, fontSize: 11 }} />
        <button className="bs" style={{ padding: '4px 8px', fontSize: '10.5px' }} onClick={() => openM('sm-staff')}>
          <svg className="icon icon-sm" style={{ color: 'var(--pu)' }}><use href="#i-plus" /></svg>
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
                 <button className="bs" style={{ padding: '3px 6px', fontSize: 9 }} onClick={() => openM(`sm-assign-${shift.id}`)}>+ Phân ca</button>
              </div>
              <div className="strow">
                {staffInShift.length === 0
                  ? <div style={{ fontSize: 11, color: '#a1a1aa', fontStyle: 'italic' }}>Chưa có nhân viên</div>
                   : staffInShift.map(s => (
                    <div key={s.id} className="stav" title={`${s.name} - Nhấn để sửa`} onClick={() => openM(`sm-staff-${s.id}`)} style={{ background: 'var(--pu)', color: '#fff', position: 'relative' }}>
                      {s.ava}
                      <button aria-label={`Xóa ${s.name} khỏi ca`} onClick={event => { event.stopPropagation(); openM(`sm-remove-${shift.id}-${s.id}`); }} style={{ position: 'absolute', right: -5, top: -5, width: 16, height: 16, border: 0, borderRadius: '50%', background: 'var(--rd)', color: '#fff', fontSize: 11, lineHeight: '16px', padding: 0, cursor: 'pointer' }}>×</button>
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
export default function RightPanel() {
  const { machines, openM } = useApp();

  const waitingCount = 4; // TODO: tính từ orders

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
          {waitingCount} đơn đang chờ trong hàng đợi
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
