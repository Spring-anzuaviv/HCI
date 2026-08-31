/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiGet, apiPost } from '../api/client';
import { changePassword, logout } from '../api/auth';
import { createMachine, deleteMachine, updateMachine } from '../api/machines';
import { createEmployee, updateEmployee, assignEmployee, unassignEmployee } from '../api/staff';
import { updateStoreName } from '../api/store';

// ─── Modal Thêm đơn hàng ───
export function AddOrderModal() {
  const { openModal, closeM, showToast, store, refreshOrders, config } = useApp();
  const isOpen = openModal === 'am';

  const [kg, setKg] = useState(3);
  const [time, setTime] = useState('18:00');
  const [svc, setSvc] = useState<'combo' | 'wash' | 'dry'>('combo');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [splitParts, setSplitParts] = useState<Array<{ weight: string; service: 'combo' | 'wash' | 'dry'; note: string }>>([
    { weight: '1.5', service: 'combo', note: '' }, { weight: '1.5', service: 'combo', note: '' },
  ]);
  const [splitEstimates, setSplitEstimates] = useState<Array<string | null>>([]);
  const [splitGroupETA, setSplitGroupETA] = useState<string | null>(null);
  const [createdSummary, setCreatedSummary] = useState<Array<{ index: number; estimatedAt?: string; groupETA?: string }>>([]);
  useEffect(() => { if (isOpen) setCreatedSummary([]); }, [isOpen]);
  const [calcResult, setCalcResult] = useState<{ text: string; isRisk: boolean; loading?: boolean } | null>(null);

  const pickupDate = (value: string) => {
    const date = new Date();
    const [hour, minute] = value.split(':').map(Number);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  const checkDeadline = async (newSvc: typeof svc, newKg: number, newTime: string) => {
    if (!newKg || newKg <= 0 || !newTime || !store) return null;
    const result = await apiPost<any>(`/stores/${store.storeId}/deadline-check`, {
      weightKg: newKg, serviceType: newSvc === 'combo' ? 'WASH_DRY' : newSvc.toUpperCase(), pickupAt: pickupDate(newTime),
    });
    return result;
  };

  const updateSplitEstimates = async (parts = splitParts, pickupTime = time, enabled = isSplit) => {
    if (!enabled || !store || !pickupTime) { setSplitEstimates([]); setSplitGroupETA(null); return; }
    const results = await Promise.all(parts.map(part => Number(part.weight) > 0 ? checkDeadline(part.service, Number(part.weight), pickupTime) : Promise.resolve(null)));
    const estimates = results.map(result => result?.estimatedAt ?? null);
    setSplitEstimates(estimates);
    setSplitGroupETA(estimates.filter((value): value is string => Boolean(value)).sort().at(-1) ?? null);
  };

  const updateCalc = async (newSvc = svc, newKg = kg, newTime = time) => {
    if (!newKg || newKg <= 0 || !newTime || !store) { setCalcResult(null); return; }
    setCalcResult({ text: 'Đang kiểm tra lịch máy...', isRisk: false, loading: true });
    try {
      const result = await checkDeadline(newSvc, newKg, newTime);
      if (!result) { setCalcResult(null); return; }
      const eta = result.estimatedAt ? new Date(result.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'chưa xác định';
      const isRisk = result.result === 'AT_RISK' || result.result === 'NOT_FEASIBLE';
      setCalcResult({ isRisk, text: `${isRisk ? '⚠' : result.result === 'UNKNOWN' ? '!' : '✓'} ${result.reason}. Dự kiến xong: ${eta}${result.requiredMinutes ? ` · Khoảng ${result.requiredMinutes} phút` : ''}.` });
    } catch (error) {
      setCalcResult({ isRisk: true, text: error instanceof Error ? error.message : 'Không thể kiểm tra giờ hẹn.' });
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !kg || !time || !store) { showToast('Vui lòng nhập đủ tên, số điện thoại, khối lượng và giờ hẹn', 'red'); return; }
    const parts = isSplit ? splitParts : [{ weight: String(kg), service: svc, note }];
    const weights = parts.map(part => Number(part.weight));
    if (isSplit && (weights.some(weight => !Number.isFinite(weight) || weight <= 0) || Math.abs(weights.reduce((sum, weight) => sum + weight, 0) - kg) > 0.01)) {
      showToast('Tổng khối lượng các phần phải bằng khối lượng đơn', 'red'); return;
    }
    const [hour, minute] = time.split(':').map(Number);
    const pickupMinutes = hour * 60 + minute;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const shiftEnds = config.shifts.map(shift => Number(shift.end.split(':')[0]) * 60 + Number(shift.end.split(':')[1]));
    const lastShiftEnd = shiftEnds.length ? Math.max(...shiftEnds) : 22 * 60;
    if (pickupMinutes <= currentMinutes || pickupMinutes > lastShiftEnd) {
      showToast('Giờ hẹn đã quá hoặc nằm ngoài giờ làm việc của ca', 'red'); return;
    }
    try {
      const groupCode = isSplit ? `GROUP-${Date.now()}` : undefined;
      for (const part of parts) {
        const check = await checkDeadline(part.service, Number(part.weight), time);
        if (!check || check.result === 'NOT_FEASIBLE' || check.result === 'AT_RISK') {
          showToast(check?.reason ?? 'Giờ hẹn không khả thi, đơn chưa được tạo', 'red'); return;
        }
      }
      const createdOrders: Array<{ estimatedAt?: string }> = [];
      for (const part of parts) {
        createdOrders.push(await apiPost<{ estimatedAt?: string }>(`/stores/${store.storeId}/orders`, {
          customer: { name: name.trim(), phone: phone.trim() }, weightKg: Number(part.weight),
          serviceType: part.service === 'combo' ? 'WASH_DRY' : part.service.toUpperCase(), pickupAt: pickupDate(time),
          readyAt: new Date().toISOString(), note: part.note, groupCode,
        }));
      }
      const groupETA = createdOrders.reduce<string | undefined>((latest, order) => !order.estimatedAt || (latest && latest > order.estimatedAt) ? latest : order.estimatedAt, undefined);
      setCreatedSummary(createdOrders.map((order, index) => ({ index: index + 1, estimatedAt: order.estimatedAt, groupETA })));
      await refreshOrders(); showToast(isSplit ? `Đã tạo ${weights.length} đơn trong cùng nhóm cho ${name}` : `Đã tạo đơn cho ${name}`, 'grn');
      setName(''); setPhone(''); setNote(''); setIsSplit(false); setSplitParts([{ weight: '1.5', service: 'combo', note: '' }, { weight: '1.5', service: 'combo', note: '' }]);
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
            <input className="finput" type="number" value={kg} onChange={e => { setKg(+e.target.value); updateCalc(svc, +e.target.value, time); if (isSplit) void updateSplitEstimates(splitParts); }} />
          </div>
          <div className="fg">
            <label className="flbl">Giờ hẹn lấy</label>
          <input className="finput" type="time" value={time} onChange={e => { setTime(e.target.value); updateCalc(svc, kg, e.target.value); void updateSplitEstimates(splitParts, e.target.value); }} />
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
        {createdSummary.length > 0 && <div className="created-summary">
          <strong>Đã tạo thành công</strong>
          {createdSummary.map(item => <div className="created-summary-row" key={item.index}><span>Mẻ {item.index}</span><span>Mẻ này xong: <b>{item.estimatedAt ? new Date(item.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa xác định'}</b></span><span>Cả nhóm: <b>{item.groupETA ? new Date(item.groupETA).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa xác định'}</b></span></div>)}
        </div>}

        <label className="split-toggle">
          <input type="checkbox" checked={isSplit} onChange={e => { setIsSplit(e.target.checked); if (e.target.checked) { const parts = [{ weight: String((kg / 2).toFixed(2)), service: svc, note: '' }, { weight: String((kg / 2).toFixed(2)), service: svc, note: '' }]; setSplitParts(parts); void updateSplitEstimates(parts, time, true); } else { setSplitEstimates([]); setSplitGroupETA(null); } }} />
          <span>Tách đơn thành nhiều mẻ</span>
        </label>
        {isSplit && <div className="split-box">
          <div className="split-box-title">Các mẻ <span>Tổng: {splitParts.reduce((sum, part) => sum + (Number(part.weight) || 0), 0).toFixed(2)} / {kg}kg</span></div>
          {splitParts.map((part, index) => <div className="split-part" key={index}><span>Mẻ {index + 1}</span><input className="finput" type="number" min="0.1" step="0.1" value={part.weight} onChange={e => { const parts = splitParts.map((item, partIndex) => partIndex === index ? { ...item, weight: e.target.value } : item); setSplitParts(parts); void updateSplitEstimates(parts); }} /><select className="finput split-service" value={part.service} onChange={e => { const parts = splitParts.map((item, partIndex) => partIndex === index ? { ...item, service: e.target.value as 'combo' | 'wash' | 'dry' } : item); setSplitParts(parts); void updateSplitEstimates(parts); }}><option value="combo">Giặt + Sấy</option><option value="wash">Chỉ giặt</option><option value="dry">Chỉ sấy</option></select><input className="finput split-note" type="text" value={part.note} onChange={e => setSplitParts(parts => parts.map((item, partIndex) => partIndex === index ? { ...item, note: e.target.value } : item))} placeholder="Ghi chú mẻ" />{splitParts.length > 2 && <button type="button" className="split-remove" onClick={() => { const parts = splitParts.filter((_, partIndex) => partIndex !== index); setSplitParts(parts); void updateSplitEstimates(parts); }}>Xóa</button>}</div>)}
          <button type="button" className="bs split-add" onClick={() => { const parts = [...splitParts, { weight: '0', service: 'combo' as const, note: '' }]; setSplitParts(parts); void updateSplitEstimates(parts); }}>+ Thêm mẻ</button>
          <div className="split-eta"><strong>Thời gian dự kiến</strong>{splitEstimates.length ? splitEstimates.map((estimate, index) => <span key={index}>Mẻ {index + 1}: <b>{estimate ? new Date(estimate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa xác định'}</b></span>) : <span>Đang kiểm tra lịch máy...</span>}{splitGroupETA && <span className="split-group-eta">Cả nhóm hoàn tất: <b>{new Date(splitGroupETA).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</b></span>}</div>
        </div>}

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

        {!isSplit && <div className="frow" style={{ marginBottom: 14 }}>
          <div className="fg">
            <label className="flbl">Ghi chú</label>
            <input className="finput" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Tùy chọn..." />
          </div>
        </div>}

        <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end' }}>
          <button className="bs" onClick={() => closeM('am')}>{createdSummary.length ? 'Đóng' : 'Hủy'}</button>
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
  const { openModal, closeM, showToast, config, setConfig, store } = useApp();
  const isOpen = openModal === 'sm';

  const [shopName, setShopName] = useState(config.shopName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  useEffect(() => {
    if (isOpen) { setShopName(config.shopName); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
  }, [isOpen, config.shopName]);

  const saveSettings = async () => {
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || newPassword !== confirmPassword) { showToast('Vui lòng kiểm tra thông tin đổi mật khẩu', 'red'); return; }
      if (newPassword.length < 6) { showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'red'); return; }
      try { await changePassword(currentPassword, newPassword); } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể đổi mật khẩu', 'red'); return; }
    }
    if (!shopName.trim() || !store) { showToast('Tên cửa hàng không được để trống', 'red'); return; }
    try { await updateStoreName(store.storeId, shopName); } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể lưu tên cửa hàng', 'red'); return; }
    setConfig(prev => ({ ...prev, shopName: shopName.trim() }));
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
          <div className="password-fields">
            <input className="finput" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Mật khẩu hiện tại" />
            <input className="finput" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" />
            <input className="finput" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" />
          </div>
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

export function EmployeeModal() {
  const { openModal, closeM, showToast, staff, store, refreshStaff, selectedWorkDate, workShifts } = useApp();
  const isOpen = openModal === 'sm-staff' || openModal?.startsWith('sm-staff-');
  const editingId = openModal?.startsWith('sm-staff-') ? Number(openModal.split('-').pop()) : undefined;
  const editing = staff.find(item => item.id === editingId);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('STAFF');
  const [shiftId, setShiftId] = useState(0);
  useEffect(() => { setName(editing?.name ?? ''); setPhone(editing?.phone ?? ''); setRole(editing?.role ?? 'STAFF'); setShiftId(workShifts[0]?.id ?? 0); }, [editingId, editing?.name, editing?.phone, editing?.role, workShifts]);
  const save = async () => {
    if (!name.trim() || !store) { showToast('Vui lòng nhập tên nhân viên', 'red'); return; }
    try {
      const payload = { name, phone, role };
      const employee = editingId ? await updateEmployee(editingId, payload) : await createEmployee(store.storeId, payload);
      if (!editingId) {
        if (!shiftId) throw new Error(`Chưa có ca làm việc trong ngày ${selectedWorkDate}`);
        await assignEmployee(store.storeId, shiftId, employee.employeeId);
      }
      await refreshStaff(); closeM(openModal ?? 'sm-staff'); showToast(editingId ? 'Đã cập nhật nhân viên' : 'Đã thêm nhân viên', 'grn');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể lưu nhân viên', 'red'); }
  };
  return <div className={`mov${isOpen ? ' open' : ''}`} onClick={() => closeM(openModal ?? 'sm-staff')}>
    <div className="modal" onClick={event => event.stopPropagation()}>
      <div className="mhd"><div className="mtitle">{editingId ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}</div><button className="mxbtn" onClick={() => closeM(openModal ?? 'sm-staff')}><svg className="icon icon-sm"><use href="#i-x" /></svg></button></div>
      <div className="frow" style={{ marginBottom: 11 }}><div className="fg"><label className="flbl">Tên nhân viên</label><input className="finput" value={name} onChange={event => setName(event.target.value)} placeholder="Nguyễn Văn A" /></div><div className="fg"><label className="flbl">Số điện thoại</label><input className="finput" value={phone} onChange={event => setPhone(event.target.value)} placeholder="09xx xxx xxx" /></div></div>
      <div className="frow" style={{ marginBottom: 18 }}><div className="fg"><label className="flbl">Vai trò</label><select className="finput" value={role} onChange={event => setRole(event.target.value)}><option value="STAFF">Nhân viên</option><option value="MANAGER">Quản lý</option></select></div>{!editingId && <div className="fg"><label className="flbl">Phân ca ngày {selectedWorkDate}</label><select className="finput" value={shiftId} onChange={event => setShiftId(Number(event.target.value))} disabled={!workShifts.length}>{!workShifts.length && <option value={0}>Chưa có ca làm việc</option>}{workShifts.map(shift => <option key={shift.id} value={shift.id}>{shift.name} ({shift.start}-{shift.end})</option>)}</select></div>}</div>
      <div style={{ display: 'flex', gap: 9 }}><button className="bs" onClick={() => closeM(openModal ?? 'sm-staff')} style={{ flex: 1 }}>Hủy</button><button className="bp" onClick={() => void save()} style={{ flex: 2 }}><svg className="icon icon-sm"><use href="#i-check" /></svg>Lưu nhân viên</button></div>
    </div>
  </div>;
}

export function AssignEmployeeModal() {
  const { openModal, closeM, showToast, staff, workShifts, store, refreshStaff } = useApp();
  const shiftId = openModal?.startsWith('sm-assign-') ? Number(openModal.split('-').pop()) : 0;
  const shift = workShifts.find(item => item.id === shiftId);
  const assigned = new Set(shift?.employees.map(employee => employee.id));
  const available = staff.filter(employee => !assigned.has(employee.id));
  const [employeeId, setEmployeeId] = useState(0);
  const isOpen = Boolean(shift);
  // Reset the selection when the selected day/shift data changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setEmployeeId(available[0]?.id ?? 0); }, [shiftId, staff.length, shift?.employees.length]);
  const assign = async () => {
    if (!store || !shiftId || !employeeId) { showToast('Chưa chọn nhân viên hoặc ca làm việc', 'red'); return; }
    try { await assignEmployee(store.storeId, shiftId, employeeId); await refreshStaff(); closeM(openModal ?? 'sm-assign'); showToast('Đã phân nhân viên vào ca', 'grn'); } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể phân ca', 'red'); }
  };
  return <div className={`mov${isOpen ? ' open' : ''}`} onClick={() => closeM(openModal ?? 'sm-assign')}>
    <div className="modal" onClick={event => event.stopPropagation()}>
      <div className="mhd"><div className="mtitle">Phân nhân viên vào {shift?.name}</div><button className="mxbtn" onClick={() => closeM(openModal ?? 'sm-assign')}><svg className="icon icon-sm"><use href="#i-x" /></svg></button></div>
      <label className="flbl">Nhân viên có sẵn</label>
      <select className="finput" value={employeeId} onChange={event => setEmployeeId(Number(event.target.value))} disabled={!available.length}>{!available.length && <option value={0}>Tất cả nhân viên đã được phân ca</option>}{available.map(employee => <option key={employee.id} value={employee.id}>{employee.name} · {employee.phone || 'Chưa có SĐT'}</option>)}</select>
      <div style={{ display: 'flex', gap: 9, marginTop: 18 }}><button className="bs" onClick={() => closeM(openModal ?? 'sm-assign')} style={{ flex: 1 }}>Hủy</button><button className="bp" onClick={() => void assign()} disabled={!available.length} style={{ flex: 2 }}>Phân vào ca</button></div>
    </div>
  </div>;
}

export function RemoveEmployeeModal() {
  const { openModal, closeM, showToast, store, refreshStaff } = useApp();
  const parts = openModal?.startsWith('sm-remove-') ? openModal.split('-').slice(2).map(Number) : [];
  const [shiftId, employeeId] = parts;
  const isOpen = Boolean(shiftId && employeeId);
  const remove = async () => { if (!store) return; try { await unassignEmployee(store.storeId, shiftId, employeeId); await refreshStaff(); closeM(openModal ?? 'sm-remove'); showToast('Đã xóa nhân viên khỏi ca hôm đó', 'grn'); } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể xóa khỏi ca', 'red'); } };
  return <div className={`mov${isOpen ? ' open' : ''}`} onClick={() => closeM(openModal ?? 'sm-remove')}><div className="modal" onClick={event => event.stopPropagation()}><div className="mhd"><div className="mtitle">Xóa nhân viên khỏi ca?</div><button className="mxbtn" onClick={() => closeM(openModal ?? 'sm-remove')}><svg className="icon icon-sm"><use href="#i-x" /></svg></button></div><p style={{ fontSize: 13, color: 'var(--ts)' }}>Chỉ xóa phân ca của ngày đang xem. Hồ sơ nhân viên vẫn được giữ lại.</p><div style={{ display: 'flex', gap: 9, marginTop: 18, justifyContent: 'flex-end' }}><button className="bs" onClick={() => closeM(openModal ?? 'sm-remove')}>Hủy</button><button className="br" onClick={() => void remove()}>Xóa khỏi ca</button></div></div></div>;
}

// ─── Modal Thêm máy ───
export function MachineModal() {
  const { openModal, closeM, showToast, machines, store, refreshOrders } = useApp();
  const isOpen = openModal === 'sm-machine' || openModal?.startsWith('sm-machine-');
  const editingId = openModal?.startsWith('sm-machine-') ? Number(openModal.split('-').pop()) : undefined;
  const editing = machines.find(machine => machine.id === editingId);

  const [name, setName] = useState('');
  const [type, setType] = useState<'wash' | 'dry' | ''>('');
  const [machKg, setMachKg] = useState('');
  const [machTime, setMachTime] = useState('');
  const [status, setStatus] = useState<'AVAILABLE' | 'RUNNING' | 'BROKEN' | 'INACTIVE'>('AVAILABLE');
  useEffect(() => { setName(editing?.name ?? ''); setType(editing?.type ?? ''); setMachKg(editing ? String(editing.kg) : ''); setMachTime(editing ? String(editing.time) : ''); setStatus(editing?.status ?? 'AVAILABLE'); }, [editingId, editing]);

  const saveMachine = async () => {
    if (!type || !machKg || !machTime) {
      showToast('Vui lòng chọn loại máy và nhập số kg, phút', 'red');
      return;
    }
    if (!store) return;
    try {
      const payload = { name: name || `Máy ${machines.length + 1}`, type: type === 'wash' ? 'WASHER' : 'DRYER', capacityKg: +machKg, processingMinutes: +machTime, status: editing ? status : 'AVAILABLE' };
      if (editingId) await updateMachine(editingId, payload); else await createMachine(store.storeId, payload);
      await refreshOrders(); closeM(openModal ?? 'sm-machine'); showToast(editingId ? 'Đã cập nhật máy móc' : 'Đã thêm máy móc', 'grn');
      setName(''); setType(''); setMachKg(''); setMachTime('');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể lưu máy', 'red'); }
  };
  const remove = async () => {
    if (!editingId) return;
    try { await deleteMachine(editingId); await refreshOrders(); closeM(openModal ?? 'sm-machine'); showToast('Đã xóa máy', 'grn'); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Không thể xóa máy', 'red'); }
  };

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id="sm-machine" onClick={() => closeM('sm-machine')}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">{editingId ? 'Cập nhật máy' : 'Thêm máy'}</div>
          <button className="mxbtn" onClick={() => closeM('sm-machine')}>
            <svg className="icon icon-sm"><use href="#i-x" /></svg>
          </button>
        </div>

        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg" style={{ width: '100%' }}>
            <label className="flbl">Tên máy</label>
            <input className="finput" type="text" value={name} onChange={e => setName(e.target.value)} placeholder={editing?.name ?? `Máy ${machines.length + 1}`} maxLength={100} disabled={Boolean(editing?.locked)} />
          </div>
        </div>
        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg" style={{ width: '100%' }}>
            <label className="flbl">Loại máy</label>
            <select className="finput" value={type || (editing?.type ?? '')} onChange={e => setType(e.target.value as 'wash' | 'dry')} disabled={Boolean(editing?.locked)}>
              <option value="" disabled hidden>Chọn loại máy</option>
              <option value="wash">Máy Giặt</option>
              <option value="dry">Máy Sấy</option>
            </select>
          </div>
        </div>
        <div className="frow" style={{ marginBottom: 18 }}>
          <div className="fg">
            <label className="flbl">Khối lượng (kg)</label>
            <input className="finput" type="number" value={machKg} onChange={e => setMachKg(e.target.value)} placeholder={editing ? String(editing.kg) : 'VD: 7'} disabled={Boolean(editing?.locked)} />
          </div>
          <div className="fg">
            <label className="flbl">Thời gian xử lý (phút)</label>
            <input className="finput" type="number" value={machTime} onChange={e => setMachTime(e.target.value)} placeholder={editing ? String(editing.time) : 'VD: 30'} disabled={Boolean(editing?.locked)} />
          </div>
        </div>
        {editingId && <div className="frow" style={{ marginBottom: 18 }}><div className="fg" style={{ width: '100%' }}><label className="flbl">Trạng thái máy</label><select className="finput" value={status} onChange={e => setStatus(e.target.value as typeof status)}><option value="AVAILABLE">Sẵn sàng</option><option value="BROKEN">Hỏng</option><option value="INACTIVE">Ngừng hoạt động</option><option value="RUNNING">Đang chạy</option></select>{editing?.locked && <div className="machine-lock-hint">Máy đang gắn với order chưa hoàn thành. Chỉ được đổi trạng thái.</div>}</div></div>}

        <div style={{ display: 'flex', gap: 9 }}>
          {editingId && <button className="br" onClick={() => void remove()}>Xóa</button>}
          <button className="bs" onClick={() => closeM(openModal ?? 'sm-machine')} style={{ flex: 1 }}>Hủy</button>
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
  let stageKeys: string[] = [];
  if (actualSvc === 'combo') { stages = ['Phân loại', 'Đang giặt', 'Chuyển đồ', 'Đang sấy', 'Đóng gói']; stageKeys = ['SORTING', 'WASH', 'TRANSFER', 'DRY', 'PACKING']; }
  else if (actualSvc === 'wash') { stages = ['Phân loại', 'Đang giặt', 'Đóng gói']; stageKeys = ['SORTING', 'WASH', 'PACKING']; }
  else { stages = ['Phân loại', 'Đang sấy', 'Đóng gói']; stageKeys = ['SORTING', 'DRY', 'PACKING']; }

  const stageList = order?.stages ?? [];
  const cur = Math.max(0, stageList.findIndex((stage: any) => stage.status !== 'COMPLETED'));

  const availMachines = machines;

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
        {order?.groupCode && <div className="order-group-eta"><span>Mẻ này dự kiến xong</span><strong>{order.estimatedAt ? new Date(order.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa xác định'}</strong><span>Cả nhóm dự kiến xong</span><strong>{order.groupETA ? new Date(order.groupETA).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa xác định'}</strong></div>}

        {/* Progress steps */}
        <div style={{ display: 'flex', margin: '14px 0' }}>
          {stages.map((s, i) => {
            const done = i < cur;
            const act = i === cur;
            const stage = stageList.find((item: any) => item.stage === stageKeys[i]);
            const plannedTime = stage?.plannedStartAt ? new Date(stage.plannedStartAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
            return (
              <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', margin: '0 auto', zIndex: 1, position: 'relative', background: done || act ? '#7c3aed' : '#e2e8f0', color: done || act ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {done ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: '8.5px', color: act ? '#7c3aed' : '#9ca3af', marginTop: 3, fontWeight: act ? 700 : 400 }}>{s}</div>
                <div className="stage-time">{plannedTime}</div>
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
          {p.readOnly ? (
            <>
              <span style={{ marginRight: 'auto', alignSelf: 'center', fontSize: 11, color: 'var(--ts)' }}>Chế độ xem không thay đổi dữ liệu.</span>
              <button className="bs" onClick={() => closeM('om')}>Đóng</button>
            </>
          ) : p.isWaiting ? (
            <>
              <button className="bs" onClick={() => closeM('om')}>Đóng</button>
              <select className="finput" style={{ width: 160, padding: '7px 10px', height: 35 }}>
                {availMachines.map(m => (
                  <option key={m.id} value={m.id}>
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
