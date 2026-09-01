import { useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { ModalOrderParams, QueueItem } from '../types';
import { filterOrders } from '../utils/orderSearch';

// ─── Nhãn tĩnh ───
const SERVICE_LABELS: Record<string, string> = {
  WASH: 'Chỉ giặt', DRY: 'Chỉ sấy', WASH_DRY: 'Giặt + Sấy',
};
const STAGE_LABELS: Record<string, string> = {
  SORTING: 'Phân loại', WASH: 'Giặt', TRANSFER: 'Chuyển đồ', DRY: 'Sấy', PACKING: 'Đóng gói',
};
const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Tiếp nhận', WAITING: 'Chờ máy', WASHING: 'Đang giặt',
  DRYING: 'Đang sấy', FOLDING_PACKING: 'Đang đóng gói',
  READY: 'Sẵn sàng lấy', NOTIFIED: 'Đã báo khách', COMPLETED: 'Hoàn tất',
};

/** Thứ tự công đoạn trong workflow */
const STAGE_ORDER = ['SORTING', 'WASH', 'TRANSFER', 'DRY', 'PACKING'] as const;

/** Màu sắc & icon cho từng công đoạn — đủ tương phản để nhìn từ xa */
const STAGE_META: Record<string, { color: string; bg: string; border: string; icon: string; iconId: string }> = {
  SORTING: { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', icon: '🗂️', iconId: 'i-sort' },
  WASH: { color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd', icon: '🫧', iconId: 'i-washer' },
  TRANSFER: { color: '#c2410c', bg: '#ffedd5', border: '#fdba74', icon: '↕️', iconId: 'i-arrow-right' },
  DRY: { color: '#b45309', bg: '#fef3c7', border: '#fcd34d', icon: '💨', iconId: 'i-zap' },
  PACKING: { color: '#15803d', bg: '#dcfce7', border: '#86efac', icon: '📦', iconId: 'i-package' },
};

// ─── Helpers ───
function stageLabel(v: string | null) {
  return v ? (STAGE_LABELS[v] ?? v) : '—';
}

function formatRelativeTime(value: string | null, now: Date, fallback = 'Chưa có'): string {
  if (!value) return fallback;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return fallback;
    const diff = Math.round((d.getTime() - now.getTime()) / 60_000);
    if (Math.abs(diff) <= 120) {
      if (diff < -1) return `Trễ ${Math.abs(diff)} phút`;
      if (diff <= 1) return 'Ngay bây giờ';
      return `Còn ${diff} phút`;
    }
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return fallback;
  }
}

function formatTime(value: string | null, fallback = 'Chưa có'): string {
  if (!value) return fallback;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return fallback;
  }
}

function useNow() {
  const nowRef = useRef(new Date());
  useEffect(() => {
    const id = window.setInterval(() => { nowRef.current = new Date(); }, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return nowRef.current;
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
    queueSnapshot, operationsLoading, operationsError, refreshOperations,
  } = useApp();
  const now = useNow();

  const openOrderModal = (item: QueueItem) => {
    setOrderModalParams(buildModalParams(item, orders));
    openM('om');
  };

  const visibleOrderIds = useMemo(
    () => new Set(filterOrders(orders, orderSearch, orderFilter).map(o => o.orderId)),
    [orders, orderSearch, orderFilter],
  );

  const allItems = queueSnapshot?.items ?? [];
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
    // Trong mỗi nhóm: trễ + review lên đầu, sau đó theo rank
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
  const lateCount = visibleItems.filter(i => i.riskLevel === 'NOT_FEASIBLE').length;
  const riskCount = visibleItems.filter(i => i.riskLevel === 'AT_RISK').length;
  const reviewCount = visibleItems.filter(i => i.operationalState === 'NEEDS_REVIEW').length;

  return (
    <div id="p-q" className="page">
      {/* ── Header ── */}
      <div className="oq-header">
        <div className="oq-header-left">
          <h2 className="oq-title">Hàng đợi đơn hàng</h2>
          <div className="oq-summary" aria-label="Tóm tắt">
            {lateCount > 0 && (
              <span className="oq-summary-chip danger">🔴 {lateCount} trễ hẹn</span>
            )}
            {riskCount > 0 && (
              <span className="oq-summary-chip risk">⚠️ {riskCount} rủi ro</span>
            )}
            {reviewCount > 0 && (
              <span className="oq-summary-chip review">🔎 {reviewCount} cần kiểm tra</span>
            )}
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
          <button className="bs" onClick={() => void refreshOperations()}>Thử lại</button>
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
          {/* ── Đề xuất ── */}
          {recommendations.length > 0 && (
            <div className="card oq-zone-a-card">
              <div className="oq-zone-label">
                <svg className="icon icon-sm"><use href="#i-cpu" /></svg>
                Đề xuất xử lý tiếp
              </div>
              <div className="oq-recs">
                {recommendations.map(rec => (
                  <RecommendationCard
                    key={`${rec.orderId}-${rec.machineId}`}
                    item={rec}
                    now={now}
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
            const groupLate = group.filter(i => i.riskLevel === 'NOT_FEASIBLE').length;
            const groupRisk = group.filter(i => i.riskLevel === 'AT_RISK').length;
            const groupReview = group.filter(i => i.operationalState === 'NEEDS_REVIEW').length;

            return (
              <div
                key={stage}
                className="card oq-stage-group"
                style={{ borderTop: `3px solid ${meta.border}` }}
                role="region"
                aria-label={`Công đoạn ${STAGE_LABELS[stage]}`}
              >
                {/* Group header */}
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
                  {/* Cảnh báo nhóm */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {groupLate > 0 && <span className="oq-summary-chip danger" style={{ fontSize: 10 }}>🔴 {groupLate} trễ</span>}
                    {groupRisk > 0 && <span className="oq-summary-chip risk" style={{ fontSize: 10 }}>⚠️ {groupRisk} rủi ro</span>}
                    {groupReview > 0 && <span className="oq-summary-chip review" style={{ fontSize: 10 }}>🔎 {groupReview} kiểm tra</span>}
                  </div>
                </div>

                {/* Danh sách đơn trong nhóm */}
                <div className="olist" style={{ marginTop: 8 }}>
                  {group.map(item => (
                    <StageQueueRow
                      key={item.orderId}
                      item={item}
                      now={now}
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

          {/* ── Đơn hoàn tất ── */}
          {(orderFilter === 'all' || orderFilter === 'done') && completedOrders.length > 0 && (
            <div
              className="card oq-stage-group"
              style={{ borderTop: `3px solid #10b981` }}
              role="region"
              aria-label={`Công đoạn Hoàn tất`}
            >
              <div className="oq-stage-header">
                <div className="oq-stage-title" style={{ color: '#047857' }}>
                  <span className="oq-stage-dot" style={{ background: '#d1fae5', border: `1.5px solid #10b981` }}>
                    <svg className="icon"><use href="#i-check" /></svg>
                  </span>
                  Đã hoàn tất
                  <span className="oq-stage-count" style={{ background: '#d1fae5', color: '#047857' }}>
                    {completedOrders.length}
                  </span>
                </div>
              </div>
              <div className="oq-stage-list">
                {completedOrders.map(item => (
                  <StageQueueRow
                    key={item.orderId}
                    item={item}
                    now={now}
                    stageMeta={{ icon: '', bg: '#d1fae5', color: '#047857', border: '#10b981', iconId: 'i-check' }}
                    onOpen={() => openOrderModal(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Recommendation Card ───
function RecommendationCard({ item, now, onOpen }: { item: QueueItem; now: Date; onOpen: () => void }) {
  const isRisk = item.riskLevel === 'NOT_FEASIBLE' || item.riskLevel === 'AT_RISK';
  return (
    <div className={`oq-rec-card${isRisk ? ' risk' : ''}`}>
      <div className="oq-rec-id">#{item.orderId}</div>
      <div className="oq-rec-body">
        <div className="oq-rec-name">{item.customer?.name ?? 'Chưa có tên khách'}</div>
        <div className="oq-rec-meta">
          {item.machineName && (
            <span className="chip w" style={{ fontSize: 10 }}>
              {item.machineName} · {stageLabel(item.nextStage)}
            </span>
          )}
          <span style={{ color: 'var(--ts)', fontSize: 11 }}>
            Hẹn {formatRelativeTime(item.pickupAt, now)} · {item.weightKg}kg
          </span>
        </div>
        {item.priorityReasons.slice(0, 2).map(r => (
          <div key={r} className="oq-rec-reasons">
            <span><svg className="icon icon-sm"><use href="#i-info" /></svg> {r}</span>
          </div>
        ))}
      </div>
      <button className="bp oq-rec-btn" onClick={onOpen} aria-label={`Xử lý ngay đơn #${item.orderId}`}>
        Xử lý ngay <svg className="icon icon-sm"><use href="#i-arrow-right" /></svg>
      </button>
    </div>
  );
}

// ─── Row trong nhóm công đoạn ───
function StageQueueRow({
  item, now, stageMeta, onOpen,
}: {
  item: QueueItem;
  now: Date;
  stageMeta: typeof STAGE_META[string];
  onOpen: () => void;
}) {
  const isLate = item.riskLevel === 'NOT_FEASIBLE';
  const isRisk = item.riskLevel === 'AT_RISK';
  const isReview = item.operationalState === 'NEEDS_REVIEW';

  const riskBorderColor = isLate ? 'var(--rd)' : isRisk ? '#b45309' : isReview ? 'var(--am)' : stageMeta.border;
  const deadlineDiff = item.pickupAt
    ? Math.round((new Date(item.pickupAt).getTime() - now.getTime()) / 60_000)
    : null;
  const deadlineDanger = deadlineDiff !== null && deadlineDiff < 30;

  return (
    <button
      className="orow queue-row oq-row"
      style={{ borderLeftColor: riskBorderColor, borderLeftWidth: (isLate || isRisk || isReview) ? 3 : undefined }}
      onClick={onOpen}
      aria-label={`Đơn #${item.orderId} – ${item.customer?.name ?? ''}`}
    >
      {/* Rank badge */}
      <span
        className={`opri ${isReview ? 'am' : isLate ? 'rd' : isRisk ? 'am' : item.rank <= 3 ? 'bl' : 'gr'}`}
        title="Thứ tự ưu tiên"
      >
        {isReview ? '!' : item.rank}
      </span>

      {/* Tên + chi tiết */}
      <span className="queue-order">
        <strong>
          #{item.orderId} · {item.customer?.name ?? 'Chưa có tên'}
        </strong>
        <span>
          {STATUS_LABELS[item.status] ?? item.status}
          {item.machineName ? ` · ${item.machineName}` : ''}
          {' · '}
          {SERVICE_LABELS[item.serviceType] ?? item.serviceType}
          {' · '}
          {item.weightKg}kg
        </span>
      </span>

      {/* Facts */}
      <span className="queue-facts">
        <div>
          <span>Tiếp theo</span>
          <strong>{stageLabel(item.nextStage)}</strong>
        </div>
        <div>
          <span>ETA</span>
          <strong className={isLate ? 'oq-danger-text' : ''}>
            {formatRelativeTime(item.estimatedAt, now)}
          </strong>
        </div>
        <div>
          <span>Lý do</span>
          <strong>
            {isReview
              ? (item.reviewReasons[0] ?? 'Cần kiểm tra')
              : (item.priorityReasons[0] ?? item.riskMessage ?? '—')
            }
          </strong>
        </div>
        <div>
          {/* Risk badge rõ ràng */}
          <span>Nguy cơ</span>
          <strong>
            {isLate ? <span style={{ color: 'var(--rd)', fontWeight: 800 }}>🔴 Trễ hẹn</span>
              : isRisk ? <span style={{ color: '#b45309', fontWeight: 700 }}>⚠️ Rủi ro</span>
                : isReview ? <span style={{ color: 'var(--am)', fontWeight: 700 }}>🔎 Kiểm tra</span>
                  : <span style={{ color: 'var(--gn)' }}>✓ Đúng hẹn</span>
            }
          </strong>
        </div>
      </span>

      {/* Deadline */}
      <span className={`queue-deadline${deadlineDanger ? ' danger' : ''}`}>
        <span>Hẹn</span>
        <strong title={item.pickupAt ?? ''}>
          {formatRelativeTime(item.pickupAt, now)}
        </strong>
      </span>
    </button>
  );
}
