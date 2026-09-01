/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiPatch } from '../api/client';
import { completeRun, startRun } from '../api/orders';
import { useApp } from '../context/useApp';
import { BellRing, CircleAlert } from 'lucide-react';
import type { Machine, MachineCompletionResult, QueueItem } from '../types';

const FORGOTTEN_AFTER_MS = 5 * 60 * 1000;
const ALERT_CHECK_INTERVAL_MS = 30 * 1000;

type FaultStatus = 'BROKEN' | 'INACTIVE';
type QueueAlert = { item: QueueItem; key: string; kind: 'risk' | 'forgotten' };

function isAlertHidden(key: string, acknowledged: Set<string>, snoozedUntil: Record<string, number>, now: number) {
  return acknowledged.has(key) || (snoozedUntil[key] ?? 0) > now;
}

let chimeContext: AudioContext | null = null;

async function playCompletionChime() {
  try {
    chimeContext ??= new window.AudioContext();
    await chimeContext.resume();
    const startAt = chimeContext.currentTime;
    [{ offset: 0, frequency: 880 }, { offset: 0.28, frequency: 1174.66 }].forEach(({ offset, frequency }) => {
      const oscillator = chimeContext!.createOscillator();
      const gain = chimeContext!.createGain();
      const toneAt = startAt + offset;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, toneAt);
      gain.gain.setValueAtTime(0.0001, toneAt);
      gain.gain.exponentialRampToValueAtTime(0.22, toneAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, toneAt + 0.2);
      oscillator.connect(gain);
      gain.connect(chimeContext!.destination);
      oscillator.start(toneAt);
      oscillator.stop(toneAt + 0.22);
    });
  } catch {
    // Trình duyệt có thể chặn âm thanh trước tương tác đầu tiên.
  }
}

function stageLabel(stage?: string) {
  return ({ WASH: 'Giặt', DRY: 'Sấy', PACKING: 'Đóng gói' } as Record<string, string>)[stage ?? ''] ?? stage ?? 'Chưa xác định';
}

function nextTask(machine: Machine) {
  const stage = machine.currentStage?.stage;
  const serviceType = machine.currentStage?.order?.serviceType;
  if (stage === 'WASH' && serviceType === 'WASH_DRY') return 'Đưa đơn về hàng đợi để chờ máy sấy';
  if (stage === 'WASH' || stage === 'DRY') return 'Chuyển quần áo sang khu vực gấp và đóng gói';
  if (stage === 'PACKING') return 'Đưa đơn sang trạng thái sẵn sàng giao khách';
  return 'Kiểm tra công đoạn tiếp theo của đơn';
}

function formatTime(value?: string | null) {
  if (!value) return 'Chưa xác định';
  return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function queueTaskLabel(item: QueueItem) {
  if (item.status === 'WASHING') return 'Lấy đồ ra khỏi máy giặt';
  if (item.status === 'DRYING') return 'Lấy đồ ra khỏi máy sấy';
  if (item.status === 'WAITING' && item.nextStage === 'WASH') return 'Cho đồ vào máy giặt';
  if (item.status === 'WAITING' && item.nextStage === 'DRY') return 'Cho đồ vào máy sấy';
  if (item.nextStage === 'TRANSFER') return 'Chuyển đồ sang máy sấy';
  if (item.nextStage === 'SORTING') return 'Phân loại đồ';
  if (item.nextStage === 'PACKING') return 'Xếp đồ và đóng gói';
  return 'Kiểm tra và cập nhật trạng thái';
}

function queueActionLabel(item: QueueItem) {
  return `Xác nhận: ${queueTaskLabel(item).toLowerCase()}`;
}

export default function MachineCompletionAlert() {
  const { machines, queueSnapshot, refreshOperations, showToast } = useApp();
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>({});
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const previousRiskRef = useRef<Map<number, string>>(new Map());
  const riskBaselineRef = useRef(false);
  const reminderTimersRef = useRef<Map<string, number>>(new Map());
  const [newRiskKeys, setNewRiskKeys] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), ALERT_CHECK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => {
    reminderTimersRef.current.forEach(timer => window.clearTimeout(timer));
    reminderTimersRef.current.clear();
  }, []);

  const snooze = (key: string, minutes: number) => {
    const reminderAt = Date.now() + minutes * 60 * 1000;
    const currentTimer = reminderTimersRef.current.get(key);
    if (currentTimer) window.clearTimeout(currentTimer);
    const timer = window.setTimeout(() => {
      setSnoozedUntil(previous => {
        if ((previous[key] ?? 0) > Date.now()) return previous;
        const next = { ...previous };
        delete next[key];
        return next;
      });
      setNow(Date.now());
      reminderTimersRef.current.delete(key);
    }, minutes * 60 * 1000);
    reminderTimersRef.current.set(key, timer);
    setSnoozedUntil(previous => ({ ...previous, [key]: reminderAt }));
    showToast(`Đã đặt nhắc lại sau ${minutes} phút`, 'pu');
  };
  const acknowledge = (key: string) => setAcknowledged(previous => new Set(previous).add(key));

  const allDueMachines = useMemo(() => machines
    .filter(machine => machine.statusRaw === 'RUNNING' && machine.completionDue && machine.currentStage?.status === 'RUNNING'), [machines]);
  const dueMachines = useMemo(() => allDueMachines
    .filter(machine => !isAlertHidden(`machine:${machine.currentStage!.orderStageId}`, acknowledged, snoozedUntil, now))
    .sort((left, right) => new Date(left.finishAt ?? 0).getTime() - new Date(right.finishAt ?? 0).getTime() || left.id - right.id),
  [allDueMachines, now, acknowledged, snoozedUntil]);
  const dueKey = dueMachines.map(machine => machine.currentStage!.orderStageId).join(',');
  const activeMachine = dueMachines.find(machine => machine.currentStage?.orderStageId === selectedStageId) ?? dueMachines[0] ?? null;

  // Không cảnh báo lại các đơn đã ở trạng thái rủi ro ngay từ lần tải đầu tiên.
  useEffect(() => {
    if (!queueSnapshot) return;
    const current = new Map<number, string>();
    const newlyRisky: string[] = [];
    for (const item of queueSnapshot.items) {
      if (item.riskLevel !== 'AT_RISK' && item.riskLevel !== 'NOT_FEASIBLE') continue;
      const key = `${item.orderId}:${item.riskLevel}`;
      current.set(item.orderId, key);
      if (riskBaselineRef.current && previousRiskRef.current.get(item.orderId) !== key) newlyRisky.push(key);
    }
    previousRiskRef.current = current;
    riskBaselineRef.current = true;
    if (newlyRisky.length) setNewRiskKeys(previous => [...new Set([...previous, ...newlyRisky])]);
    else setNewRiskKeys(previous => previous.filter(key => current.has(Number(key.split(':')[0]))));
  }, [queueSnapshot]);

  const queueAlert = useMemo<QueueAlert | null>(() => {
    const risky = (queueSnapshot?.items ?? [])
      .filter(item => newRiskKeys.includes(`${item.orderId}:${item.riskLevel}`))
      .map(item => ({ item, key: `risk:${item.orderId}:${item.riskLevel}`, kind: 'risk' as const, priority: item.riskLevel === 'NOT_FEASIBLE' ? 1 : 2 }))
      .filter(alert => !isAlertHidden(alert.key, acknowledged, snoozedUntil, now))
      .sort((left, right) => left.priority - right.priority)[0];
    if (risky) return risky;

    const forgotten = (queueSnapshot?.items ?? [])
      .filter(item => item.status !== 'READY' && item.status !== 'NOTIFIED' && item.taskDeadlineAt)
      .filter(item => new Date(item.taskDeadlineAt!).getTime() + FORGOTTEN_AFTER_MS <= now)
      .map(item => ({ item, key: `forgotten:${item.orderId}:${item.nextStage ?? item.status}`, kind: 'forgotten' as const }))
      .filter(alert => !isAlertHidden(alert.key, acknowledged, snoozedUntil, now))[0];
    return forgotten ?? null;
  }, [queueSnapshot, newRiskKeys, now, acknowledged, snoozedUntil]);

  useEffect(() => {
    if (!dueKey) return;
    const announced = JSON.parse(sessionStorage.getItem('washtrack-machine-alerts') ?? '[]') as string[];
    const newMachine = dueMachines.find(machine => !announced.includes(`machine:${machine.currentStage!.orderStageId}`));
    if (!newMachine) return;
    const key = `machine:${newMachine.currentStage!.orderStageId}`;
    sessionStorage.setItem('washtrack-machine-alerts', JSON.stringify([...announced, key]));
    void playCompletionChime();
  }, [dueKey, dueMachines]);

  useEffect(() => {
    if (queueAlert?.kind !== 'risk') return;
    const key = `washtrack-${queueAlert.key}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    void playCompletionChime();
  }, [queueAlert]);

  const activeQueueAlert = activeMachine ? null : queueAlert;
  if (!activeMachine?.currentStage && !activeQueueAlert) return null;
  const stageId = activeMachine?.currentStage?.orderStageId;

  return (
    <div className="completion-overlay" role="presentation">
      <section className="completion-dialog" role="dialog" aria-modal="true" aria-labelledby="machine-completion-title">
        {activeMachine ? (
          <>
            {dueMachines.length > 1 && (
              <div className="completion-machine-tabs" aria-label="Các máy vừa hoàn tất">
                {dueMachines.map(machine => (
                  <button key={machine.currentStage!.orderStageId} className={machine.currentStage!.orderStageId === stageId ? 'active' : ''} onClick={() => setSelectedStageId(machine.currentStage!.orderStageId)}>
                    {machine.name}
                  </button>
                ))}
              </div>
            )}
            <CompletionPanel key={stageId} machine={activeMachine} onSnooze={minutes => snooze(`machine:${stageId}`, minutes)} onAcknowledge={() => acknowledge(`machine:${stageId}`)} />
          </>
        ) : activeQueueAlert ? (
          <QueueAlertPanel
            alert={activeQueueAlert}
            onSnooze={minutes => snooze(activeQueueAlert.key, minutes)}
            onAction={async () => {
              const item = activeQueueAlert.item;
              try {
                if (item.status === 'WASHING' || item.status === 'DRYING') await completeRun(item.orderStageId!);
                else if (item.status === 'WAITING' && item.nextStage && item.machineId) await startRun(item.orderId, item.nextStage, item.machineId);
                else if (item.nextStage) {
                  const result = await startRun(item.orderId, item.nextStage, 0);
                  if (result?.orderStageId) await completeRun(result.orderStageId);
                }
                acknowledge(activeQueueAlert.key);
                showToast(`Đã cập nhật trạng thái đơn #${item.orderId}`, 'grn');
                await refreshOperations();
              } catch (error) {
                showToast(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái', 'red');
              }
            }}
          />
        ) : null}
      </section>
    </div>
  );
}

function CompletionPanel({ machine, onSnooze, onAcknowledge }: { machine: Machine; onSnooze: (minutes: number) => void; onAcknowledge: () => void }) {
  const { refreshOperations, showToast } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [faultChoice, setFaultChoice] = useState<FaultStatus | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stage = machine.currentStage!;
  const customerName = stage.order?.customer?.name ?? 'Không xác định được khách hàng';
  const canComplete = machine.completionActionAllowed !== false;

  useEffect(() => { panelRef.current?.focus(); }, []);

  const completeStage = async () => {
    setSubmitting(true); setActionError('');
    try {
      const result = await apiPatch<MachineCompletionResult>(`/order-stages/${stage.orderStageId}/complete`);
      onAcknowledge();
      showToast(`${machine.name} đã trống · Đơn #${stage.order?.orderId ?? stage.orderId} chuyển sang ${result.orderStatus}`, 'grn');
      if (result.recommendation) showToast(`Đề xuất tiếp theo: đơn #${result.recommendation.orderId} vào ${machine.name}`, 'pu');
      await refreshOperations();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể hoàn tất công đoạn. Hãy thử lại.');
      await refreshOperations();
    } finally { setSubmitting(false); }
  };

  const markFault = async () => {
    if (!faultChoice) return;
    setSubmitting(true); setActionError('');
    try {
      await apiPatch(`/machines/${machine.id}/status`, { status: faultChoice });
      onAcknowledge();
      showToast(`${machine.name} đã được đánh dấu ${faultChoice === 'BROKEN' ? 'hỏng' : 'tạm ngừng'}.`, 'red');
      await refreshOperations();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái máy.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="completion-panel" ref={panelRef} tabIndex={-1}>
      <div className="completion-kicker"><BellRing className="completion-bell" aria-hidden="true" /> Máy vừa hoàn tất · Cần lấy đồ ra</div>
      <div className="completion-heading-row">
        <div><h2 id="machine-completion-title">{machine.name} đã hoàn thành</h2><p>Hãy lấy quần áo ra khỏi máy.</p></div>
        <span className="completion-state-badge">Cần xử lý</span>
      </div>
      <div className="completion-order-grid">
        <div><span>Đơn hàng</span><strong>#{stage.order?.orderId ?? stage.orderId} · {customerName}</strong></div>
        <div><span>Công đoạn</span><strong>{stageLabel(stage.stage)}</strong></div>
        <div><span>Hoàn tất lúc</span><strong>{formatTime(machine.finishAt)}</strong></div>
        <div><span>Việc tiếp theo</span><strong>{nextTask(machine)}</strong></div>
      </div>
      {!canComplete && <div className="completion-error" role="alert"><strong>Trạng thái cần kiểm tra</strong><span>{machine.completionBlockedReason ?? 'Dữ liệu đơn và công đoạn chưa đồng bộ.'}</span></div>}
      {canComplete && <div className="completion-takeout-step">
        <div className="completion-takeout-copy"><span className="completion-step-number">1</span><div><strong>Lấy quần áo ra khỏi máy</strong><p>Chỉ xác nhận sau khi đã lấy hết đồ.</p></div></div>
        <button className="bp completion-primary" disabled={submitting} onClick={() => { void completeStage(); }}>{submitting ? 'Đang cập nhật...' : 'Đã lấy đồ xong'}</button>
        <ReminderActions disabled={submitting} onSnooze={onSnooze} />
      </div>}
      {actionError && <div className="completion-error" role="alert"><strong>Chưa cập nhật được</strong><span>{actionError}</span></div>}
      <div className="completion-fault-area">
        {!faultChoice ? <button className="completion-link-button" disabled={submitting} onClick={() => setFaultChoice('BROKEN')}>Máy có lỗi vật lý?</button> : <div className="completion-fault-confirm"><div><strong>Không giải phóng máy</strong><p>Stage vẫn giữ nguyên để tránh mất dấu đơn.</p></div><div className="completion-fault-options"><button className={faultChoice === 'BROKEN' ? 'selected' : ''} onClick={() => setFaultChoice('BROKEN')}>Hỏng</button><button className={faultChoice === 'INACTIVE' ? 'selected' : ''} onClick={() => setFaultChoice('INACTIVE')}>Tạm ngừng</button></div><div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end', marginTop: 12, borderTop: '1px solid #fee2e2', paddingTop: 12 }}><button className="bs" disabled={submitting} onClick={() => setFaultChoice(null)}>Hủy thao tác</button><button className="br" disabled={submitting} onClick={() => { void markFault(); }}>{submitting ? 'Đang lưu...' : 'Xác nhận trạng thái'}</button></div></div>}
      </div>
    </div>
  );
}

function ReminderActions({ disabled, onSnooze }: { disabled: boolean; onSnooze: (minutes: number) => void }) {
  return <div className="completion-reminder-actions"><button className="bs" disabled={disabled} onClick={() => onSnooze(5)}>Nhắc sau 5 phút</button><button className="bs" disabled={disabled} onClick={() => onSnooze(10)}>Nhắc sau 10 phút</button></div>;
}

function QueueAlertPanel({ alert, onSnooze, onAction }: { alert: QueueAlert; onSnooze: (minutes: number) => void; onAction: () => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);
  const { item } = alert;
  const task = queueTaskLabel(item);
  const action = queueActionLabel(item);
  const submitAction = async () => { setSubmitting(true); try { await onAction(); } finally { setSubmitting(false); } };
  return <div className="completion-panel" tabIndex={-1}>
    <div className="completion-kicker"><CircleAlert className="completion-bell" aria-hidden="true" /> {alert.kind === 'risk' ? 'Cảnh báo deadline · Cần xử lý' : 'Task bị bỏ quên · Cần xử lý'}</div>
    <div className="completion-heading-row"><div><h2>{alert.kind === 'risk' ? `Đơn #${item.orderId} cần ưu tiên` : `Đơn #${item.orderId} đang chờ xử lý`}</h2><p>{item.customer?.name ?? 'Khách hàng'} · {item.riskMessage || 'Việc tiếp theo chưa được xác nhận.'}</p></div><span className="completion-state-badge">{alert.kind === 'risk' ? (item.riskLevel === 'NOT_FEASIBLE' ? 'Đã trễ' : 'Nguy cơ trễ') : 'Bị bỏ quên'}</span></div>
    <div className="completion-order-grid"><div><span>Trạng thái</span><strong>{item.nextAction || item.status}</strong></div><div><span>Việc cần làm</span><strong>{task}</strong></div><div><span>Hẹn lấy</span><strong>{formatTime(item.pickupAt)}</strong></div><div><span>Lý do ưu tiên</span><strong>{item.priorityReason || 'Cần xử lý tiếp theo'}</strong></div></div>
    <div className="completion-alert-actions"><button className="bp completion-primary" disabled={submitting} onClick={() => { void submitAction(); }}>{submitting ? 'Đang cập nhật...' : action}</button><ReminderActions disabled={submitting} onSnooze={onSnooze} /></div>
  </div>;
}
