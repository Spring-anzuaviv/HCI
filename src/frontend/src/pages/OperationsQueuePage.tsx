import { useDeferredValue, useMemo, useState } from 'react';
import { useApp } from '../context/useApp';
import type { ModalOrderParams, QueueItem } from '../types';
import { filterOrders } from '../utils/orderSearch';
import { startRun, completeRun } from '../api/orders';
import { useKeyedAsyncAction } from '../hooks/useAsyncAction';

// ─── Nhãn tĩnh ───
const SERVICE_LABELS: Record<string, string> = {
  WASH: 'Chỉ giặt', DRY: 'Chỉ sấy', WASH_DRY: 'Giặt + Sấy',
};
const STAGE_LABELS: Record<string, string> = {
  SORTING: 'Phân loại', WASH: 'Giặt', TRANSFER: 'Chuyển đồ', DRY: 'Sấy', PACKING: 'Đóng gói',
};

/** Thứ tự công đoạn trong workflow */
const STAGE_ORDER = ['SORTING', 'WASH', 'TRANSFER', 'DRY', 'PACKING'] as const;

/** Màu sắc & icon cho từng công đoạn */
const STAGE_META: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  SORTING:  { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', icon: '🗂️' },
  WASH:     { color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd', icon: '🫧' },
  TRANSFER: { color: '#c2410c', bg: '#ffedd5', border: '#fdba74', icon: '↕️' },
  DRY:      { color: '#b45309', bg: '#fef3c7', border: '#fcd34d', icon: '💨' },
  PACKING:  { color: '#15803d', bg: '#dcfce7', border: '#86efac', icon: '📦' },
};

// ─── Helpers ───
function formatTime(value: string | null, fallback = 'Chưa có'): string {
  if (!value) return fallback;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch { return fallback; }
}

function slackText(slackMinutes: number | null, estimatedAt: string | null, pickupAt: string | null): {
  label: string; cls: 'ok' | 'risk' | 'late'; icon: string;
} {
  if (!estimatedAt || !pickupAt) return { label: 'Chưa tính được', cls: 'ok', icon: '—' };
  const slack = slackMinutes ?? Math.round((new Date(pickupAt).getTime() - new Date(estimatedAt).getTime()) / 60_000);
  if (slack < 0)  return { label: `Dự kiến trễ ${Math.abs(slack)} phút`, cls: 'late', icon: '🔴' };
  if (slack <= 15) return { label: 'Có nguy cơ trễ',  cls: 'risk', icon: '⚠' };
  return { label: 'Đúng hẹn', cls: 'ok', icon: '✓' };
}

/**
 * Trả về câu hành động dạng dễ hiểu cho nhân viên ít rành công nghệ.
 * Phân biệt PLANNED (chờ) vs RUNNING (đang).
 */
function buildNextActionText(item: QueueItem): string {
  const cur = item.currentStage;
  const next = item.nextStage;
  const status = item.status; // RECEIVED, WAITING, WASHING, DRYING, FOLDING_PACKING, READY ...

  // Đang chạy — chờ hoàn tất
  if (status === 'WASHING')        return item.machineName ? `Đợi ${item.machineName} xong` : 'Đang giặt — chờ xong';
  if (status === 'DRYING')         return item.machineName ? `Đợi ${item.machineName} xong` : 'Đang sấy — chờ xong';
  if (status === 'FOLDING_PACKING') return 'Đang đóng gói';
  if (status === 'RECEIVED')        return 'Phân loại đồ';
  if (status === 'WAITING') {
    // Chờ máy cho công đoạn nào?
    if (cur === 'WASH' || next === 'WASH') return item.machineName ? `Chờ ${item.machineName} trống` : 'Chờ máy giặt trống';
    if (cur === 'DRY'  || next === 'DRY')  return item.machineName ? `Chờ ${item.machineName} trống` : 'Chờ máy sấy trống';
    return item.machineName ? `Chờ ${item.machineName} trống` : 'Chờ máy trống';
  }

  // Dựa vào nextStage
  if (!next) return 'Chờ xử lý';
  if (next === 'SORTING')   return 'Phân loại đồ';
  if (next === 'WASH')      return item.machineName ? `Đưa vào ${item.machineName}` : 'Đưa vào máy giặt';
  if (next === 'TRANSFER')  return 'Chuyển đồ sang máy sấy';
  if (next === 'DRY')       return item.machineName ? `Đưa vào ${item.machineName}` : 'Đưa vào máy sấy';
  if (next === 'PACKING')   return 'Đóng gói đơn';
  return item.nextAction ?? 'Xem chi tiết';
}

/**
 * Nhãn trạng thái hiện tại — phân biệt PLANNED (chờ) / RUNNING (đang).
 */
function buildCurrentStateText(item: QueueItem): string {
  const status = item.status;
  const mac = item.machineName ? ` · ${item.machineName}` : '';
  if (status === 'RECEIVED')         return 'Vừa tiếp nhận';
  if (status === 'WAITING') {
    const cur = item.currentStage;
    if (cur === 'WASH') return 'Chờ máy giặt';
    if (cur === 'DRY')  return 'Chờ máy sấy';
    return 'Chờ xử lý';
  }
  if (status === 'WASHING')          return `Đang giặt${mac}`;
  if (status === 'DRYING')           return `Đang sấy${mac}`;
  if (status === 'FOLDING_PACKING')  return 'Đang đóng gói';
  if (status === 'READY')            return 'Sẵn sàng giao';
  if (status === 'NOTIFIED')         return 'Đã báo khách';
  if (status === 'COMPLETED')        return 'Hoàn tất';
  return item.status ?? 'Không rõ';
}



function buildModalParams(item: QueueItem, orders: ReturnType<typeof useApp>['orders']): ModalOrderParams {
  const mappedOrder = orders.find(o => o.orderId === item.orderId);
  return {
    orderId: item.orderId,
    name: item.customer?.name ?? `Đơn #${item.orderId}`,
    phone: item.customer?.phone,
    deadline: formatTime(item.pickupAt, ''),
    atRisk: item.riskLevel === 'AT_RISK' || item.riskLevel === 'NOT_FEASIBLE',
    svcType: mappedOrder?.service ?? (item.serviceType === 'WASH_DRY' ? 'combo' : item.serviceType === 'DRY' ? 'dry' : 'wash'),
    isWaiting: item.status === 'WAITING',
    recommendedMachineId: item.machineId,
  };
}

// ═══════════════════════════════════════════════════════════════════
export default function OperationsQueuePage() {
  const {
    orders, openM, setOrderModalParams, orderSearch, orderFilter,
    queueSnapshot, operationsLoading, queueRefreshing, operationsError, refreshOperations,
  } = useApp();
  const deferredOrderSearch = useDeferredValue(orderSearch);

  // Collapse state cho nhóm Hoàn tất — mặc định đóng
  const [completedOpen, setCompletedOpen] = useState(false);

  const openOrderModal = (item: QueueItem) => {
    setOrderModalParams(buildModalParams(item, orders));
    openM('om');
  };

  const visibleOrderIds = useMemo(
    () => new Set(filterOrders(orders, deferredOrderSearch, orderFilter).map(o => o.orderId)),
    [orders, deferredOrderSearch, orderFilter],
  );

  const allItems = useMemo(() => queueSnapshot?.items ?? [], [queueSnapshot?.items]);
  const visibleItems = useMemo(
    () => allItems.filter(item => visibleOrderIds.has(item.orderId)),
    [allItems, visibleOrderIds],
  );

  const completedOrders = useMemo(() => {
    if (orderFilter === 'pending') return [];
    return orders.filter(o => o.status === 'done' && visibleOrderIds.has(o.orderId!)).map((o, idx) => ({
      rank: idx + 1,
      orderId: o.orderId!,
      customer: { name: o.name, phone: o.phone },
      status: 'COMPLETED',
      serviceType: o.serviceType ?? (o.service === 'combo' ? 'WASH_DRY' : o.service === 'dry' ? 'DRY' : 'WASH'),
      weightKg: o.kg,
      readyAt: o.readyAt ?? null,
      pickupAt: o.pickupAt ?? null,
      estimatedAt: o.estimatedAt ?? null,
      groupCode: o.groupCode ?? null,
      currentStage: 'COMPLETED',
      nextStage: null,
      orderStageId: null,
      machineId: null,
      machineName: null,
      plannedStartAt: null,
      plannedEndAt: null,
      riskLevel: 'FEASIBLE' as const,
      slackMinutes: null,
      riskMessage: '',
      missingFields: [],
      priorityReason: 'Đã hoàn tất',
      priorityReasons: [],
      nextAction: 'Giao khách',
      operationalState: 'NORMAL' as const,
      reviewReasons: [],
      canStart: false,
      recommendationBlockedReasons: [],
      remainingStages: 0,
      createdAt: o.receivedAt,
    }));
  }, [orders, orderFilter, visibleOrderIds]);

  // Nhóm theo công đoạn hiện tại
  const groupedByStage = useMemo(() => {
    const map = new Map<string, QueueItem[]>();
    for (const stage of STAGE_ORDER) map.set(stage, []);
    for (const item of visibleItems) {
      const stage = item.currentStage ?? 'SORTING';
      const key = STAGE_ORDER.includes(stage as typeof STAGE_ORDER[number]) ? stage : 'SORTING';
      map.get(key)!.push(item);
    }
    for (const [key, group] of map.entries()) {
      map.set(key, group.sort((a, b) => {
        const urgencyA = a.riskLevel === 'NOT_FEASIBLE' ? 0 : a.operationalState === 'NEEDS_REVIEW' ? 1 : a.riskLevel === 'AT_RISK' ? 2 : 3;
        const urgencyB = b.riskLevel === 'NOT_FEASIBLE' ? 0 : b.operationalState === 'NEEDS_REVIEW' ? 1 : b.riskLevel === 'AT_RISK' ? 2 : 3;
        return urgencyA - urgencyB || a.rank - b.rank;
      }));
    }
    return map;
  }, [visibleItems]);

  const recommendations = useMemo(
    () => (queueSnapshot?.recommendations ?? []).filter(r => visibleOrderIds.has(r.orderId)),
    [queueSnapshot, visibleOrderIds],
  );

  const summary = queueSnapshot?.summary;
  const lateCount  = visibleItems.filter(i => i.riskLevel === 'NOT_FEASIBLE').length;
  const riskCount  = visibleItems.filter(i => i.riskLevel === 'AT_RISK').length;
  const reviewCount = visibleItems.filter(i => i.operationalState === 'NEEDS_REVIEW').length;

  return (
    <div id="p-q" className="page">
      {/* ── Header ── */}
      <div className="oq-header">
        <div className="oq-header-left">
          <h2 className="oq-title">Hàng đợi</h2>
          <div className="oq-summary" aria-label="Tóm tắt">
            {lateCount > 0 && <span className="oq-summary-chip danger">🔴 {lateCount} trễ hẹn</span>}
            {riskCount > 0 && <span className="oq-summary-chip risk">⚠ {riskCount} rủi ro</span>}
            {reviewCount > 0 && <span className="oq-summary-chip review">🔎 {reviewCount} cần kiểm tra</span>}
            {summary?.availableMachines != null && summary.availableMachines > 0 && (
              <span className="oq-summary-chip ok">✓ {summary.availableMachines} máy trống</span>
            )}
            {lateCount === 0 && riskCount === 0 && reviewCount === 0 && visibleItems.length > 0 && orderFilter !== 'done' && (
              <span className="oq-summary-chip ok">✓ Tất cả đơn đúng tiến độ</span>
            )}
          </div>
        </div>
        <div className="oq-header-right">
          {queueSnapshot && (
            <span className="queue-updated">Cập nhật {formatTime(queueSnapshot.generatedAt)}</span>
          )}
        </div>
      </div>

      {/* ── Loading / Error / Empty ── */}
      {operationsLoading && (
        <div className="card operations-state" role="status" aria-live="polite">
          <strong>Đang tải trạng thái vận hành...</strong>
          <span>Hệ thống đang đọc máy, công đoạn và deadline hiện tại.</span>
        </div>
      )}
      {!operationsLoading && operationsError && (
        <div className="card operations-state error" role="alert">
          <strong>Không thể tải hàng đợi</strong>
          <span>{operationsError}</span>
          <button className="bs" onClick={() => void refreshOperations()} disabled={queueRefreshing} aria-busy={queueRefreshing}>
            {queueRefreshing ? 'Đang tải lại...' : 'Thử lại'}
          </button>
        </div>
      )}
      {!operationsLoading && !operationsError && allItems.length === 0 && completedOrders.length === 0 && (
        <div className="card operations-state" role="status">
          <strong>Hiện không có đơn cần xử lý.</strong>
          <span>Trạng thái máy vẫn được hiển thị ở bảng vận hành bên phải.</span>
        </div>
      )}

      {!operationsLoading && !operationsError && (allItems.length > 0 || completedOrders.length > 0) && (
        <>
          {/* ── Đề xuất ưu tiên ── */}
          {recommendations.length > 0 && (
            <div className="card oq-zone-a-card">
              <div className="oq-zone-label">
                <svg className="icon icon-sm"><use href="#i-cpu" /></svg>
                Nên xử lý tiếp
              </div>
              <div className="oq-recs">
                {recommendations.map(rec => (
                  <RecommendationCard
                    key={`${rec.orderId}-${rec.machineId}`}
                    item={rec}
                    onOpen={() => openOrderModal(rec)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Nhóm theo công đoạn ── */}
          {STAGE_ORDER.map(stage => {
            const group = groupedByStage.get(stage) ?? [];
            if (group.length === 0) return null;
            const meta = STAGE_META[stage];
            const groupLate   = group.filter(i => i.riskLevel === 'NOT_FEASIBLE').length;
            const groupRisk   = group.filter(i => i.riskLevel === 'AT_RISK').length;
            const groupReview = group.filter(i => i.operationalState === 'NEEDS_REVIEW').length;

            return (
              <div
                key={stage}
                className="card oq-stage-group"
                style={{ borderTop: `3px solid ${meta.border}` }}
                role="region"
                aria-label={`Công đoạn ${STAGE_LABELS[stage]}`}
              >
                <div className="oq-stage-header">
                  <div className="oq-stage-title" style={{ color: meta.color }}>
                    <span className="oq-stage-dot" style={{ background: meta.bg, border: `1.5px solid ${meta.border}` }}>
                      {meta.icon}
                    </span>
                    {STAGE_LABELS[stage]}
                    <span className="oq-stage-count" style={{ background: meta.bg, color: meta.color }}>
                      {group.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {groupLate   > 0 && <span className="oq-summary-chip danger" style={{ fontSize: 10 }}>🔴 {groupLate} trễ</span>}
                    {groupRisk   > 0 && <span className="oq-summary-chip risk"   style={{ fontSize: 10 }}>⚠ {groupRisk} rủi ro</span>}
                    {groupReview > 0 && <span className="oq-summary-chip review" style={{ fontSize: 10 }}>🔎 {groupReview} kiểm tra</span>}
                  </div>
                </div>

                <div className="oq-card-list">
                  {group.map((item) => (
                    <TaskCard
                      key={item.orderId}
                      item={item}
                      stageMeta={meta}
                      onOpen={() => openOrderModal(item)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Trống sau filter */}
          {visibleItems.length === 0 && (
            <div className="queue-no-results">
              Không tìm thấy đơn phù hợp với tìm kiếm hoặc bộ lọc.
            </div>
          )}

          {/* ── Đơn hoàn tất — collapse mặc định ── */}
          {(orderFilter === 'all' || orderFilter === 'done') && completedOrders.length > 0 && (
            <div
              className="card oq-stage-group"
              style={{ borderTop: `3px solid #10b981` }}
              role="region"
              aria-label="Đơn đã hoàn tất"
            >
              {/* Header có nút toggle */}
              <button
                type="button"
                className="oq-completed-toggle"
                onClick={() => setCompletedOpen(v => !v)}
                aria-expanded={completedOpen}
              >
                <span className="oq-stage-title" style={{ color: '#047857' }}>
                  <span className="oq-stage-dot" style={{ background: '#d1fae5', border: '1.5px solid #10b981' }}>
                    <svg className="icon"><use href="#i-check" /></svg>
                  </span>
                  Đã hoàn tất
                  <span className="oq-stage-count" style={{ background: '#d1fae5', color: '#047857' }}>
                    {completedOrders.length}
                  </span>
                </span>
                <span className="oq-completed-hint">
                  {completedOpen ? 'Ẩn' : 'Xem'}
                  <svg className="icon icon-sm" style={{ transform: completedOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <use href="#i-chevron-down" />
                  </svg>
                </span>
              </button>

              {completedOpen && (
                <div className="oq-card-list" style={{ marginTop: 10 }}>
                  {completedOrders.map(item => (
                    <CompletedRow key={item.orderId} item={item} onOpen={() => openOrderModal(item)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Component Nút bấm hành động nhanh ───
function PrimaryAction({ item, onOpen }: { item: QueueItem, onOpen: () => void }) {
  const { showToast, refreshOperations } = useApp();
  const { isPending, run } = useKeyedAsyncAction();
  const actionKey = `primary-act:${item.orderId}`;
  const loading = isPending(actionKey);

  const status = item.status;
  const isMachineRunning = status === 'WASHING' || status === 'DRYING';
  const isWaitingForMachine = status === 'WAITING' && (item.nextStage === 'WASH' || item.nextStage === 'DRY');
  const isManualStage = status === 'RECEIVED' || status === 'FOLDING_PACKING';

  const handleStartRun = async (machineId: number) => {
    if (!item.nextStage) return;
    await run(actionKey, async () => {
      try {
        await startRun(item.orderId, item.nextStage!, machineId);
        showToast(`Đã bắt đầu ${STAGE_LABELS[item.nextStage!] ?? item.nextStage} cho #${item.orderId}`, 'grn');
        void refreshOperations();
      } catch (error) { showToast(error instanceof Error ? error.message : 'Lỗi khi bắt đầu', 'red'); }
    });
  };

  const handleCompleteRun = async () => {
    if (!item.orderStageId) { showToast('Lỗi: Không tìm thấy ID công đoạn', 'red'); return; }
    await run(actionKey, async () => {
      try {
        await completeRun(item.orderStageId!);
        showToast(`✓ Đã hoàn thành mẻ cho #${item.orderId}`, 'grn');
        void refreshOperations();
      } catch (error) { showToast(error instanceof Error ? error.message : 'Lỗi khi hoàn tất', 'red'); }
    });
  };

  const handleCompleteManual = async () => {
    if (!item.nextStage) return;
    await run(actionKey, async () => {
      try {
        const stageData = await startRun(item.orderId, item.nextStage!, 0);
        if (stageData?.orderStageId) await completeRun(stageData.orderStageId);
        showToast(`✓ Đã hoàn tất ${STAGE_LABELS[item.nextStage!] ?? item.nextStage} cho #${item.orderId}`, 'grn');
        void refreshOperations();
      } catch (error) { showToast(error instanceof Error ? error.message : 'Lỗi khi hoàn tất', 'red'); }
    });
  };

  if (isMachineRunning) {
    return (
      <button className="bp" onClick={handleCompleteRun} disabled={loading}>
         {loading ? 'Đang xử lý...' : '✓ Hoàn thành mẻ'}
      </button>
    );
  }
  if (isWaitingForMachine) {
    if (item.machineId) {
      return (
        <button className="bp" onClick={() => handleStartRun(item.machineId!)} disabled={loading}>
          {loading ? 'Đang xử lý...' : `▶ Bắt đầu với ${item.machineName}`}
        </button>
      );
    }
    // Waiting for machine but no recommendation/free machine
    return <button className="bp" onClick={onOpen} disabled={loading}>▶ Chọn máy</button>;
  }
  if (isManualStage && item.nextStage) {
    return (
      <button className="bp" onClick={handleCompleteManual} disabled={loading}>
        {loading ? 'Đang xử lý...' : `✓ Đã ${STAGE_LABELS[item.nextStage].toLowerCase()}`}
      </button>
    );
  }

  // Fallback / READY / NOTIFIED etc.
  return <button className="bs" onClick={onOpen}>Xử lý đơn</button>;
}

// ─── Recommendation Card (⭐ Nên xử lý tiếp) ───
function RecommendationCard({ item, onOpen }: { item: QueueItem; onOpen: () => void }) {
  const isRisk = item.riskLevel === 'NOT_FEASIBLE' || item.riskLevel === 'AT_RISK';
  const slack  = slackText(item.slackMinutes, item.estimatedAt, item.pickupAt);
  const nextTxt = buildNextActionText(item);
  const curTxt  = buildCurrentStateText(item);

  return (
    <div className={`oq-tc-new${isRisk ? ' risk' : ''}`}>
      <div className="oq-tc-clickable" onClick={onOpen}>
        <div className="oq-tc-header">
           <span className="oq-tc-title">⭐ #{item.orderId} · {item.customer?.name ?? 'Khách'}</span>
           <span className={`oq-tc-badge ${slack.cls}`}>{slack.icon} {slack.label}</span>
        </div>
        <div className="oq-tc-status">
           {curTxt} · {SERVICE_LABELS[item.serviceType] ?? item.serviceType} · {item.weightKg}kg
        </div>
        <div className="oq-tc-time">
           Hẹn: {formatTime(item.pickupAt, 'Chưa hẹn')} · Dự kiến xong: {formatTime(item.estimatedAt, 'Chưa tính')}
        </div>
        <div className="oq-tc-next" style={{ fontWeight: 600, color: '#4f46e5', marginTop: 4 }}>
           Tiếp theo: {nextTxt}
        </div>
        {item.priorityReasons.length > 0 && (
           <div style={{ fontSize: '11px', color: '#b45309', marginTop: 4 }}>
             <svg className="icon icon-sm"><use href="#i-info" /></svg> {item.priorityReasons[0]}
           </div>
        )}
      </div>
      
      <div className="oq-tc-actions" style={{ display: 'flex', gap: 6, marginTop: 10, padding: '0 12px 12px' }}>
         <PrimaryAction item={item} onOpen={onOpen} />
         <button className="bs" style={{ padding: '0 10px', fontSize: 16 }} onClick={onOpen} title="Xem chi tiết">⋯</button>
      </div>
    </div>
  );
}

// ─── Task Card cho mỗi đơn trong nhóm ───
function TaskCard({
  item, stageMeta, onOpen,
}: {
  item: QueueItem;
  stageMeta: typeof STAGE_META[string];
  onOpen: () => void;
}) {
  const isLate   = item.riskLevel === 'NOT_FEASIBLE';
  const isRisk   = item.riskLevel === 'AT_RISK';
  const isReview = item.operationalState === 'NEEDS_REVIEW';

  const slack   = slackText(item.slackMinutes, item.estimatedAt, item.pickupAt);
  const nextTxt = buildNextActionText(item);
  const curTxt  = buildCurrentStateText(item);
  const borderColor = isLate ? 'var(--rd)' : isRisk ? '#b45309' : isReview ? 'var(--am)' : stageMeta.border;

  return (
    <div className={`oq-tc-new${isLate ? ' late' : isRisk ? ' risk' : ''}`} style={{ borderLeft: `4px solid ${borderColor}` }}>
      <div className="oq-tc-clickable" onClick={onOpen}>
        <div className="oq-tc-header">
           <span className="oq-tc-title">#{item.orderId} · {item.customer?.name ?? 'Khách'}</span>
           <span className={`oq-tc-badge ${slack.cls}`}>{slack.icon} {slack.label}</span>
        </div>
        <div className="oq-tc-status">
           {curTxt} · {SERVICE_LABELS[item.serviceType] ?? item.serviceType} · {item.weightKg}kg
        </div>
        <div className="oq-tc-time">
           Hẹn: {formatTime(item.pickupAt, 'Chưa hẹn')} · Xong: {formatTime(item.estimatedAt, 'Chưa tính')}
        </div>
        <div className="oq-tc-next">
           Tiếp theo: {nextTxt}
        </div>
        {isReview && item.reviewReasons.length > 0 && (
           <div className="oq-tc-review-hint" style={{ fontSize: '11px', color: '#b45309', marginTop: 4 }}>
             🔎 {item.reviewReasons[0]}
           </div>
        )}
      </div>
      
      {!isReview && (
        <div className="oq-tc-actions" style={{ display: 'flex', gap: 6, marginTop: 10, padding: '0 12px 12px' }}>
           <PrimaryAction item={item} onOpen={onOpen} />
           <button className="bs" style={{ padding: '0 10px', fontSize: 16 }} onClick={onOpen} title="Xem chi tiết">⋯</button>
        </div>
      )}
    </div>
  );
}

// ─── Hàng đơn đã hoàn tất (compact) ───
function CompletedRow({ item, onOpen }: { item: QueueItem; onOpen: () => void }) {
  const finishedTime = formatTime(item.estimatedAt, 'Không rõ');
  // Tính xem có trễ không dựa trên estimatedAt vs pickupAt
  const wasLate = item.estimatedAt && item.pickupAt
    ? new Date(item.estimatedAt) > new Date(item.pickupAt)
    : false;

  return (
    <button
      type="button"
      className="oq-done-row"
      onClick={onOpen}
      aria-label={`Đơn hoàn tất #${item.orderId} – ${item.customer?.name ?? ''}`}
    >
      <span className="oq-done-name">
        #{item.orderId} · {item.customer?.name ?? 'Chưa có tên'}
      </span>
      <span className="oq-done-svc">
        {SERVICE_LABELS[item.serviceType] ?? item.serviceType} · {item.weightKg}kg
      </span>
      <span className="oq-done-time">
        Xong lúc {finishedTime}
      </span>
      <span className={`oq-done-status${wasLate ? ' late' : ''}`}>
        {wasLate ? '⚠ Trễ hẹn' : '✓ Đúng hẹn'}
      </span>
    </button>
  );
}
