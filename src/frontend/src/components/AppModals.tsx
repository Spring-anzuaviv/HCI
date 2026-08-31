/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiGet, apiPost } from '../api/client';
import { logout } from '../api/auth';

// ─── Modal Thêm đơn hàng ───
export function AddOrderModal() {
  const { openModal, closeM, showToast, store, refreshOrders } = useApp();
  const isOpen = openModal === 'am';

  const [kg, setKg] = useState(3);
  const [time, setTime] = useState('18:00');
  const [svc, setSvc] = useState<'combo' | 'wash' | 'dry'>('combo');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [calcResult, setCalcResult] = useState<{ text: string; isRisk: boolean; loading?: boolean } | null>(null);

  const pickupDate = (value: string) => {
    const date = new Date();
    const [hour, minute] = value.split(':').map(Number);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  const updateCalc = async (newSvc = svc, newKg = kg, newTime = time) => {
    if (!newKg || newKg <= 0 || !newTime || !store) { setCalcResult(null); return; }
    setCalcResult({ text: 'Đang kiểm tra lịch máy...', isRisk: false, loading: true });
    try {
      // API payload is intentionally kept flexible while backend response fields evolve.
      const result = await apiPost<any>(`/stores/${store.storeId}/deadline-check`, {
        weightKg: newKg, serviceType: newSvc === 'combo' ? 'WASH_DRY' : newSvc.toUpperCase(), pickupAt: pickupDate(newTime),
      });
      const eta = result.estimatedAt ? new Date(result.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'chưa xác định';
      const isRisk = result.result === 'AT_RISK' || result.result === 'NOT_FEASIBLE';
      setCalcResult({ isRisk, text: `${isRisk ? '⚠' : result.result === 'UNKNOWN' ? '!' : '✓'} ${result.reason}. Dự kiến xong: ${eta}${result.requiredMinutes ? ` · Khoảng ${result.requiredMinutes} phút` : ''}.` });
    } catch (error) {
      setCalcResult({ isRisk: true, text: error instanceof Error ? error.message : 'Không thể kiểm tra giờ hẹn.' });
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !kg || !time || !store) { showToast('Vui lòng nhập đủ tên, số điện thoại, khối lượng và giờ hẹn', 'red'); return; }
    try {
      await apiPost(`/stores/${store.storeId}/orders`, {
        customer: { name: name.trim(), phone: phone.trim() }, weightKg: kg,
        serviceType: svc === 'combo' ? 'WASH_DRY' : svc.toUpperCase(), pickupAt: pickupDate(time),
        readyAt: new Date().toISOString(), note,
      });
      await refreshOrders(); closeM('am'); showToast(`Đã tạo đơn cho ${name}`, 'grn');
      setName(''); setPhone(''); setNote('');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể tạo đơn', 'red'); }
  };

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id="am" onClick={() => closeM('am')}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">Thêm đơn hàng mới</div>
          <button className="mxbtn" onClick={() => closeM('am')}>
            <svg className="icon icon-sm"><use href="#i-x" /></svg>
          </button>
        </div>

        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg">
            <label className="flbl">Khối lượng (kg)</label>
            <input className="finput" type="number" value={kg} onChange={e => { setKg(+e.target.value); updateCalc(svc, +e.target.value, time); }} />
          </div>
          <div className="fg">
            <label className="flbl">Giờ hẹn lấy</label>
            <input className="finput" type="time" value={time} onChange={e => { setTime(e.target.value); updateCalc(svc, kg, e.target.value); }} />
          </div>
        </div>

        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg">
            <label className="flbl">Dịch vụ</label>
            <select className="finput" value={svc} onChange={e => { const v = e.target.value as typeof svc; setSvc(v); updateCalc(v, kg, time); }}>
              <option value="combo">Giặt + Sấy</option>
              <option value="wash">Chỉ giặt</option>
              <option value="dry">Chỉ sấy</option>
            </select>
          </div>
        </div>

        <div id="add-calc" style={{
          background: calcResult ? (calcResult.isRisk ? '#fef2f2' : '#f0fdf4') : '#f1f5f9',
          borderRadius: 9, padding: '11px 14px', marginBottom: 14,
          fontSize: '11.5px', color: calcResult ? (calcResult.isRisk ? '#991b1b' : '#166534') : 'var(--ts)',
        }}>
          {calcResult ? calcResult.text : <><strong>Dự tính:</strong> Vui lòng nhập thông tin để hệ thống kiểm tra giờ.</>}
        </div>

        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg">
            <label className="flbl">Tên khách hàng</label>
            <input className="finput" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: Nguyễn Văn A" />
          </div>
          <div className="fg">
            <label className="flbl">Số điện thoại</label>
            <input className="finput" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xx xxx xxx" />
          </div>
        </div>

        <div className="frow" style={{ marginBottom: 14 }}>
          <div className="fg">
            <label className="flbl">Ghi chú</label>
            <input className="finput" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Tùy chọn..." />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end' }}>
          <button className="bs" onClick={() => closeM('am')}>Hủy</button>
          <button className="bp" onClick={handleSubmit}>
            <svg className="icon icon-sm"><use href="#i-plus" /></svg>
            Tạo đơn
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Cài đặt ───
export function SettingsModal() {
  const { openModal, closeM, showToast, config, setConfig } = useApp();
  const isOpen = openModal === 'sm';

  const [shopName, setShopName] = useState(config.shopName);

  const saveSettings = () => {
    setConfig(prev => ({ ...prev, shopName }));
    closeM('sm');
    showToast('Đã lưu cấu hình cài đặt', 'grn');
  };

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id="sm" onClick={() => closeM('sm')}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">Cài đặt</div>
          <button className="mxbtn" onClick={() => closeM('sm')}>
            <svg className="icon icon-sm"><use href="#i-x" /></svg>
          </button>
        </div>

        <div style={{ marginBottom: 12, marginTop: 10 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Tên cửa hàng</label>
          <input
            type="text"
            value={shopName}
            onChange={e => setShopName(e.target.value)}
            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 6, height: 32, padding: '0 10px', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Bảo mật</label>
          <button className="bs" style={{ width: '100%', justifyContent: 'center' }}>Đổi mật khẩu</button>
        </div>

        <div style={{ display: 'flex', gap: 9, justifyContent: 'space-between' }}>
          <button className="bs" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => { void logout(); closeM('sm'); window.location.reload(); }}>
            Đăng xuất
          </button>
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="bs" onClick={() => closeM('sm')}>Hủy</button>
            <button className="bp" onClick={saveSettings}>
              <svg className="icon icon-sm"><use href="#i-check" /></svg>
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Thêm máy ───
export function MachineModal() {
  const { openModal, closeM, showToast, machines, setMachines } = useApp();
  const isOpen = openModal === 'sm-machine';

  const [name, setName] = useState('');
  const [type, setType] = useState<'wash' | 'dry' | ''>('');
  const [machKg, setMachKg] = useState('');
  const [machTime, setMachTime] = useState('');

  const saveMachine = () => {
    if (!type || !machKg || !machTime) {
      showToast('Vui lòng chọn loại máy và nhập số kg, phút', 'red');
      return;
    }
    const newId = machines.length ? Math.max(...machines.map(m => m.id)) + 1 : 1;
    setMachines(prev => [...prev, { id: newId, name: name || `Máy ${newId}`, type: type as 'wash' | 'dry', kg: +machKg, time: +machTime, st: 'trong', user: '', timeLeft: 0 }]);
    closeM('sm-machine');
    showToast('Đã lưu máy móc', 'grn');
    setName(''); setType(''); setMachKg(''); setMachTime('');
  };

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id="sm-machine" onClick={() => closeM('sm-machine')}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">Thêm máy</div>
          <button className="mxbtn" onClick={() => closeM('sm-machine')}>
            <svg className="icon icon-sm"><use href="#i-x" /></svg>
          </button>
        </div>

        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg" style={{ width: '100%' }}>
            <label className="flbl">Tên máy</label>
            <input className="finput" type="text" value={name} onChange={e => setName(e.target.value)} placeholder={`Máy ${machines.length + 1}`} maxLength={10} />
          </div>
        </div>
        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg" style={{ width: '100%' }}>
            <label className="flbl">Loại máy</label>
            <select className="finput" value={type} onChange={e => setType(e.target.value as 'wash' | 'dry')}>
              <option value="" disabled hidden>Chọn loại máy</option>
              <option value="wash">Máy Giặt</option>
              <option value="dry">Máy Sấy</option>
            </select>
          </div>
        </div>
        <div className="frow" style={{ marginBottom: 18 }}>
          <div className="fg">
            <label className="flbl">Khối lượng (kg)</label>
            <input className="finput" type="number" value={machKg} onChange={e => setMachKg(e.target.value)} placeholder="VD: 7" />
          </div>
          <div className="fg">
            <label className="flbl">Thời gian xử lý (phút)</label>
            <input className="finput" type="number" value={machTime} onChange={e => setMachTime(e.target.value)} placeholder="VD: 30" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 9 }}>
          <button className="bs" onClick={() => closeM('sm-machine')} style={{ flex: 1 }}>Hủy</button>
          <button className="bp" onClick={saveMachine} style={{ flex: 2 }}>
            <svg className="icon icon-sm"><use href="#i-check" /></svg>
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Chi tiết đơn hàng ───
export function OrderDetailModal() {
  const { openModal, closeM, showToast, orderModalParams, machines, orders } = useApp();
  const isOpen = openModal === 'om';
  const p = orderModalParams;
  const [detail, setDetail] = useState<any>(null);
  const [detailError, setDetailError] = useState('');

  // Clear stale detail when a different order is opened.
  useEffect(() => {
    setDetail(null); setDetailError('');
    if (p?.orderId) apiGet<any>(`/orders/${p.orderId}`).then(setDetail).catch(error => setDetailError(error instanceof Error ? error.message : 'Không thể tải chi tiết đơn'));
  }, [p?.orderId]);

  if (!p) return null;

  const order = detail ?? (p.orderId ? orders.find(item => item.orderId === p.orderId) : undefined);

  const actualSvc = order?.serviceType === 'WASH_DRY' ? 'combo' : order?.serviceType === 'DRY' ? 'dry' : order?.serviceType === 'WASH' ? 'wash' : p.svcType;
  const svcLabel = actualSvc === 'combo' ? 'Giặt + Sấy' : actualSvc === 'wash' ? 'Chỉ Giặt' : 'Chỉ Sấy';
  let stages: string[] = [];
  if (actualSvc === 'combo') stages = ['Phân loại', 'Đang giặt', 'Chuyển đồ', 'Đang sấy', 'Đóng gói'];
  else if (actualSvc === 'wash') stages = ['Phân loại', 'Đang giặt', 'Đóng gói'];
  else stages = ['Tiếp nhận', 'Đang sấy', 'Gấp đồ', 'Gửi thông báo'];

  const stageList = order?.stages ?? [];
  const cur = Math.max(0, stageList.findIndex((stage: any) => stage.status !== 'COMPLETED'));

  const availMachines = machines.filter(m => m.type === (actualSvc === 'dry' ? 'dry' : 'wash'));

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id="om" onClick={() => closeM('om')}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">{order?.customer?.name ?? p.name} – Chi tiết đơn</div>
          <button className="mxbtn" onClick={() => closeM('om')}>
            <svg className="icon icon-sm"><use href="#i-x" /></svg>
          </button>
        </div>

        {/* Header info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '11px 0', borderBottom: '1.5px solid #f1f5f9', marginBottom: 11 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--tx)' }}>{order?.customer?.name ?? p.name}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--ts)', marginTop: 3 }}>{order?.customer?.phone ?? p.phone ?? 'Chưa có số điện thoại'}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: order?.riskLevel === 'HIGH' || p.atRisk ? '#ef4444' : '#1e1b4b' }}>{order?.pickupAt ? new Date(order.pickupAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : p.deadline || 'Chưa hẹn'}</div>
            <div style={{ fontSize: '10.5px', color: 'var(--tl)' }}>Giờ hẹn lấy</div>
          </div>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', margin: '14px 0' }}>
          {stages.map((s, i) => {
            const done = i < cur;
            const act = i === cur;
            return (
              <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', margin: '0 auto', zIndex: 1, position: 'relative', background: done || act ? '#7c3aed' : '#e2e8f0', color: done || act ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {done ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: '8.5px', color: act ? '#7c3aed' : '#9ca3af', marginTop: 3, fontWeight: act ? 700 : 400 }}>{s}</div>
                {i < stages.length - 1 && (
                  <div style={{ position: 'absolute', top: 13, left: '50%', width: '100%', height: 2, background: done ? '#7c3aed' : '#e2e8f0' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Risk warning */}
          {(order?.riskLevel === 'HIGH' || order?.riskLevel === 'MEDIUM' || p.atRisk) && (
          <div style={{ background: '#fee2e2', borderRadius: 9, padding: '11px 13px', margin: '11px 0', borderLeft: '3px solid var(--rd)' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--rd)', marginBottom: 3 }}>Cảnh báo trễ hẹn</div>
            <div style={{ fontSize: '11.5px', color: '#9ca3af' }}>Dự kiến xong {order?.estimatedAt ? new Date(order.estimatedAt).toLocaleString('vi-VN') : 'chưa xác định'} · Hẹn {p.deadline || 'chưa có'}</div>
          </div>
        )}

        <div style={{ fontSize: '11.5px', color: 'var(--ts)', padding: '9px 0', borderTop: '1.5px solid #f1f5f9' }}>
          {detailError || (detail ? <><strong>Dịch vụ:</strong> {svcLabel} {order.weightKg}kg &nbsp;·&nbsp; <strong>Trạng thái:</strong> {order.status}</> : 'Đang tải thông tin chi tiết...')}
        </div>

        {detail?.nextAction && <div style={{ background: '#f8fafc', borderRadius: 8, padding: '9px 11px', fontSize: 12 }}><strong>Làm gì tiếp theo:</strong> {detail.nextAction}</div>}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 9, marginTop: 18, justifyContent: 'flex-end' }}>
          {p.isWaiting ? (
            <>
              <button className="bs" onClick={() => closeM('om')}>Đóng</button>
              <select className="finput" style={{ width: 160, padding: '7px 10px', height: 35 }}>
                {availMachines.map(m => (
                  <option key={m.id} value={m.id} disabled={m.st !== 'trong'}>
                    {m.name} {m.st !== 'trong' ? '(Đang bận)' : '(Trống)'}
                  </option>
                ))}
                {availMachines.length === 0 && <option disabled>Không có máy phù hợp</option>}
              </select>
              <button className="bp" onClick={() => { closeM('om'); showToast(`Đã xếp ${p.name} vào máy`, 'grn'); }}>
                <svg className="icon icon-sm"><use href="#i-check" /></svg>
                Xử lý ngay
              </button>
            </>
          ) : (
            <>
              <button className="bs" onClick={() => closeM('om')}>Đóng</button>
              <button className="br">
                <svg className="icon icon-sm"><use href="#i-zap" /></svg>
                Đôn đơn lên trước
              </button>
              <button className="bp" onClick={() => { closeM('om'); showToast(`Đã hoàn tất công đoạn cho ${p.name}`, 'grn'); }}>
                <svg className="icon icon-sm"><use href="#i-check" /></svg>
                Hoàn tất công đoạn
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
