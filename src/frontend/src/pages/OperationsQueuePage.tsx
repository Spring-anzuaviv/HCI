import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/useApp';
import type { ModalOrderParams, QueueItem } from '../types';
import { filterOrders } from '../utils/orderSearch';
import { startRun, completeRun } from '../api/orders';
import { useKeyedAsyncAction } from '../hooks/useAsyncAction';
import { AlertTriangle, ArrowRight, ArrowRightLeft, Check, CircleAlert, CircleCheck, CircleX, Cpu, Info, Layers3, ListChecks, PackageOpen, WashingMachine, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatDurationLabel } from '../utils/timeFormat';

const SERVICE_LABELS: Record<string, string> = { WASH: 'Chỉ Giặt', DRY: 'Chỉ Sấy', WASH_DRY: 'Giặt + Sấy' };
const STAGE_LABELS: Record<string, string> = { SORTING: 'Phân loại', WASH: 'Giặt', TRANSFER: 'Chuyển đồ', DRY: 'Sấy', PACKING: 'Đóng gói' };

function formatTime(value: string | null, fallback = 'Chưa có') {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatCountdown(target: string | null, now: number) {
  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  if (!Number.isFinite(diff)) return null;
  const minutes = Math.ceil(Math.abs(diff) / 60_000);
  
  return { text: formatDurationLabel(minutes), late: diff < 0 };
}

type TimingTag = { tone: 'late' | 'machine' | 'wait' | 'action'; label: string; value: string };

function timingTags(item: QueueItem, now: number): TimingTag[] {
  const isRunning = item.status === 'WASHING' || item.status === 'DRYING';
  const waitingForMachine = item.status === 'WAITING' && (item.nextStage === 'WASH' || item.nextStage === 'DRY');
  const pickup = formatCountdown(item.pickupAt, now);
  const machine = formatCountdown(actionTarget(item), now);
  const tags: TimingTag[] = [];

  if (isRunning && pickup?.late) tags.push({ tone: 'late', label: 'TRỄ HẸN', value: pickup.text });
  if (isRunning && machine) tags.push({ tone: machine.late ? 'late' : 'machine', label: machine.late ? 'MÁY QUÁ GIỜ' : 'MÁY CÒN', value: machine.text });
  if (waitingForMachine && machine && !machine.late) tags.push({ tone: 'wait', label: 'CHỜ MÁY', value: machine.text });
  if (waitingForMachine && machine?.late) tags.push({ tone: 'action', label: 'THAO TÁC CÒN', value: machine.text });
  if (!isRunning && !waitingForMachine) {
    const action = formatCountdown(actionTarget(item), now);
    if (action) tags.push({ tone: action.late ? 'late' : 'action', label: action.late ? 'THAO TÁC TRỄ' : 'THAO TÁC CÒN', value: action.text });
  }
  return tags;
}

function actionText(item: QueueItem) {
  if (item.status === 'RECEIVED' || item.nextStage === 'SORTING') return 'PHÂN LOẠI';
  if (item.status === 'WASHING') return 'LẤY RA KHỎI MÁY GIẶT';
  if (item.status === 'DRYING') return 'LẤY RA KHỎI MÁY SẤY';
  if (item.nextStage === 'WASH' || item.nextStage === 'DRY') return item.machineName ? `ĐƯA VÀO ${item.machineName.toUpperCase()}` : 'CHỌN MÁY';
  if (item.nextStage === 'TRANSFER') return 'ĐƯA VÀO MÁY SẤY';
  if (item.status === 'FOLDING_PACKING' || item.nextStage === 'PACKING') return 'XẾP ĐỒ';
  return item.nextAction?.toUpperCase() ?? 'XEM ĐƠN';
}

function actionTarget(item: QueueItem) {
  return item.taskDeadlineAt;
}

function physicalInstruction(item: QueueItem) {
  const target = actionTarget(item);
  const time = formatTime(target, 'chưa xác định');
  if (item.status === 'RECEIVED' || item.nextStage === 'SORTING') return { lead: 'Vui lòng phân loại trước', target: '', time };
  if (item.status === 'WASHING') return { lead: 'Đang giặt tại', target: item.machineName ?? 'máy giặt', time: '' };
  if (item.status === 'DRYING') return { lead: 'Đang sấy tại', target: item.machineName ?? 'máy sấy', time: '' };
  if (item.status === 'WAITING' && item.nextStage === 'WASH' && !item.machineId) return { lead: 'Đang chờ', target: 'máy giặt hoàn tất', time: '' };
  if (item.status === 'WAITING' && item.nextStage === 'DRY' && !item.machineId) return { lead: 'Đang chờ', target: 'máy sấy hoàn tất', time: '' };
  if (item.nextStage === 'WASH' || item.nextStage === 'DRY') return { lead: 'Vui lòng đưa vào', target: item.machineName ?? 'máy', time: `trước ${time}` };
  if (item.nextStage === 'TRANSFER') return { lead: 'Vui lòng chuyển sang', target: 'máy sấy', time: `trước ${time}` };
  if (item.status === 'FOLDING_PACKING' || item.nextStage === 'PACKING') return { lead: 'Vui lòng xếp đồ trước', target: '', time };
  return { lead: 'Vui lòng xử lý trước', target: '', time };
}

function modalParams(item: QueueItem, orders: ReturnType<typeof useApp>['orders']): ModalOrderParams {
  const order = orders.find(value => value.orderId === item.orderId);
  return {
    orderId: item.orderId,
    name: item.customer?.name ?? `Đơn #${item.orderId}`,
    phone: item.customer?.phone,
    deadline: formatTime(item.pickupAt, ''),
    atRisk: item.riskLevel === 'AT_RISK' || item.riskLevel === 'NOT_FEASIBLE',
    svcType: order?.service ?? (item.serviceType === 'WASH_DRY' ? 'combo' : item.serviceType === 'DRY' ? 'dry' : 'wash'),
    isWaiting: item.status === 'WAITING',
    recommendedMachineId: item.machineId,
  };
}

function statusText(item: QueueItem) {
  if (item.status === 'RECEIVED') return 'Vừa tiếp nhận';
  if (item.status === 'WAITING') return item.machineName ? `Chờ ${item.machineName}` : 'Chờ máy';
  if (item.status === 'WASHING') return item.machineName ? `Đang giặt · ${item.machineName}` : 'Đang giặt';
  if (item.status === 'DRYING') return item.machineName ? `Đang sấy · ${item.machineName}` : 'Đang sấy';
  if (item.status === 'FOLDING_PACKING') return 'Đang đóng gói';
  return item.currentStage ? STAGE_LABELS[item.currentStage] ?? item.currentStage : 'Đang xử lý';
}

function stateMeta(item: QueueItem): { key: string; label: string; icon: LucideIcon; automatic: boolean } {
  if (item.status === 'RECEIVED' || item.nextStage === 'SORTING') return { key: 'sorting', label: 'CẦN PHÂN LOẠI', icon: ListChecks, automatic: false };
  if (item.status === 'WASHING') return { key: 'washing', label: 'ĐANG GIẶT', icon: WashingMachine, automatic: true };
  if (item.status === 'DRYING') return { key: 'drying', label: 'ĐANG SẤY', icon: Wind, automatic: true };
  if (item.nextStage === 'TRANSFER') return { key: 'transfer', label: 'CẦN ĐƯA VÀO MÁY SẤY', icon: ArrowRightLeft, automatic: false };
  if (item.nextStage === 'WASH') return { key: 'wash-ready', label: item.machineId ? 'CHỜ ĐƯA VÀO MÁY GIẶT' : 'ĐANG CHỜ MÁY GIẶT', icon: WashingMachine, automatic: false };
  if (item.nextStage === 'DRY') return { key: 'dry-ready', label: item.machineId ? 'CHỜ ĐƯA VÀO MÁY SẤY' : 'ĐANG CHỜ MÁY SẤY', icon: Wind, automatic: false };
  if (item.status === 'FOLDING_PACKING' || item.nextStage === 'PACKING') return { key: 'packing', label: 'CẦN XẾP ĐỒ', icon: PackageOpen, automatic: false };
  return { key: 'default', label: 'ĐANG XỬ LÝ', icon: CircleCheck, automatic: false };
}

function riskClass(item: QueueItem) {
  if (item.taskDelayMinutes > 0) return 'late';
  return item.riskLevel === 'NOT_FEASIBLE' || item.riskLevel === 'AT_RISK' ? 'risk' : 'ok';
}

function taskTone(item: QueueItem) {
  if (item.status === 'RECEIVED' || item.nextStage === 'SORTING') return 'sorting';
  if (item.status === 'WASHING' || item.nextStage === 'WASH') return 'wash';
  if (item.status === 'DRYING' || item.nextStage === 'DRY') return 'dry';
  if (item.nextStage === 'TRANSFER') return 'transfer';
  if (item.status === 'FOLDING_PACKING' || item.nextStage === 'PACKING') return 'packing';
  return 'default';
}

export function QueueRow({ item, now, onOpen, onExpedite }: { item: QueueItem; now: number; onOpen: () => void; onExpedite: () => void }) {
  const risk = riskClass(item);
  const state = stateMeta(item);
  const StateIcon = state.icon;
  const instruction = physicalInstruction(item);
  const tone = taskTone(item);
  const isRunning = item.status === 'WASHING' || item.status === 'DRYING';
  const waitingForMachine = item.status === 'WAITING' && (item.nextStage === 'WASH' || item.nextStage === 'DRY');
  const machineCountdown = formatCountdown(actionTarget(item), now);
  const timeTags = timingTags(item, now);
  const machineWait = Boolean(machineCountdown && !machineCountdown.late);
  const machineDone = isRunning && Boolean(machineCountdown?.late);
  const isGrouped = Boolean(item.groupCode);
  return (
    <div className={`oq-task-card oq-state-${state.key}${risk === 'late' ? ' late' : risk === 'risk' ? ' risk' : ''}`} onClick={onOpen} role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onOpen(); }}>
      <div className="oq-task-layout">
        <div className="oq-task-summary">
          <div className="oq-task-identity">
            <span className="oq-state-icon"><StateIcon size={20} strokeWidth={2.2} aria-hidden="true" /></span>
            <span className="oq-task-title-group"><span className="oq-task-name">#{item.orderId} · {item.customer?.name ?? 'Khách'}</span><span className="oq-state-label">{state.label}{state.automatic && <em>TỰ ĐỘNG</em>}</span>{isGrouped && <span className="oq-group-badge">ĐƠN NHÓM</span>}</span>
          </div>
          <div className="oq-task-meta"><span>{statusText(item)}</span><span>{SERVICE_LABELS[item.serviceType] ?? item.serviceType}</span><span>{item.weightKg} kg</span></div>
        </div>
        <div className="oq-task-work">
          <div className={`oq-reference-action${risk === 'late' ? ' late' : ''}`}>
            <span>{isRunning ? 'TRẠNG THÁI HIỆN TẠI' : 'VIỆC CẦN LÀM'}</span>
            <strong className="oq-instruction-text"><span>{instruction.lead}</span>{instruction.target && <> <b>{instruction.target}</b></>}{instruction.time && <> <i>{instruction.time}</i></>}</strong>
            <span className="oq-task-timing-group">{timeTags.length > 0 ? timeTags.map(tag => <span className={`oq-task-timing ${tag.tone}`} key={`${tag.label}-${tag.value}`}><b>{tag.label}</b><span>{tag.value}</span></span>) : <span className="oq-task-timing unknown"><b>THỜI GIAN</b><span>Chưa có</span></span>}</span>
          </div>
          <div className="oq-priority-reason"><Info size={13} aria-hidden="true" /> <span>Lý do ưu tiên: {item.priorityReason || 'Theo thứ tự hàng đợi hiện tại'}</span></div>
        </div>
        <div className="oq-task-side">
          <div className={`oq-task-priority${risk !== 'ok' ? ` ${risk}` : ''}`}>{risk === 'late' ? `TRỄ TIẾN ĐỘ ${formatDurationLabel(item.taskDelayMinutes).toUpperCase()}` : risk === 'risk' ? 'NGUY CƠ TRỄ GIỜ HẸN' : `ƯU TIÊN ${item.rank}`}</div>
          <div className="oq-task-pickup">Hẹn lấy <strong>{formatTime(item.pickupAt, 'chưa hẹn')}</strong></div>
          <div className="oq-task-actions" onClick={event => event.stopPropagation()}><button type="button" className="oq-expedite-button" onClick={onExpedite}>ĐÔN ĐƠN</button><PrimaryAction item={item} onOpen={onOpen} tone={tone} waitingForMachine={waitingForMachine && machineWait} machineDone={machineDone} /></div>
        </div>
      </div>
    </div>
  );
}

function PrimaryAction({ item, onOpen, tone, waitingForMachine, machineDone }: { item: QueueItem; onOpen: () => void; tone: string; waitingForMachine: boolean; machineDone: boolean }) {
  const { showToast, refreshOperations } = useApp();
  const { isPending, run } = useKeyedAsyncAction();
  const key = `queue-action:${item.orderId}`;
  const loading = isPending(key);
  const runAction = async (action: () => Promise<unknown>, message: string) => {
    await run(key, async () => {
      try { await action(); showToast(message, 'grn'); void refreshOperations(); }
      catch (error) { showToast(error instanceof Error ? error.message : 'Không thể cập nhật đơn', 'red'); }
    });
  };
  if (item.status === 'WASHING' || item.status === 'DRYING') {
    const machineLabel = item.status === 'WASHING' ? 'MÁY GIẶT' : 'MÁY SẤY';
    const machineName = (item.machineName ?? machineLabel).toUpperCase();
    if (!machineDone) {
      return <button type="button" className={`oq-row-action oq-action-${tone} oq-action-waiting`} disabled>CHỜ {machineName} XONG</button>;
    }
    return <button type="button" className={`oq-row-action oq-action-${tone}`} disabled={loading} onClick={event => { event.stopPropagation(); void runAction(() => completeRun(item.orderStageId!), `Đã lấy đồ ra khỏi máy cho #${item.orderId}`); }}>{loading ? 'ĐANG LƯU...' : `ĐÃ LẤY ĐỒ RA KHỎI ${machineName}`}</button>;
  }
  if (item.status === 'WAITING' && (item.nextStage === 'WASH' || item.nextStage === 'DRY') && !item.machineId) {
    const machineLabel = item.nextStage === 'WASH' ? 'GIẶT' : 'SẤY';
    return <button type="button" className={`oq-row-action oq-action-${tone} oq-action-waiting`} disabled>CHỜ {machineLabel} XONG</button>;
  }
  if (item.status === 'WAITING' && (item.nextStage === 'WASH' || item.nextStage === 'DRY') && item.machineId) {
    return <button type="button" className={`oq-row-action oq-action-${tone}${waitingForMachine ? ' oq-action-waiting' : ''}`} disabled={loading || waitingForMachine} onClick={event => { event.stopPropagation(); void runAction(() => startRun(item.orderId, item.nextStage!, item.machineId!), `Đã đưa #${item.orderId} vào ${item.machineName ?? 'máy'}`); }}>{loading ? 'ĐANG LƯU...' : waitingForMachine ? 'CHỜ MÁY TRỐNG' : `ĐÃ ĐƯA ĐỒ VÀO ${item.machineName?.toUpperCase() ?? (item.nextStage === 'WASH' ? 'MÁY GIẶT' : 'MÁY SẤY')}`}</button>;
  }
  if (item.status === 'RECEIVED' || item.status === 'FOLDING_PACKING' || item.nextStage === 'TRANSFER') {
    const label = item.status === 'FOLDING_PACKING' || item.nextStage === 'PACKING' ? 'ĐÃ XẾP VÀ ĐÓNG GÓI' : item.nextStage === 'TRANSFER' ? 'ĐÃ CHUYỂN ĐỒ SANG MÁY SẤY' : 'ĐÃ PHÂN LOẠI';
    return <button type="button" className={`oq-row-action oq-action-${tone}`} disabled={loading} onClick={event => { event.stopPropagation(); void runAction(async () => { const result = await startRun(item.orderId, item.nextStage!, 0); if (result?.orderStageId) await completeRun(result.orderStageId); }, `Đã cập nhật #${item.orderId}`); }}>{loading ? 'ĐANG LƯU...' : label}</button>;
  }
  return <button type="button" className={`oq-row-action secondary oq-action-${tone}`} onClick={event => { event.stopPropagation(); onOpen(); }}>XEM</button>;
}

function SuggestionCard({ item, now, onOpen }: { item: QueueItem; now: number; onOpen: () => void }) {
  const countdown = formatCountdown(actionTarget(item), now);
  return (
    <div className="sugg oq-reference-suggestion">
       <div className="sugg-lbl"><Cpu className="icon icon-sm" aria-hidden="true" /> Đề xuất xử lý tiếp</div>
      <div className="sugg-row">
        <div className="sugg-n">#{item.orderId}</div>
        <div className="sugg-info">
          <div className="sugg-name">{item.customer?.name ?? 'Khách hàng'}</div>
          <div className="sugg-meta"><span>{statusText(item)}</span><span>{SERVICE_LABELS[item.serviceType] ?? item.serviceType}</span><span>{item.weightKg} kg</span><span>Hẹn lấy {formatTime(item.pickupAt, 'chưa hẹn')}</span></div>
          <div className="oq-suggestion-reason"><Info className="icon icon-sm" aria-hidden="true" />Việc cần làm: <strong>{actionText(item)}</strong>{countdown ? ` · Bắt đầu sau ${countdown.text}` : ''}</div>
          {/* <div className="oq-priority-reason"><Info size={13} aria-hidden="true" /> <span>Lý do ưu tiên: {item.priorityReason || 'Theo thứ tự hàng đợi hiện tại'}</span></div> */}
        </div>
         <button type="button" className="bp oq-reference-button" onClick={onOpen}>Xử lý đơn này <ArrowRight className="icon icon-sm" aria-hidden="true" /></button>
      </div>
    </div>
  );
}

export default function OperationsQueuePage() {
  const { orders, openM, setOrderModalParams, orderSearch, orderFilter, queueSnapshot, operationsLoading, queueRefreshing, operationsError, refreshOperations } = useApp();
  const deferredSearch = useDeferredValue(orderSearch);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);

  const visibleIds = useMemo(() => new Set(filterOrders(orders, deferredSearch, orderFilter).map(order => order.orderId)), [orders, deferredSearch, orderFilter]);
  const items = useMemo(() => (queueSnapshot?.items ?? []).filter(item => visibleIds.has(item.orderId)), [queueSnapshot?.items, visibleIds]);
  const suggested = items.find(item => item.operationalState === 'NORMAL' && item.status !== 'WASHING' && item.status !== 'DRYING') ?? items[0] ?? null;
  const riskItems = items.filter(item => item.riskLevel === 'NOT_FEASIBLE' || item.riskLevel === 'AT_RISK');
  const completed = orders.filter(order => order.status === 'done' && visibleIds.has(order.orderId!));
  const openOrder = (item: QueueItem, openExpedite = false) => { setOrderModalParams({ ...modalParams(item, orders), openExpedite }); openM('om'); };

  const pending = items.filter(item => item.status !== 'READY' && item.status !== 'NOTIFIED');
  const counts = queueSnapshot?.summary;

  return (
    <div id="p-q" className="page">
      <div className="hero hero-sub">
        <div className="hero-txt">
          <h2>Hàng đợi công việc thông minh</h2>
          <p style={{ marginBottom: 0 }}>Hệ thống đề xuất thứ tự xử lý và giúp nhân viên ca sau nắm toàn bộ ngữ cảnh để bắt đầu ngay. Bạn có thể điều chỉnh bất kỳ lúc nào.</p>
        </div>
       <div className="hero-img" aria-hidden="true"><Layers3 width={80} height={80} color="var(--tx)" /></div>
      </div>

      <div className="oq-reference-summary">
         <span className="oq-summary-chip danger"><CircleX size={14} aria-hidden="true" /> {counts?.lateOrders ?? 0} trễ hẹn</span>
         <span className="oq-summary-chip risk"><CircleAlert size={14} aria-hidden="true" /> {counts?.atRiskOrders ?? 0} rủi ro</span>
         <span className="oq-summary-chip ok"><CircleCheck size={14} aria-hidden="true" /> {counts?.availableMachines ?? 0} máy trống</span>
        {queueSnapshot && <span className="queue-updated">Cập nhật {formatTime(queueSnapshot.generatedAt)}</span>}
      </div>

      {operationsLoading && <div className="card operations-state"><strong>Đang tải trạng thái vận hành...</strong><span>Hệ thống đang đọc máy, công đoạn và deadline hiện tại.</span></div>}
      {!operationsLoading && operationsError && <div className="card operations-state error"><strong>Không thể tải hàng đợi</strong><span>{operationsError}</span><button className="bs" onClick={() => void refreshOperations()} disabled={queueRefreshing}>{queueRefreshing ? 'Đang tải lại...' : 'Thử lại'}</button></div>}

      {!operationsLoading && !operationsError && (
        <>
          {suggested && <div className="card"><SuggestionCard item={suggested} now={now} onOpen={() => openOrder(suggested)} /></div>}
           {riskItems.length > 0 && <div className="card oq-risk-card"><div className="ctitle oq-reference-title danger"><div className="cico"><AlertTriangle className="icon icon-sm" aria-hidden="true" /></div>Đơn có nguy cơ trễ hẹn</div><div className="olist">{riskItems.map(item => <QueueRow key={item.orderId} item={item} now={now} onOpen={() => openOrder(item)} onExpedite={() => openOrder(item, true)} />)}</div></div>}
           <div className="card"><div className="ctitle oq-reference-title"><div className="cico"><Layers3 className="icon icon-sm" aria-hidden="true" /></div>Toàn bộ hàng đợi · {pending.length} đơn</div><div className="olist">{pending.map(item => <QueueRow key={item.orderId} item={item} now={now} onOpen={() => openOrder(item)} onExpedite={() => openOrder(item, true)} />)}</div>{pending.length === 0 && <div className="queue-no-results">Không có đơn đang chờ xử lý.</div>}</div>
           {completed.length > 0 && <div className="card oq-completed-reference"><button type="button" className="oq-completed-toggle" onClick={() => setCompletedOpen(value => !value)} aria-expanded={completedOpen}>Đã hoàn tất · {completed.length}<span>{completedOpen ? 'Ẩn' : 'Xem'}</span></button>{completedOpen && <div className="olist">{completed.map(order => <button type="button" className="orow" key={order.orderId} onClick={() => { setOrderModalParams({ orderId: order.orderId!, name: order.name, phone: order.phone, deadline: order.deadline, atRisk: false, svcType: order.service, isWaiting: false }); openM('om'); }}><div className="opri ok"><Check size={16} aria-hidden="true" /></div><div className="oname">#{order.orderId} · {order.name}</div><div className="otime">Hoàn tất {formatTime(order.estimatedAt ?? null)}</div></button>)}</div>}</div>}
        </>
      )}
    </div>
  );
}
