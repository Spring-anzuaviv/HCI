/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useEffect, useState, useRef, useMemo } from 'react';
import { useApp } from '../context/useApp';
import { apiGet, apiPost } from '../api/client';
import { changePassword, logout } from '../api/auth';
import { createMachine, deleteMachine, updateMachine } from '../api/machines';
import { createEmployee, updateEmployee, updateShift, assignEmployee, unassignEmployee } from '../api/staff';
import { updateStoreName } from '../api/store';
import { startRun, completeRun, checkExpedite, confirmExpedite } from '../api/orders';
import { useAsyncAction, useKeyedAsyncAction } from '../hooks/useAsyncAction';
import { AlertTriangle, Check, CheckCircle2, Clock3, Info, LoaderCircle, Plus, Zap, X } from 'lucide-react';

// ─── Modal Thêm đơn hàng ───
export function AddOrderModal() {
  const { openModal, closeM, showToast, store, refreshOrders } = useApp();
  const isOpen = openModal === 'am';

  const [kg, setKg] = useState(3);
  const [pickupDateValue, setPickupDateValue] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
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
  const [splitCheckResult, setSplitCheckResult] = useState<{ text: string; isRisk: boolean } | null>(null);
  const [createdSummary, setCreatedSummary] = useState<Array<{ index: number; estimatedAt?: string; groupETA?: string }>>([]);
  const { pending: submitting, run: runSubmit } = useAsyncAction(`orders:create:${store?.storeId ?? 'none'}`);
  const calcTimerRef = useRef<number | null>(null);
  const splitTimerRef = useRef<number | null>(null);
  const calcControllerRef = useRef<AbortController | null>(null);
  const splitControllerRef = useRef<AbortController | null>(null);
  useEffect(() => { if (isOpen) setCreatedSummary([]); }, [isOpen]);
  useEffect(() => () => {
    if (calcTimerRef.current !== null) window.clearTimeout(calcTimerRef.current);
    if (splitTimerRef.current !== null) window.clearTimeout(splitTimerRef.current);
    calcControllerRef.current?.abort();
    splitControllerRef.current?.abort();
  }, []);
  const [calcResult, setCalcResult] = useState<{ text: string; isRisk: boolean; loading?: boolean } | null>(null);

  const pickupDate = (dateValue: string, timeValue: string) => {
    const date = new Date(`${dateValue}T${timeValue}:00`);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString();
  };

  const todayValue = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const checkDateTime = (dateValue: string, timeValue: string) => {
    const date = new Date(`${dateValue}T${timeValue}:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const checkDeadline = async (newSvc: typeof svc, newKg: number, newDate: string, newTime: string, signal?: AbortSignal) => {
    if (!newKg || newKg <= 0 || !newDate || !newTime || !store) return null;
    const pickupAt = pickupDate(newDate, newTime);
    if (!pickupAt) return null;
    const result = await apiPost<any>(`/stores/${store.storeId}/deadline-check`, {
      weightKg: newKg, serviceType: newSvc === 'combo' ? 'WASH_DRY' : newSvc.toUpperCase(), pickupAt,
    }, { signal });
    return result;
  };

  const checkDeadlineGroup = async (parts: typeof splitParts, dateValue: string, pickupTime: string, signal?: AbortSignal) => {
    if (!store) return null;
    const pickupAt = pickupDate(dateValue, pickupTime);
    if (!pickupAt) return null;
    return apiPost<any>(`/stores/${store.storeId}/deadline-group-check`, {
      pickupAt,
      parts: parts.map(part => ({ weightKg: Number(part.weight), serviceType: part.service === 'combo' ? 'WASH_DRY' : part.service.toUpperCase() })),
    }, { signal });
  };

  /*
   * Date and time are kept separately in the form, but always sent as one
   * local datetime so 01:50 AM is not accidentally attached to the wrong day.
   */
  const updateSplitEstimates = (parts = splitParts, pickupTime = time, dateValue = pickupDateValue, enabled = isSplit) => {
    if (!enabled || !store || !pickupTime) { setSplitEstimates([]); setSplitGroupETA(null); return; }
    if (splitTimerRef.current !== null) window.clearTimeout(splitTimerRef.current);
    splitControllerRef.current?.abort();
    splitTimerRef.current = window.setTimeout(() => {
      const controller = new AbortController();
      splitControllerRef.current = controller;
        void checkDeadlineGroup(parts, dateValue, pickupTime, controller.signal)
        .then(result => {
          if (controller.signal.aborted) return;
          const estimates = parts.map((_, index) => result?.parts?.[index]?.estimatedAt ?? null);
          setSplitCheckResult(result ? { text: result.reason, isRisk: result.result !== 'FEASIBLE' } : null);
          setSplitEstimates(estimates);
          setSplitGroupETA(result?.groupETA ?? null);
        })
        .catch(error => {
          if (error?.name === 'AbortError') return;
          setSplitCheckResult({ text: error instanceof Error ? error.message : 'Không thể kiểm tra lịch các mẻ', isRisk: true });
          setSplitEstimates([]); setSplitGroupETA(null);
        });
    }, 300);
  };

  const updateCalc = (newSvc = svc, newKg = kg, newTime = time, dateValue = pickupDateValue) => {
    if (!newKg || newKg <= 0 || !newTime || !dateValue || !store) { setCalcResult(null); return; }
    setCalcResult({ text: 'Đang kiểm tra lịch máy...', isRisk: false, loading: true });
    if (calcTimerRef.current !== null) window.clearTimeout(calcTimerRef.current);
    calcControllerRef.current?.abort();
    calcTimerRef.current = window.setTimeout(() => {
      const controller = new AbortController();
      calcControllerRef.current = controller;
      void checkDeadline(newSvc, newKg, dateValue, newTime, controller.signal)
        .then(result => {
          if (controller.signal.aborted) return;
          if (!result) { setCalcResult(null); return; }
          const eta = result.estimatedAt ? new Date(result.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'chưa xác định';
          const isRisk = result.result === 'AT_RISK' || result.result === 'NOT_FEASIBLE';
          let durationText = '';
          if (result.requiredMinutes) {
            const hrs = Math.floor(result.requiredMinutes / 60);
            const mins = result.requiredMinutes % 60;
            durationText = hrs > 0
              ? ` · Mất khoảng ${hrs} giờ${mins > 0 ? ` ${mins} phút` : ''} để xử lý`
              : ` · Mất khoảng ${mins} phút để xử lý`;
          }
           setCalcResult({ isRisk, text: `${result.reason}. Dự kiến xong: ${eta}${durationText}.` });
        })
        .catch(error => {
          if (error?.name === 'AbortError') return;
          setCalcResult({ isRisk: true, text: error instanceof Error ? error.message : 'Không thể kiểm tra giờ hẹn.' });
        });
    }, 300);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !kg || !time || !pickupDateValue || !store) { showToast('Vui lòng nhập đủ tên, số điện thoại, khối lượng, ngày và giờ hẹn', 'red'); return; }
    const selectedPickup = checkDateTime(pickupDateValue, time);
    if (!selectedPickup || pickupDateValue < todayValue()) { showToast('Ngày hẹn không được nằm trong quá khứ', 'red'); return; }
    const parts = isSplit ? splitParts : [{ weight: String(kg), service: svc, note }];
    const weights = parts.map(part => Number(part.weight));
    if (isSplit && (weights.some(weight => !Number.isFinite(weight) || weight <= 0) || Math.abs(weights.reduce((sum, weight) => sum + weight, 0) - kg) > 0.01)) {
      showToast('Tổng khối lượng các phần phải bằng khối lượng đơn', 'red'); return;
    }
    /*
     * Tạm thời bỏ kiểm tra giờ hẹn theo giờ làm việc của ca.
     * Vẫn giữ deadline-check bên dưới để kiểm tra khả năng hoàn thành đơn.
     * const [hour, minute] = time.split(':').map(Number);
     * const pickupMinutes = hour * 60 + minute;
     * const now = new Date();
     * const currentMinutes = now.getHours() * 60 + now.getMinutes();
     * const shiftEnds = config.shifts.map(shift => {
     *   const [hours, minutes] = shift.end.split(':').map(Number);
     *   return (hours === 0 ? 24 : hours) * 60 + minutes;
     * });
     * const lastShiftEnd = shiftEnds.length ? Math.max(...shiftEnds) : 22 * 60;
     * if (pickupMinutes <= currentMinutes || pickupMinutes > lastShiftEnd) {
     *   showToast('Giờ hẹn đã quá hoặc nằm ngoài giờ làm việc của ca', 'red'); return;
     * }
     */
    await runSubmit(async () => {
    try {
      const groupCode = isSplit ? `GROUP-${Date.now()}` : undefined;
      if (isSplit) {
         const check = await checkDeadlineGroup(splitParts, pickupDateValue, time);
        if (!check || check.result !== 'FEASIBLE') { showToast(check?.reason ?? 'Giờ hẹn không khả thi, đơn chưa được tạo', 'red'); return; }
      } else {
         const check = await checkDeadline(svc, kg, pickupDateValue, time);
        if (!check || check.result !== 'FEASIBLE') { showToast(check?.reason ?? 'Giờ hẹn không khả thi, đơn chưa được tạo', 'red'); return; }
      }
      const payloads = parts.map(part => ({
          customer: { name: name.trim(), phone: phone.trim() }, weightKg: Number(part.weight),
           serviceType: part.service === 'combo' ? 'WASH_DRY' : part.service.toUpperCase(), pickupAt: pickupDate(pickupDateValue, time),
          readyAt: new Date().toISOString(), note: part.note, groupCode,
      }));
      const createdOrders: Array<{ estimatedAt?: string }> = isSplit
        ? await apiPost<Array<{ estimatedAt?: string }>>(`/stores/${store.storeId}/orders/batch`, { orders: payloads })
        : [await apiPost<{ estimatedAt?: string }>(`/stores/${store.storeId}/orders`, payloads[0])];
      const groupETA = createdOrders.reduce<string | undefined>((latest, order) => !order.estimatedAt || (latest && latest > order.estimatedAt) ? latest : order.estimatedAt, undefined);
      setCreatedSummary(createdOrders.map((order, index) => ({ index: index + 1, estimatedAt: order.estimatedAt, groupETA })));
      closeM('am');
      showToast(isSplit ? `Đã tạo ${weights.length} đơn trong cùng nhóm cho ${name}` : `Đã tạo đơn cho ${name}`, 'grn');
      void refreshOrders();
      setName(''); setPhone(''); setNote(''); setIsSplit(false); setSplitParts([{ weight: '1.5', service: 'combo', note: '' }, { weight: '1.5', service: 'combo', note: '' }]);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể tạo đơn', 'red'); }
    });
  };

  const CalcIcon = calcResult?.loading ? LoaderCircle : calcResult?.isRisk ? AlertTriangle : CheckCircle2;

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id="am" onClick={() => closeM('am')}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">Thêm đơn hàng mới</div>
          <button className="mxbtn" onClick={() => closeM('am')}>
             <X className="icon icon-sm" aria-hidden="true" />
          </button>
        </div>

        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg">
            <label className="flbl">Khối lượng (kg)</label>
            <input className="finput" type="number" value={kg} onChange={e => { setKg(+e.target.value); updateCalc(svc, +e.target.value, time); if (isSplit) void updateSplitEstimates(splitParts); }} />
          </div>
          <div className="fg">
            <label className="flbl">Ngày hẹn lấy</label>
            <input className="finput" type="date" min={todayValue()} value={pickupDateValue} onChange={e => { setPickupDateValue(e.target.value); updateCalc(svc, kg, time, e.target.value); void updateSplitEstimates(splitParts, time, e.target.value); }} />
          </div>
          <div className="fg">
            <label className="flbl">Giờ hẹn lấy</label>
          <input className="finput" type="time" value={time} onChange={e => { setTime(e.target.value); updateCalc(svc, kg, e.target.value, pickupDateValue); void updateSplitEstimates(splitParts, e.target.value, pickupDateValue); }} />
          </div>
        </div>

        {!isSplit && (
          <div className="frow" style={{ marginBottom: 11 }}>
            <div className="fg">
              <label className="flbl">Dịch vụ</label>
              <select className="finput" value={svc} onChange={e => { const v = e.target.value as typeof svc; setSvc(v); updateCalc(v, kg, time, pickupDateValue); }}>
                <option value="combo">Giặt + Sấy</option>
                <option value="wash">Chỉ giặt</option>
              <option value="dry">Chỉ sấy</option>
            </select>
          </div>
        </div>)}

        {!isSplit && <div id="add-calc" style={{
          background: calcResult ? (calcResult.isRisk ? '#fef2f2' : '#f0fdf4') : '#f1f5f9',
          borderRadius: 9, padding: '11px 14px', marginBottom: 14,
          fontSize: '11.5px', color: calcResult ? (calcResult.isRisk ? '#991b1b' : '#166534') : 'var(--ts)',
        }}>
           {calcResult ? <><CalcIcon className={`icon icon-sm${calcResult.loading ? ' oq-spin' : ''}`} aria-hidden="true" /> {calcResult.text}</> : <><strong>Dự tính:</strong> Vui lòng nhập thông tin để hệ thống kiểm tra giờ.</>}
        </div>}
        {createdSummary.length > 0 && <div className="created-summary">
          <strong>Đã tạo thành công</strong>
          {createdSummary.map(item => <div className="created-summary-row" key={item.index}><span>Mẻ {item.index}</span><span>Mẻ này xong: <b>{item.estimatedAt ? new Date(item.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa xác định'}</b></span><span>Cả nhóm: <b>{item.groupETA ? new Date(item.groupETA).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa xác định'}</b></span></div>)}
        </div>}

        <label className="split-toggle">
         <input type="checkbox" checked={isSplit} onChange={e => { setIsSplit(e.target.checked); if (e.target.checked) { const parts = [{ weight: String((kg / 2).toFixed(2)), service: svc, note: '' }, { weight: String((kg / 2).toFixed(2)), service: svc, note: '' }]; setSplitParts(parts); void updateSplitEstimates(parts, time, pickupDateValue, true); } else { setSplitEstimates([]); setSplitGroupETA(null); } }} />
          <span>Tách đơn thành nhiều mẻ</span>
        </label>
        {isSplit && <div className="split-box">
          <div className="split-box-title">Các mẻ <span>Tổng: {splitParts.reduce((sum, part) => sum + (Number(part.weight) || 0), 0).toFixed(2)} / {kg}kg</span></div>
          {splitParts.map((part, index) => <div className="split-part" key={index}><span>Mẻ {index + 1}</span><input className="finput" type="number" min="0.1" step="0.1" value={part.weight} onChange={e => { const parts = splitParts.map((item, partIndex) => partIndex === index ? { ...item, weight: e.target.value } : item); setSplitParts(parts); void updateSplitEstimates(parts); }} /><select className="finput split-service" value={part.service} onChange={e => { const parts = splitParts.map((item, partIndex) => partIndex === index ? { ...item, service: e.target.value as 'combo' | 'wash' | 'dry' } : item); setSplitParts(parts); void updateSplitEstimates(parts); }}><option value="combo">Giặt + Sấy</option><option value="wash">Chỉ giặt</option><option value="dry">Chỉ sấy</option></select><input className="finput split-note" type="text" value={part.note} onChange={e => setSplitParts(parts => parts.map((item, partIndex) => partIndex === index ? { ...item, note: e.target.value } : item))} placeholder="Ghi chú mẻ" />{splitParts.length > 2 && <button type="button" className="split-remove" onClick={() => { const parts = splitParts.filter((_, partIndex) => partIndex !== index); setSplitParts(parts); void updateSplitEstimates(parts); }}>Xóa</button>}</div>)}
          <button type="button" className="bs split-add" onClick={() => { const parts = [...splitParts, { weight: '0', service: 'combo' as const, note: '' }]; setSplitParts(parts); void updateSplitEstimates(parts); }}>+ Thêm mẻ</button>
          <div className="split-eta"><strong>Thời gian dự kiến</strong>{splitEstimates.length ? splitEstimates.map((estimate, index) => <span key={index}>Mẻ {index + 1}: <b>{estimate ? new Date(estimate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa xác định'}</b></span>) : <span>Đang kiểm tra lịch máy...</span>}{splitGroupETA && <span className="split-group-eta">Cả nhóm hoàn tất: <b>{new Date(splitGroupETA).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</b></span>}{splitCheckResult && <span className={splitCheckResult.isRisk ? 'split-check-risk' : 'split-check-ok'}>{splitCheckResult.text}</span>}</div>
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
          <button className="bp" onClick={handleSubmit} disabled={submitting} aria-busy={submitting}>
             {submitting ? <LoaderCircle className="icon icon-sm oq-spin" aria-hidden="true" /> : <Plus className="icon icon-sm" aria-hidden="true" />}
            {submitting ? 'Đang tạo...' : 'Tạo đơn'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Cài đặt ───
export function SettingsModal() {
  const { openModal, closeM, showToast, config, setConfig, store, openM } = useApp();
  const isOpen = openModal === 'sm';

  const [shopName, setShopName] = useState(config.shopName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { pending: savingSettings, run: runSettings } = useAsyncAction(`settings:${store?.storeId ?? 'none'}`);
  useEffect(() => {
    if (isOpen) { setShopName(config.shopName); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
  }, [isOpen, config.shopName]);

  const saveSettings = async () => {
    await runSettings(async () => {
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
    });
  };

  const handleLogout = async () => {
    await runSettings(async () => {
      await logout();
      window.location.reload();
    });
  };

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id="sm" onClick={() => closeM('sm')}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">Cài đặt</div>
          <button className="mxbtn" onClick={() => closeM('sm')}>
           <X className="icon icon-sm" aria-hidden="true" />
          </button>
        </div>

        <div style={{ marginBottom: 12, marginTop: 10 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Tên cửa hàng</label>
          <input
            type="text"
            value={shopName}
            disabled={savingSettings}
            onChange={e => setShopName(e.target.value)}
            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 6, height: 32, padding: '0 10px', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Bảo mật</label>
          <div className="password-fields">
            <input className="finput" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Mật khẩu hiện tại" disabled={savingSettings} />
            <input className="finput" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" disabled={savingSettings} />
            <input className="finput" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" disabled={savingSettings} />
          </div>
        </div>

        <button className="bs" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 18 }} onClick={() => openM('sm-shifts')}>
           <Clock3 className="icon icon-sm" aria-hidden="true" />
          Chỉnh ca ngày đang xem
        </button>

        <div style={{ display: 'flex', gap: 9, justifyContent: 'space-between' }}>
          <button className="bs" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => { void handleLogout(); }} disabled={savingSettings}>
            Đăng xuất
          </button>
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="bs" onClick={() => closeM('sm')}>Hủy</button>
            <button className="bp" onClick={saveSettings} disabled={savingSettings} aria-busy={savingSettings}>
               {savingSettings ? <LoaderCircle className="icon icon-sm oq-spin" aria-hidden="true" /> : <Check className="icon icon-sm" aria-hidden="true" />}
              {savingSettings ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShiftSettingsModal() {
  const { openModal, closeM, showToast, selectedWorkDate, workShifts, store, refreshStaff } = useApp();
  const [values, setValues] = useState<Record<number, { name: string; start: string; end: string }>>({});
  const { pending: saving, run: runSave } = useAsyncAction(`shift-settings:${selectedWorkDate}`);
  const isOpen = openModal === 'sm-shifts';

  useEffect(() => {
    if (!isOpen) return;
    setValues(Object.fromEntries(workShifts.map(shift => [shift.id, { name: shift.name, start: shift.start, end: shift.end }])));
  }, [isOpen, workShifts]);

  const save = async () => {
    if (!store || !workShifts.length) return;
    await runSave(async () => {
      try {
        for (const shift of workShifts) {
          const value = values[shift.id];
          if (!value) continue;
          await updateShift(store.storeId, shift.id, value);
        }
        closeM('sm-shifts');
        await refreshStaff();
        showToast(`Đã cập nhật ca ngày ${selectedWorkDate}`, 'grn');
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Không thể cập nhật ca', 'red');
      }
    });
  };

  const timeOptions = (value: string, onChange: (value: string) => void, disabled: boolean) => {
    const [hour = '00', minute = '00'] = value.split(':');
    return <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <select className="finput" value={hour} disabled={disabled} onChange={event => onChange(`${event.target.value}:${minute}`)} aria-label="Giờ">
        {Array.from({ length: 24 }, (_, index) => { const option = String(index).padStart(2, '0'); return <option key={option} value={option}>{option}</option>; })}
      </select>
      <span aria-hidden="true">:</span>
      <select className="finput" value={minute} disabled={disabled} onChange={event => onChange(`${hour}:${event.target.value}`)} aria-label="Phút">
        {Array.from({ length: 60 }, (_, index) => { const option = String(index).padStart(2, '0'); return <option key={option} value={option}>{option}</option>; })}
      </select>
    </div>;
  };

  return <div className={`mov${isOpen ? ' open' : ''}`} onClick={() => closeM('sm-shifts')}>
    <div className="modal" onClick={event => event.stopPropagation()}>
      <div className="mhd"><div className="mtitle">Chỉnh ca ngày {selectedWorkDate}</div><button className="mxbtn" onClick={() => closeM('sm-shifts')}><X className="icon icon-sm" aria-hidden="true" /></button></div>
      {!workShifts.length && <p style={{ fontSize: 13, color: 'var(--ts)' }}>Ngày này chưa có ca để chỉnh.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {workShifts.map(shift => {
          const value = values[shift.id] ?? { name: shift.name, start: shift.start, end: shift.end };
          return <div key={shift.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
            <div className="fg" style={{ marginBottom: 10 }}><label className="flbl">Tên ca</label><input className="finput" value={value.name} disabled={saving} onChange={event => setValues(prev => ({ ...prev, [shift.id]: { ...value, name: event.target.value } }))} /></div>
            <div className="frow"><div className="fg"><label className="flbl">Bắt đầu (24 giờ)</label>{timeOptions(value.start, start => setValues(prev => ({ ...prev, [shift.id]: { ...value, start } })), saving)}</div><div className="fg"><label className="flbl">Kết thúc (24 giờ)</label>{timeOptions(value.end, end => setValues(prev => ({ ...prev, [shift.id]: { ...value, end } })), saving)}</div></div>
          </div>;
        })}
      </div>
      <div style={{ display: 'flex', gap: 9, marginTop: 18 }}><button className="bs" onClick={() => closeM('sm-shifts')} style={{ flex: 1 }}>Hủy</button><button className="bp" onClick={() => void save()} disabled={saving || !workShifts.length} style={{ flex: 2 }}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div>
    </div>
  </div>;
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
  const { pending: saving, run: runEmployeeAction } = useAsyncAction(`employee:${editingId ?? 'new'}`);

  useEffect(() => {
    setName(editing?.name ?? '');
    setPhone(editing?.phone ?? '');
    setRole(editing?.role ?? 'STAFF');
    setShiftId(workShifts[0]?.id ?? 0);
  }, [editingId, editing?.name, editing?.phone, editing?.role, workShifts, isOpen]);

  const save = async () => {
    if (!name.trim()) { showToast('Vui lòng nhập tên nhân viên', 'red'); return; }
    if (!store) { showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'red'); return; }
    await runEmployeeAction(async () => {
      try {
      const payload = { name: name.trim(), phone: phone.trim(), role };
      if (editingId) {
        await updateEmployee(editingId, payload);
        closeM(openModal ?? 'sm-staff');
        showToast('Đã cập nhật nhân viên', 'grn');
        void refreshStaff();
      } else {
        const employee = await createEmployee(store.storeId, payload);
        // Gán ca nếu có ca — nếu không có ca thì vẫn tạo nhân viên thành công
        if (shiftId && employee?.employeeId) {
          try {
            await assignEmployee(store.storeId, shiftId, employee.employeeId);
          } catch (assignErr) {
            // Nhân viên đã tạo thành công — chỉ cảnh báo về lỗi gán ca
            showToast(`Đã thêm nhân viên nhưng không gán được ca: ${assignErr instanceof Error ? assignErr.message : 'Lỗi không xác định'}`, 'am');
            closeM(openModal ?? 'sm-staff');
            void refreshStaff();
            return;
          }
        }
        closeM(openModal ?? 'sm-staff');
        showToast('Đã thêm nhân viên' + (shiftId ? ' và gán vào ca' : ''), 'grn');
        void refreshStaff();
      }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Không thể lưu nhân viên';
        showToast(msg, 'red');
      }
    });
  };

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} onClick={() => closeM(openModal ?? 'sm-staff')}>
      <div className="modal" onClick={event => event.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">{editingId ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}</div>
          <button className="mxbtn" onClick={() => closeM(openModal ?? 'sm-staff')}>
             <X className="icon icon-sm" aria-hidden="true" />
          </button>
        </div>

        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg">
            <label className="flbl">Tên nhân viên <span style={{ color: 'var(--rd)' }}>*</span></label>
            <input className="finput" value={name} onChange={e => setName(e.target.value)}
              placeholder="Nguyễn Văn A" disabled={saving} autoFocus />
          </div>
          <div className="fg">
            <label className="flbl">Số điện thoại</label>
            <input className="finput" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="09xx xxx xxx" disabled={saving} />
          </div>
        </div>

        <div className="frow" style={{ marginBottom: 18 }}>
          <div className="fg">
            <label className="flbl">Vai trò</label>
            <select className="finput" value={role} onChange={e => setRole(e.target.value)} disabled={saving}>
              <option value="STAFF">Nhân viên</option>
              <option value="MANAGER">Quản lý</option>
            </select>
          </div>
          {!editingId && (
            <div className="fg">
              <label className="flbl">Phân ca ngày {selectedWorkDate}</label>
              <select className="finput" value={shiftId}
                onChange={e => setShiftId(Number(e.target.value))}
                disabled={!workShifts.length || saving}>
                <option value={0}>— Không gán ca ngay —</option>
                {workShifts.map(shift => (
                  <option key={shift.id} value={shift.id}>{shift.name} ({shift.start}–{shift.end})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 9 }}>
          <button className="bs" onClick={() => closeM(openModal ?? 'sm-staff')}
            style={{ flex: 1 }}>Hủy</button>
          <button className="bp" onClick={() => void save()}
            style={{ flex: 2 }} disabled={saving}>
            {saving
               ? <><LoaderCircle className="icon icon-sm oq-spin" aria-hidden="true" /> Đang lưu...</>
               : <><Check className="icon icon-sm" aria-hidden="true" /> {editingId ? 'Cập nhật' : 'Lưu nhân viên'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}


export function AssignEmployeeModal() {
  const { openModal, closeM, showToast, staff, workShifts, store, refreshStaff } = useApp();
  const shiftId = openModal?.startsWith('sm-assign-') ? Number(openModal.split('-').pop()) : 0;
  const shift = workShifts.find(item => item.id === shiftId);
  const assigned = new Set(shift?.employees.map(employee => employee.id));
  const available = staff.filter(employee => !assigned.has(employee.id));
  const [employeeId, setEmployeeId] = useState(0);
  const { pending: assigning, run: runAssign } = useAsyncAction(`shift-assign:${shiftId}`);
  const isOpen = Boolean(shift);
  // Reset the selection when the selected day/shift data changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setEmployeeId(available[0]?.id ?? 0); }, [shiftId, staff.length, shift?.employees.length]);
  const assign = async () => {
    if (!store || !shiftId || !employeeId) { showToast('Chưa chọn nhân viên hoặc ca làm việc', 'red'); return; }
    await runAssign(async () => {
      try {
        await assignEmployee(store.storeId, shiftId, employeeId);
        closeM(openModal ?? 'sm-assign');
        showToast('Đã phân nhân viên vào ca', 'grn');
        void refreshStaff();
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Không thể phân ca', 'red');
      }
    });
  };
  return <div className={`mov${isOpen ? ' open' : ''}`} onClick={() => closeM(openModal ?? 'sm-assign')}>
    <div className="modal" onClick={event => event.stopPropagation()}>
      <div className="mhd"><div className="mtitle">Phân nhân viên vào {shift?.name}</div><button className="mxbtn" onClick={() => closeM(openModal ?? 'sm-assign')}><X className="icon icon-sm" aria-hidden="true" /></button></div>
      <label className="flbl">Nhân viên có sẵn</label>
      <select className="finput" value={employeeId} onChange={event => setEmployeeId(Number(event.target.value))} disabled={!available.length || assigning}>{!available.length && <option value={0}>Tất cả nhân viên đã được phân ca</option>}{available.map(employee => <option key={employee.id} value={employee.id}>{employee.name} · {employee.phone || 'Chưa có SĐT'}</option>)}</select>
      <div style={{ display: 'flex', gap: 9, marginTop: 18 }}><button className="bs" onClick={() => closeM(openModal ?? 'sm-assign')} style={{ flex: 1 }}>Hủy</button><button className="bp" onClick={() => void assign()} disabled={!available.length || assigning} aria-busy={assigning} style={{ flex: 2 }}>{assigning ? 'Đang phân ca...' : 'Phân vào ca'}</button></div>
    </div>
  </div>;
}

export function RemoveEmployeeModal() {
  const { openModal, closeM, showToast, store, refreshStaff } = useApp();
  const parts = openModal?.startsWith('sm-remove-') ? openModal.split('-').slice(2).map(Number) : [];
  const [shiftId, employeeId] = parts;
  const isOpen = Boolean(shiftId && employeeId);
  const { pending: removing, run: runRemove } = useAsyncAction(`shift-unassign:${shiftId}:${employeeId}`);
  const remove = async () => {
    if (!store) return;
    await runRemove(async () => {
      try {
        await unassignEmployee(store.storeId, shiftId, employeeId);
        closeM(openModal ?? 'sm-remove');
        showToast('Đã xóa nhân viên khỏi ca hôm đó', 'grn');
        void refreshStaff();
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Không thể xóa khỏi ca', 'red');
      }
    });
  };
  return <div className={`mov${isOpen ? ' open' : ''}`} onClick={() => closeM(openModal ?? 'sm-remove')}><div className="modal" onClick={event => event.stopPropagation()}><div className="mhd"><div className="mtitle">Xóa nhân viên khỏi ca?</div><button className="mxbtn" onClick={() => closeM(openModal ?? 'sm-remove')}><X className="icon icon-sm" aria-hidden="true" /></button></div><p style={{ fontSize: 13, color: 'var(--ts)' }}>Chỉ xóa phân ca của ngày đang xem. Hồ sơ nhân viên vẫn được giữ lại.</p><div style={{ display: 'flex', gap: 9, marginTop: 18, justifyContent: 'flex-end' }}><button className="bs" onClick={() => closeM(openModal ?? 'sm-remove')}>Hủy</button><button className="br" onClick={() => void remove()} disabled={removing} aria-busy={removing}>{removing ? 'Đang xóa...' : 'Xóa khỏi ca'}</button></div></div></div>;
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
  const { pending: savingMachine, run: runMachineAction } = useAsyncAction(`machine:${editingId ?? 'new'}`);
  useEffect(() => { setName(editing?.name ?? ''); setType(editing?.type ?? ''); setMachKg(editing ? String(editing.kg) : ''); setMachTime(editing ? String(editing.time) : ''); setStatus(editing?.status ?? 'AVAILABLE'); }, [editingId, editing]);

  const saveMachine = async () => {
    if (!type || !machKg || !machTime) {
      showToast('Vui lòng chọn loại máy và nhập số kg, phút', 'red');
      return;
    }
    if (!store) return;
    await runMachineAction(async () => {
    try {
      const payload = { name: name || `Máy ${machines.length + 1}`, type: type === 'wash' ? 'WASHER' : 'DRYER', capacityKg: +machKg, processingMinutes: +machTime, status: editing ? status : 'AVAILABLE' };
      if (editingId) await updateMachine(editingId, payload); else await createMachine(store.storeId, payload);
      closeM(openModal ?? 'sm-machine'); showToast(editingId ? 'Đã cập nhật máy móc' : 'Đã thêm máy móc', 'grn');
      void refreshOrders();
      setName(''); setType(''); setMachKg(''); setMachTime('');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Không thể lưu máy', 'red'); }
    });
  };
  const remove = async () => {
    if (!editingId) return;
    await runMachineAction(async () => {
    try { await deleteMachine(editingId); closeM(openModal ?? 'sm-machine'); showToast('Đã xóa máy', 'grn'); void refreshOrders(); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Không thể xóa máy', 'red'); }
    });
  };

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id="sm-machine" onClick={() => closeM('sm-machine')}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">{editingId ? 'Cập nhật máy' : 'Thêm máy'}</div>
          <button className="mxbtn" onClick={() => closeM('sm-machine')}>
             <X className="icon icon-sm" aria-hidden="true" />
          </button>
        </div>

        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg" style={{ width: '100%' }}>
            <label className="flbl">Tên máy</label>
            <input className="finput" type="text" value={name} onChange={e => setName(e.target.value)} placeholder={editing?.name ?? `Máy ${machines.length + 1}`} maxLength={100} disabled={Boolean(editing?.locked) || savingMachine} />
          </div>
        </div>
        <div className="frow" style={{ marginBottom: 11 }}>
          <div className="fg" style={{ width: '100%' }}>
            <label className="flbl">Loại máy</label>
            <select className="finput" value={type || (editing?.type ?? '')} onChange={e => setType(e.target.value as 'wash' | 'dry')} disabled={Boolean(editing?.locked) || savingMachine}>
              <option value="" disabled hidden>Chọn loại máy</option>
              <option value="wash">Máy Giặt</option>
              <option value="dry">Máy Sấy</option>
            </select>
          </div>
        </div>
        <div className="frow" style={{ marginBottom: 18 }}>
          <div className="fg">
            <label className="flbl">Khối lượng (kg)</label>
            <input className="finput" type="number" value={machKg} onChange={e => setMachKg(e.target.value)} placeholder={editing ? String(editing.kg) : 'VD: 7'} disabled={Boolean(editing?.locked) || savingMachine} />
          </div>
          <div className="fg">
            <label className="flbl">Thời gian xử lý (phút)</label>
            <input className="finput" type="number" value={machTime} onChange={e => setMachTime(e.target.value)} placeholder={editing ? String(editing.time) : 'VD: 30'} disabled={Boolean(editing?.locked) || savingMachine} />
          </div>
        </div>
        {editingId && <div className="frow" style={{ marginBottom: 18 }}><div className="fg" style={{ width: '100%' }}><label className="flbl">Trạng thái máy</label><select className="finput" value={status} onChange={e => setStatus(e.target.value as typeof status)} disabled={savingMachine}><option value="AVAILABLE">Sẵn sàng</option><option value="BROKEN">Hỏng</option><option value="INACTIVE">Ngừng hoạt động</option><option value="RUNNING">Đang chạy</option></select>{editing?.locked && <div className="machine-lock-hint">Máy đang gắn với order chưa hoàn thành. Chỉ được đổi trạng thái.</div>}</div></div>}

        <div style={{ display: 'flex', gap: 9 }}>
          {editingId && <button className="br" onClick={() => void remove()} disabled={savingMachine}>Xóa</button>}
          <button className="bs" onClick={() => closeM(openModal ?? 'sm-machine')} style={{ flex: 1 }}>Hủy</button>
          <button className="bp" onClick={saveMachine} disabled={savingMachine} aria-busy={savingMachine} style={{ flex: 2 }}>
             {savingMachine ? <LoaderCircle className="icon icon-sm oq-spin" aria-hidden="true" /> : <Check className="icon icon-sm" aria-hidden="true" />}
            {savingMachine ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Chi tiết đơn hàng ───
function safeFormatTime(val: any, fallback = 'Chưa xác định') {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch { return fallback; }
}

function expediteImpactLabel(impact: string) {
  if (impact === 'ON_TIME') return 'Đúng giờ';
  if (impact === 'AT_RISK') return 'Có nguy cơ trễ';
  if (impact === 'NOT_FEASIBLE') return 'Sẽ trễ hẹn';
  return 'Chưa xác định';
}

export function OrderDetailModal() {
  const { openModal, closeM, showToast, orderModalParams, machines, orders, store, refreshOperations, setCurrentPage } = useApp();
  const isOpen = openModal === 'om';
  const p = orderModalParams;

  // Lấy data từ context ngay lập tức (không có loading) — detail API bổ sung thêm khi về
  const orderFromContext = p?.orderId ? orders.find(item => item.orderId === p.orderId) : undefined;
  const [detail, setDetail] = useState<any>(null);
  const [detailError, setDetailError] = useState('');
  
  const { isPending: isOrderActionPending, run: runOrderAction } = useKeyedAsyncAction();
  const [showExpedite, setShowExpedite] = useState(false);
  const [expediteTime, setExpediteTime] = useState('');
  const [expediteReason, setExpediteReason] = useState('');
  const [expediteCheck, setExpediteCheck] = useState<any>(null);

  // Clear stale detail when a different order is opened.
  // AbortController để huỷ fetch khi modal đóng trước khi response về.
  // Không show loading skeleton — context đã có data cơ bản để render ngay.
  useEffect(() => {
    setDetail(null); setDetailError('');
    setExpediteCheck(null); setShowExpedite(Boolean(p?.openExpedite)); setExpediteReason('');
    if (!isOpen || !p?.orderId) return;

    const ctrl = new AbortController();
    apiGet<any>(`/orders/${p.orderId}`, { signal: ctrl.signal })
      .then(d => { setDetail(d); })
      .catch(err => {
        if (err?.name === 'AbortError') return;
        setDetailError(err instanceof Error ? err.message : 'Không thể tải chi tiết đơn');
      });

    return () => ctrl.abort();
  }, [p?.orderId, p?.openExpedite, isOpen]);

  // order = detail API (có stage data đầy đủ) > fallback context (hiển ngay)
  const order = detail ?? orderFromContext;

  const actualSvc = order?.serviceType === 'WASH_DRY' ? 'combo' : order?.serviceType === 'DRY' ? 'dry' : order?.serviceType === 'WASH' ? 'wash' : p?.svcType;
  const svcLabel = actualSvc === 'combo' ? 'Giặt + Sấy' : actualSvc === 'wash' ? 'Chỉ Giặt' : 'Chỉ Sấy';
  // Tên bước — dùng danh từ, không dùng trạng thái động (tránh nhầm với trạng thái đang chạy)
  let stages: string[] = [];
  let stageKeys: string[] = [];
  if (actualSvc === 'combo') { stages = ['Phân loại', 'Giặt', 'Chuyển đồ', 'Sấy', 'Đóng gói']; stageKeys = ['SORTING', 'WASH', 'TRANSFER', 'DRY', 'PACKING']; }
  else if (actualSvc === 'wash') { stages = ['Phân loại', 'Giặt', 'Đóng gói']; stageKeys = ['SORTING', 'WASH', 'PACKING']; }
  else { stages = ['Phân loại', 'Sấy', 'Đóng gói']; stageKeys = ['SORTING', 'DRY', 'PACKING']; }

  const stageList = order?.stages ?? [];
  const allCompleted = stageList.length > 0 && stageList.every((s: any) => s.status === 'COMPLETED');
  const isCompleted = order?.status === 'done' || order?.status === 'COMPLETED' || allCompleted;

  // Tìm stage tiếp theo THEO THỨ TỰ WORKFLOW (stageKeys), không theo thứ tự stageList từ API.
  // stageList có thể được sort theo plannedStartAt — nếu schedule bị lệch thì TRANSFER
  // có thể nằm trước WASH, dẫn đến firstIncomplete sai.
  const nextStageKey = (() => {
    for (const key of stageKeys) {
      const s = stageList.find((item: any) => item.stage === key);
      // Nếu stage này chưa COMPLETED (bao gồm PLANNED, RUNNING, hoặc chưa có trong list)
      if (!s || s.status !== 'COMPLETED') return key;
    }
    return null; // tất cả đã xong
  })();

  // Stage object tương ứng với nextStageKey
  const nextStageObj = nextStageKey
    ? stageList.find((s: any) => s.stage === nextStageKey) ?? null
    : null;

  const cur = nextStageKey ? stageKeys.indexOf(nextStageKey) : stageKeys.length;
  const nextStageLabel = nextStageKey ? (stages[cur] ?? nextStageKey) : 'công đoạn';
  const orderActionKey = `order-workflow:${p?.orderId ?? 'unknown'}`;
  const expediteActionKey = `order-expedite:${p?.orderId ?? 'unknown'}`;
  const workflowPending = isOrderActionPending(orderActionKey);
  const expeditePending = isOrderActionPending(expediteActionKey);
  const modalBusy = expeditePending || workflowPending;
  const requiredType = nextStageKey === 'WASH' ? 'WASHER' : nextStageKey === 'DRY' ? 'DRYER' : null;
  const availMachines = useMemo(
    () => requiredType
      ? machines.filter(m => m.type === (requiredType === 'WASHER' ? 'wash' : 'dry') && m.st === 'trong')
      : [],
    [machines, requiredType],
  );

  if (!p) return null;

  const automaticMachineId = p.recommendedMachineId && availMachines.some(m => m.id === p.recommendedMachineId)
    ? p.recommendedMachineId
    : availMachines[0]?.id ?? null;
  const automaticMachineName = nextStageObj?.machine?.name
    ?? machines.find(machine => machine.id === automaticMachineId)?.name
    ?? (requiredType === 'WASHER' ? 'máy giặt' : requiredType === 'DRYER' ? 'máy sấy' : 'công đoạn này');

  const handleStart = async () => {
    if (requiredType && !automaticMachineId) { showToast('Hiện chưa có máy phù hợp để xử lý', 'red'); return; }
    const orderId = p?.orderId;
    if (!orderId || !store) return;
    await runOrderAction(orderActionKey, async () => {
      closeM('om');
      try {
        const stageData = await startRun(orderId, nextStageKey ?? '', automaticMachineId ?? 0);
        if (!requiredType && stageData?.orderStageId) {
          await completeRun(stageData.orderStageId);
          showToast(`Đã hoàn tất ${nextStageLabel}`, 'grn');
        } else {
          showToast(`Đã xếp ${p.name} vào xử lý`, 'grn');
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Lỗi khi bắt đầu', 'red');
      } finally {
        void refreshOperations();
      }
    });
  };

  const handleQuickExpedite = async (minutes: number) => {
    if (!order?.pickupAt || !p?.orderId || !store) return;
    const orderId = p.orderId;
    await runOrderAction(expediteActionKey, async () => {
      try {
        const newDate = new Date(order.pickupAt);
        newDate.setMinutes(newDate.getMinutes() + minutes);
        setExpediteTime(newDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        const res = await checkExpedite(orderId, store.storeId, newDate.toISOString());
        setExpediteCheck(res);
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Lỗi kiểm tra giờ', 'red');
      }
    });
  };

  const handleCustomTimeChange = async (timeVal: string) => {
    setExpediteTime(timeVal);
    setExpediteCheck(null);
    if (!timeVal || !p?.orderId || !store) return;
    const orderId = p.orderId;
    await runOrderAction(expediteActionKey, async () => {
      try {
        const pickupDate = new Date();
        const [h, m] = timeVal.split(':').map(Number);
        pickupDate.setHours(h, m, 0, 0);
        const res = await checkExpedite(orderId, store.storeId, pickupDate.toISOString());
        setExpediteCheck(res);
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Lỗi kiểm tra giờ', 'red');
      }
    });
  };

  const handleComplete = async () => {
    const runningStage = stageList.find((s: any) => s.status === 'RUNNING');
    if (!runningStage) return;
    await runOrderAction(orderActionKey, async () => {
      const stageName = runningStage.stage;
      closeM('om');
      try {
        await completeRun(runningStage.orderStageId);
        showToast(`Đã hoàn tất công đoạn cho ${p.name}`, 'grn');
        if (stageName === 'PACKING') setCurrentPage('n');
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Lỗi khi hoàn tất', 'red');
      } finally {
        void refreshOperations();
      }
    });
  };

  const handleConfirmExpedite = async () => {
    if (!expediteReason || !expediteCheck || !p?.orderId || !store) {
      showToast('Vui lòng nhập lý do', 'red'); return;
    }
    const orderId = p.orderId;
    await runOrderAction(expediteActionKey, async () => {
      try {
        await confirmExpedite(orderId, store.storeId, expediteCheck.newPickupAt, expediteReason, expediteCheck.simulationToken);
        showToast('Đã đôn đơn thành công', 'grn');
        closeM('om');
        void refreshOperations();
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Lỗi đôn đơn', 'red');
      }
    });
  };

  const nextActionInstruction = (() => {
    if (isCompleted || order?.status === 'READY' || order?.status === 'NOTIFIED') return 'Không còn việc cần làm';
    if (order?.status === 'RECEIVED' || nextStageKey === 'SORTING') return 'Phân loại đồ';
    if (order?.status === 'WASHING') return `Lấy đồ ra khỏi ${order?.currentMachine?.name ?? 'máy giặt'}`;
    if (order?.status === 'DRYING') return `Lấy đồ ra khỏi ${order?.currentMachine?.name ?? 'máy sấy'}`;
    if (nextStageKey === 'TRANSFER') return 'Chuyển đồ sang máy sấy';
    if (nextStageKey === 'WASH') return `Đưa đồ vào ${nextStageObj?.machine?.name ?? 'máy giặt'}`;
    if (nextStageKey === 'DRY') return `Đưa đồ vào ${nextStageObj?.machine?.name ?? 'máy sấy'}`;
    if (order?.status === 'FOLDING_PACKING' || nextStageKey === 'PACKING') return 'Xếp đồ và đóng gói';
    return detail?.nextAction ?? 'Kiểm tra công đoạn tiếp theo';
  })();

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id="om" onClick={() => closeM('om')}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhd">
          <div className="mtitle">{order?.customer?.name ?? p.name} – Chi tiết đơn</div>
          <button className="mxbtn" onClick={() => closeM('om')}>
           <X className="icon icon-sm" aria-hidden="true" />
          </button>
        </div>

        {/* Header info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '11px 0', borderBottom: '1.5px solid #f1f5f9', marginBottom: 11 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--tx)' }}>{order?.customer?.name ?? p.name}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--ts)', marginTop: 3 }}>{order?.customer?.phone ?? p.phone ?? 'Chưa có số điện thoại'}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: order?.riskLevel === 'HIGH' || p.atRisk ? '#ef4444' : '#1e1b4b' }}>{safeFormatTime(order?.pickupAt, p.deadline || 'Chưa hẹn')}</div>
            <div style={{ fontSize: '10.5px', color: 'var(--tl)' }}>Giờ hẹn lấy</div>
          </div>
        </div>
        {order?.groupCode && <div className="order-group-eta"><span>Mẻ này dự kiến xong</span><strong>{safeFormatTime(order.estimatedAt)}</strong><span>Cả nhóm dự kiến xong</span><strong>{safeFormatTime(order.groupETA)}</strong></div>}

        {/* Progress steps */}
        <div style={{ display: 'flex', margin: '14px 0' }}>
          {stages.map((s, i) => {
            const done = i < cur;
            const act = i === cur;
            const stage = stageList.find((item: any) => item.stage === stageKeys[i]);
            const plannedTime = safeFormatTime(stage?.plannedStartAt, '--:--');
            return (
              <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', margin: '0 auto', zIndex: 1, position: 'relative', background: done || act ? '#7c3aed' : '#e2e8f0', color: done || act ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {done ? <Check size={14} aria-hidden="true" /> : i + 1}
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
          {(order?.riskLevel === 'AT_RISK' || order?.riskLevel === 'NOT_FEASIBLE' || p.atRisk) && (
          <div style={{ background: '#fee2e2', borderRadius: 9, padding: '11px 13px', margin: '11px 0', borderLeft: '3px solid var(--rd)' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--rd)', marginBottom: 3 }}>Cảnh báo trễ hẹn</div>
            <div style={{ fontSize: '11.5px', color: '#9ca3af' }}>Dự kiến xong {safeFormatTime(order?.estimatedAt)} · Hẹn {p.deadline || 'chưa có'}</div>
          </div>
        )}

        <div className="order-fact-list">
          {detailError || (detail ? (
            <>
              <span><strong>Dịch vụ</strong> {svcLabel}</span>
              <span><strong>Khối lượng</strong> {order?.weightKg ?? '--'} kg</span>
              <span><strong>Trạng thái</strong> {({
                RECEIVED:       'Tiếp nhận',
                WAITING:        'Chờ máy',
                WASHING:        'Đang giặt',
                DRYING:         'Đang sấy',
                FOLDING_PACKING:'Đang đóng gói',
                READY:          'Sẵn sàng lấy',
                NOTIFIED:       'Đã báo khách',
                COMPLETED:      'Hoàn tất',
              } as Record<string,string>)[order?.status ?? ''] ?? order?.status ?? 'Chưa xác định'}</span>
            </>
          ) : 'Đang tải thông tin chi tiết...')}
        </div>

        {detail?.priorityReason && <div className="order-priority-reason"><Info className="icon icon-sm" aria-hidden="true" /><span><strong>Lý do ưu tiên</strong>{detail.priorityReason}</span></div>}
        <div className="order-next-action"><strong>Việc cần làm tiếp theo</strong><span>{nextActionInstruction}</span></div>

        {showExpedite && (
          <div style={{ background: '#f8fafc', borderRadius: 9, padding: 14, margin: '11px 0', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>Đôn đơn / Lấy sớm</div>
            
            {order?.pickupAt && (
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                Giờ hẹn hiện tại: <strong>{new Date(order.pickupAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <button className="bs" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => handleQuickExpedite(-15)} disabled={modalBusy}>-15 phút</button>
              <button className="bs" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => handleQuickExpedite(-30)} disabled={modalBusy}>-30 phút</button>
              <button className="bs" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => handleQuickExpedite(-60)} disabled={modalBusy}>-1 giờ</button>
              <input className="finput" type="time" value={expediteTime} onChange={e => handleCustomTimeChange(e.target.value)} disabled={modalBusy} style={{ width: 100 }} />
            </div>

            {expediteCheck && (
              <div style={{ background: expediteCheck.summary?.notFeasibleOrders > 0 ? '#fef2f2' : '#f0fdf4', border: expediteCheck.summary?.notFeasibleOrders > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0', borderRadius: 6, padding: '10px 12px', marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>
                   → Giờ hẹn mới: <strong style={{ color: expediteCheck.summary?.notFeasibleOrders > 0 ? '#b45309' : '#15803d' }}>{new Date(expediteCheck.newPickupAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
                </div>
                <div style={{ fontSize: 11, color: '#475569' }}>
                  <strong>Tác động:</strong> {expediteCheck.summary?.affectedOrders || 0} đơn bị ảnh hưởng (Trễ: {expediteCheck.summary?.notFeasibleOrders || 0}, Cảnh báo: {expediteCheck.summary?.atRiskOrders || 0})
                </div>
                {expediteCheck.impacts?.length > 0 && (
                  <div style={{ marginTop: 9, borderTop: '1px solid #e2e8f0', paddingTop: 7 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Các đơn bị ảnh hưởng</div>
                    {expediteCheck.impacts.map((impact: any) => (
                      <div key={impact.orderId} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, lineHeight: 1.5, padding: '3px 0', color: '#475569' }}>
                        <span><strong>#{impact.orderId}</strong> · {impact.customer?.name ?? 'Khách hàng'}{impact.isTarget ? ' · Đơn được đôn' : impact.isSameGroup ? ' · Cùng nhóm' : ''}</span>
                        <span style={{ whiteSpace: 'nowrap', fontWeight: 700, color: impact.proposedImpact === 'NOT_FEASIBLE' ? '#b45309' : impact.proposedImpact === 'AT_RISK' ? '#a16207' : '#15803d' }}>{expediteImpactLabel(impact.proposedImpact)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <input className="finput" type="text" value={expediteReason} onChange={e => setExpediteReason(e.target.value)} placeholder="Nhập lý do đôn đơn (vd: Khách cần gấp)..." disabled={modalBusy} style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="bs" onClick={() => { setShowExpedite(false); setExpediteCheck(null); setExpediteTime(''); setExpediteReason(''); }}>Hủy</button>
              <button className="bp" style={{ background: '#7c3aed', color: '#fff', flex: 1 }} onClick={handleConfirmExpedite} disabled={modalBusy || !expediteReason || !expediteCheck}>
                Xác nhận đôn đơn
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {/* 
          Logic hiển thị nút:
          - COMPLETED / READY → chỉ Đóng, không Đôn đơn
          - stage PLANNED kế tiếp → Đôn đơn + Xử lý ngay
          - stage RUNNING → Đôn đơn + Hoàn tất công đoạn
        */}
        <div style={{ display: 'flex', gap: 9, marginTop: 18, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {/* Nhánh 1: Đã hoàn tất hoặc READY — không cho Đôn đơn */}
          {(isCompleted || order?.status === 'READY' || order?.status === 'NOTIFIED') ? (
            <button className="bs" onClick={() => closeM('om')}>Đóng</button>

          ) : nextStageObj?.status === 'PLANNED' ? (
            /* Nhánh 2: Stage tiếp theo đang PLANNED — cho Đôn đơn + Xử lý ngay */
            <>
              <button className="bs" onClick={() => closeM('om')}>Đóng</button>

              {!showExpedite && (
                <button className="bs" onClick={() => setShowExpedite(true)} disabled={modalBusy}>
                   <Zap className="icon icon-sm" aria-hidden="true" />
                  Đôn đơn
                </button>
              )}

              <button
                className="bp"
                onClick={handleStart}
                 disabled={modalBusy || (!!requiredType && !automaticMachineId)}
                style={{ minWidth: 120 }}
              >
                {modalBusy
                   ? <><LoaderCircle className="icon icon-sm oq-spin" aria-hidden="true" /> Đang gửi...</>
                  : !requiredType
                     ? <><Check className="icon icon-sm" aria-hidden="true" /> Hoàn tất ngay</>
                       : <><Check className="icon icon-sm" aria-hidden="true" /> Đưa vào {automaticMachineName}</>
                }
              </button>
            </>

          ) : (
            /* Nhánh 3: Stage đang RUNNING — cho Đôn đơn + Hoàn tất */
            <>
              <button className="bs" onClick={() => closeM('om')}>Đóng</button>

              {!showExpedite && (
                <button className="bs" onClick={() => setShowExpedite(true)} disabled={modalBusy}>
                   <Zap className="icon icon-sm" aria-hidden="true" />
                  Đôn đơn
                </button>
              )}

              <button
                className="bp"
                onClick={handleComplete}
                disabled={modalBusy}
                style={{ minWidth: 140 }}
              >
                {modalBusy
                   ? <><LoaderCircle className="icon icon-sm oq-spin" aria-hidden="true" /> Đang gửi...</>
                   : <><Check className="icon icon-sm" aria-hidden="true" /> Hoàn tất công đoạn</>
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
