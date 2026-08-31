/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiPatch } from '../api/client';
import { useApp } from '../context/AppContext';
import type { Machine, MachineCompletionResult } from '../types';

const ACKNOWLEDGEMENT_KEY = 'laundry.machine-completion.acknowledgements.v1';
const TAKE_OUT_DURATION_MS = 3 * 60 * 1000;
const REMINDER_INTERVAL_MS = 5 * 60 * 1000;

type Acknowledgement = { acknowledgedAt: string };
type Acknowledgements = Record<string, Acknowledgement>;
type FaultStatus = 'BROKEN' | 'INACTIVE';

let chimeContext: AudioContext | null = null;

function readAcknowledgements(): Acknowledgements {
  try {
    const value = window.localStorage.getItem(ACKNOWLEDGEMENT_KEY);
    if (!value) return {};
    const parsed = JSON.parse(value) as Acknowledgements;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    window.localStorage.removeItem(ACKNOWLEDGEMENT_KEY);
    return {};
  }
}

function saveAcknowledgements(value: Acknowledgements) {
  if (Object.keys(value).length === 0) {
    window.localStorage.removeItem(ACKNOWLEDGEMENT_KEY);
    return;
  }
  window.localStorage.setItem(ACKNOWLEDGEMENT_KEY, JSON.stringify(value));
}

async function playCompletionChime() {
  try {
    chimeContext ??= new window.AudioContext();
    await chimeContext.resume();
    const startAt = chimeContext.currentTime;
    [
      { offset: 0, frequency: 880 },
      { offset: 0.28, frequency: 1174.66 },
    ].forEach(({ offset, frequency }) => {
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
    // Trình duyệt có thể chặn âm thanh trước tương tác đầu tiên; cảnh báo trực quan vẫn hoạt động.
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

function formatCountdown(acknowledgedAt: string, currentTime: number) {
  const elapsed = currentTime - new Date(acknowledgedAt).getTime();
  const remainingSeconds = Math.max(0, Math.ceil((TAKE_OUT_DURATION_MS - elapsed) / 1000));
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
  return { text: `${minutes}:${seconds}`, expired: remainingSeconds === 0 };
}

export default function MachineCompletionAlert() {
  const { machines } = useApp();
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [acknowledgements, setAcknowledgements] = useState<Acknowledgements>(readAcknowledgements);

  const dueMachines = useMemo(
    () => machines
      .filter(machine =>
        machine.statusRaw === 'RUNNING' &&
        machine.completionDue &&
        machine.currentStage?.status === 'RUNNING',
      )
      .sort((left, right) =>
        new Date(left.finishAt ?? 0).getTime() - new Date(right.finishAt ?? 0).getTime() || left.id - right.id,
      ),
    [machines],
  );
  const dueKey = dueMachines.map(machine => machine.currentStage!.orderStageId).join(',');
  const activeMachine = dueMachines.find(machine => machine.currentStage?.orderStageId === selectedStageId)
    ?? dueMachines[0]
    ?? null;

  useEffect(() => {
    const runningStageIds = new Set(
      machines
        .filter(machine => machine.currentStage?.status === 'RUNNING')
        .map(machine => String(machine.currentStage!.orderStageId)),
    );
    setAcknowledgements(current => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([stageId]) => runningStageIds.has(stageId)),
      );
      if (Object.keys(next).length === Object.keys(current).length) return current;
      saveAcknowledgements(next);
      return next;
    });
  }, [machines]);

  useEffect(() => {
    if (!dueKey) return;
    void playCompletionChime();
    const retryAfterFirstGesture = () => { void playCompletionChime(); };
    window.addEventListener('pointerdown', retryAfterFirstGesture, { once: true });
    const reminderId = window.setInterval(() => { void playCompletionChime(); }, REMINDER_INTERVAL_MS);
    return () => {
      window.removeEventListener('pointerdown', retryAfterFirstGesture);
      window.clearInterval(reminderId);
    };
  }, [dueKey]);

  const acknowledge = (orderStageId: number) => {
    const next = {
      ...acknowledgements,
      [String(orderStageId)]: { acknowledgedAt: new Date().toISOString() },
    };
    saveAcknowledgements(next);
    setAcknowledgements(next);
  };

  const clearAcknowledgement = (orderStageId: number) => {
    const next = { ...acknowledgements };
    delete next[String(orderStageId)];
    saveAcknowledgements(next);
    setAcknowledgements(next);
  };

  if (!activeMachine?.currentStage) return null;
  const stageId = activeMachine.currentStage.orderStageId;

  return (
    <div className="completion-overlay" role="presentation">
      <section
        className="completion-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="machine-completion-title"
      >
        {dueMachines.length > 1 && (
          <div className="completion-machine-tabs" aria-label="Các máy vừa hoàn tất">
            {dueMachines.map(machine => (
              <button
                key={machine.currentStage!.orderStageId}
                className={machine.currentStage!.orderStageId === stageId ? 'active' : ''}
                onClick={() => setSelectedStageId(machine.currentStage!.orderStageId)}
              >
                {machine.name}
              </button>
            ))}
          </div>
        )}
        <CompletionPanel
          key={stageId}
          machine={activeMachine}
          acknowledgement={acknowledgements[String(stageId)]}
          onAcknowledge={() => acknowledge(stageId)}
          onClearAcknowledgement={() => clearAcknowledgement(stageId)}
        />
      </section>
    </div>
  );
}

function CompletionPanel({
  machine,
  acknowledgement,
  onAcknowledge,
  onClearAcknowledgement,
}: {
  machine: Machine;
  acknowledgement?: Acknowledgement;
  onAcknowledge: () => void;
  onClearAcknowledgement: () => void;
}) {
  const { refreshOperations, showToast } = useApp();
  const [currentTime, setCurrentTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [faultChoice, setFaultChoice] = useState<FaultStatus | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stage = machine.currentStage!;
  const customerName = stage.order?.customer?.name ?? 'Không xác định được khách hàng';
  const canComplete = machine.completionActionAllowed !== false;
  const countdown = acknowledgement
    ? formatCountdown(
        acknowledgement.acknowledgedAt,
        currentTime || new Date(acknowledgement.acknowledgedAt).getTime(),
      )
    : null;

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!acknowledgement) return;
    setCurrentTime(Date.now());
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [acknowledgement]);

  const completeStage = async () => {
    setSubmitting(true);
    setActionError('');
    try {
      const result = await apiPatch<MachineCompletionResult>(`/order-stages/${stage.orderStageId}/complete`);
      onClearAcknowledgement();
      showToast(`${machine.name} đã trống · Đơn #${stage.order?.orderId ?? stage.orderId} chuyển sang ${result.orderStatus}`, 'grn');
      if (result.recommendation) {
        showToast(`Đề xuất tiếp theo: đơn #${result.recommendation.orderId} vào ${machine.name}`, 'pu');
      }
      await refreshOperations();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể hoàn tất công đoạn. Hãy thử lại.');
      await refreshOperations();
    } finally {
      setSubmitting(false);
    }
  };

  const markFault = async () => {
    if (!faultChoice) return;
    setSubmitting(true);
    setActionError('');
    try {
      await apiPatch(`/machines/${machine.id}/status`, { status: faultChoice });
      onClearAcknowledgement();
      showToast(
        `${machine.name} đã được đánh dấu ${faultChoice === 'BROKEN' ? 'hỏng' : 'tạm ngừng'}. Công đoạn vẫn giữ RUNNING để kiểm tra.`,
        'red',
      );
      await refreshOperations();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái máy.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="completion-panel" ref={panelRef} tabIndex={-1}>
      <div className="completion-kicker">
        <span className="completion-bell" aria-hidden="true">♪</span>
        Máy vừa hoàn tất · Âm báo lặp lại mỗi 5 phút
      </div>
      <div className="completion-heading-row">
        <div>
          <h2 id="machine-completion-title">{machine.name} đã hoàn thành</h2>
          <p>Hãy lấy quần áo ra khỏi máy.</p>
        </div>
        <span className="completion-state-badge">Cần xử lý</span>
      </div>

      <div className="completion-order-grid">
        <div><span>Đơn hàng</span><strong>#{stage.order?.orderId ?? stage.orderId} · {customerName}</strong></div>
        <div><span>Công đoạn</span><strong>{stageLabel(stage.stage)}</strong></div>
        <div><span>Hoàn tất lúc</span><strong>{formatTime(machine.finishAt)}</strong></div>
        <div><span>Việc tiếp theo</span><strong>{nextTask(machine)}</strong></div>
      </div>

      {!canComplete && (
        <div className="completion-error" role="alert">
          <strong>Trạng thái cần kiểm tra</strong>
          <span>{machine.completionBlockedReason ?? 'Dữ liệu đơn và công đoạn chưa đồng bộ. Hệ thống chưa thay đổi dữ liệu.'}</span>
        </div>
      )}

      {canComplete && !acknowledgement && (
        <div className="completion-confirm-step">
          <span className="completion-step-number">1</span>
          <div>
            <strong>Nhận việc lấy đồ</strong>
            <p>Nhấn xác nhận để bắt đầu countdown ba phút trên thiết bị này.</p>
          </div>
          <button className="bp completion-primary" disabled={submitting} onClick={onAcknowledge}>
            Xác nhận
          </button>
        </div>
      )}

      {canComplete && acknowledgement && countdown && (
        <div className="completion-takeout-step">
          <div className={`completion-countdown${countdown.expired ? ' expired' : ''}`} aria-live="polite">
            <span>{countdown.text}</span>
            <small>{countdown.expired ? 'Đã đủ thời gian' : 'Lấy đồ khỏi máy'}</small>
          </div>
          <div className="completion-takeout-copy">
            <span className="completion-step-number">2</span>
            <div>
              <strong>{countdown.expired ? 'Xác nhận sau khi đã lấy hết đồ' : 'Lấy quần áo ra khỏi máy'}</strong>
              <p>Countdown chỉ lưu trên trình duyệt. Công đoạn chỉ kết thúc khi bạn nhấn nút bên dưới.</p>
            </div>
          </div>
          <button className="bp completion-primary" disabled={submitting} onClick={() => { void completeStage(); }}>
            {submitting ? 'Đang cập nhật...' : 'Đã lấy đồ xong'}
          </button>
        </div>
      )}

      {actionError && <div className="completion-error" role="alert"><strong>Chưa cập nhật được</strong><span>{actionError}</span></div>}

      <div className="completion-fault-area">
        {!faultChoice ? (
          <button className="completion-link-button" disabled={submitting} onClick={() => setFaultChoice('BROKEN')}>
            Máy có lỗi vật lý?
          </button>
        ) : (
          <div className="completion-fault-confirm">
            <div>
              <strong>Không giải phóng máy</strong>
              <p>Stage vẫn RUNNING để tránh mất dấu đơn. Chọn trạng thái máy rồi xác nhận.</p>
            </div>
            <div className="completion-fault-options">
              <button className={faultChoice === 'BROKEN' ? 'selected' : ''} onClick={() => setFaultChoice('BROKEN')}>Hỏng</button>
              <button className={faultChoice === 'INACTIVE' ? 'selected' : ''} onClick={() => setFaultChoice('INACTIVE')}>Tạm ngừng</button>
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end', marginTop: 12, borderTop: '1px solid #fee2e2', paddingTop: 12 }}>
              <button className="bs" disabled={submitting} onClick={() => setFaultChoice(null)}>Hủy thao tác</button>
              <button className="br" disabled={submitting} onClick={() => { void markFault(); }}>
                {submitting ? 'Đang lưu...' : 'Xác nhận trạng thái'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
