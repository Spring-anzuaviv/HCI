import { useApp } from '../context/AppContext';
import type { ModalOrderParams, QueueItem } from '../types';
import { filterOrders } from '../utils/orderSearch';

const SERVICE_LABELS: Record<string, string> = {
  WASH: 'Chỉ giặt',
  DRY: 'Chỉ sấy',
  WASH_DRY: 'Giặt + Sấy',
};

const STAGE_LABELS: Record<string, string> = {
  SORTING: 'Phân loại',
  WASH: 'Giặt',
  TRANSFER: 'Chuyển đồ',
  DRY: 'Sấy',
  PACKING: 'Đóng gói',
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Đã tiếp nhận',
  WAITING: 'Đang chờ',
  WASHING: 'Đang giặt',
  DRYING: 'Đang sấy',
  FOLDING_PACKING: 'Đang đóng gói',
  READY: 'Sẵn sàng',
  NOTIFIED: 'Đã thông báo',
};

export default function OperationsQueuePage() {
  const {
    orders, openM, setOrderModalParams, orderSearch, orderFilter,
    queueSnapshot, operationsLoading, operationsError, refreshOperations,
  } = useApp();

  const openOrderModal = (item: QueueItem) => {
    const mappedOrder = orders.find(order => order.orderId === item.orderId);
    const params: ModalOrderParams = {
      orderId: item.orderId,
      name: item.customer?.name ?? `Order #${item.orderId}`,
      phone: item.customer?.phone,
      deadline: formatTime(item.pickupAt, ''),
      atRisk: item.riskLevel === 'AT_RISK' || item.riskLevel === 'NOT_FEASIBLE',
      svcType: mappedOrder?.service ?? (item.serviceType === 'WASH_DRY' ? 'combo' : item.serviceType === 'DRY' ? 'dry' : 'wash'),
      isWaiting: item.status === 'WAITING',
      readOnly: true,
    };
    setOrderModalParams(params);
    openM('om');
  };

  const visibleOrderIds = new Set(
    filterOrders(orders, orderSearch, orderFilter).map(order => order.orderId),
  );
  const allItems = queueSnapshot?.items ?? [];
  const visibleItems = allItems.filter(item => visibleOrderIds.has(item.orderId));
  const riskItems = visibleItems.filter(isAtRisk);
  const reviewItems = visibleItems.filter(item => item.operationalState === 'NEEDS_REVIEW');
  const suggestion = queueSnapshot?.recommendation && visibleOrderIds.has(queueSnapshot.recommendation.orderId)
    ? queueSnapshot.recommendation
    : null;

  return (
    <div id="p-q" className="page">

      <div className="hero hero-sub">
        <div className="hero-txt">
          <h2>Hàng đợi công việc thông minh</h2>
          <p style={{ marginBottom: 0 }}>
            Theo dõi máy, công đoạn, deadline và việc nên làm tiếp trên cùng một màn hình.
            Đề xuất luôn cần nhân viên kiểm tra trước khi thực hiện.
          </p>
        </div>
        <div className="hero-img">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <circle cx="40" cy="40" r="35" fill="rgba(255,255,255,0.2)" />
            <g transform="translate(18,18)" color="var(--tx)">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
              </svg>
            </g>
          </svg>
        </div>
      </div>

      {operationsLoading && (
        <OperationState title="Đang tải trạng thái vận hành..." detail="Hệ thống đang đọc máy, công đoạn và deadline hiện tại." />
      )}

      {!operationsLoading && operationsError && (
        <div className="card operations-state error" role="alert">
          <strong>Không thể tải hàng đợi</strong>
          <span>{operationsError}</span>
          <button className="bs" onClick={() => void refreshOperations()}>Thử lại</button>
        </div>
      )}

      {!operationsLoading && !operationsError && allItems.length === 0 && (
        <OperationState title="Hiện không có đơn cần xử lý." detail="Trạng thái máy vẫn được hiển thị ở bảng vận hành bên phải." />
      )}

      {!operationsLoading && !operationsError && queueSnapshot && allItems.length > 0 && (
        <div className="queue-status-summary" aria-label="Phân loại đơn theo trạng thái">
          {Object.entries(queueSnapshot.summary.statusCounts).map(([status, count]) => (
            <span key={status}><strong>{count}</strong>{ORDER_STATUS_LABELS[status] ?? status}</span>
          ))}
        </div>
      )}

      {!operationsLoading && !operationsError && suggestion && (
        <RecommendationCard item={suggestion} onOpen={() => openOrderModal(suggestion)} />
      )}

      {!operationsLoading && !operationsError && allItems.length > 0 && !suggestion && (
        <div className="card no-recommendation" role="status">
          <svg className="icon icon-sm"><use href="#i-info" /></svg>
          <span>{queueSnapshot?.summary.availableMachines === 0
            ? 'Hiện không có máy trống. Cảnh báo và toàn bộ hàng đợi vẫn được cập nhật bên dưới.'
            : 'Có máy trống nhưng chưa có công đoạn đã lập lịch nào đủ điều kiện để đề xuất.'}</span>
        </div>
      )}

      {reviewItems.length > 0 && (
        <QueueSection title="Trạng thái cần kiểm tra" tone="review">
          {reviewItems.map(item => (
            <QueueRow key={item.orderId} item={item} onOpen={() => openOrderModal(item)} compactMessage={item.reviewReasons.join(' · ')} />
          ))}
        </QueueSection>
      )}

      {riskItems.length > 0 && (
        <QueueSection title="Đơn có nguy cơ trễ hẹn" tone="risk">
          {riskItems.map(item => (
            <QueueRow key={item.orderId} item={item} onOpen={() => openOrderModal(item)} compactMessage={item.riskMessage} />
          ))}
        </QueueSection>
      )}

      {!operationsLoading && !operationsError && allItems.length > 0 && (
        <div className="card">
          <div className="ch">
            <div className="ctitle">
              <div className="cico"><svg className="icon icon-sm"><use href="#i-list" /></svg></div>
              Toàn bộ hàng đợi · {visibleItems.length} đơn
            </div>
            {queueSnapshot && <span className="queue-updated">Cập nhật {formatTime(queueSnapshot.generatedAt)}</span>}
          </div>
          <div className="olist">
            {visibleItems.map(item => (
              <QueueRow key={item.orderId} item={item} onOpen={() => openOrderModal(item)} />
            ))}
          </div>
          {visibleItems.length === 0 && (
            <div className="queue-no-results">Không tìm thấy order phù hợp với tìm kiếm hoặc bộ lọc.</div>
          )}
        </div>
      )}
    </div>
  );
}

function OperationState({ title, detail }: { title: string; detail: string }) {
  return <div className="card operations-state" role="status" aria-live="polite">
    <strong>{title}</strong>
    <span>{detail}</span>
  </div>;
}

function RecommendationCard({ item, onOpen }: { item: QueueItem; onOpen: () => void }) {
  return <div className="card">
    <div className="sugg-lbl" style={{ fontSize: '10.5px', marginBottom: 11 }}>
      <svg className="icon icon-sm"><use href="#i-cpu" /></svg> Đề xuất xử lý tiếp
    </div>
    <div className="recommendation-card">
      <div className="recommendation-order">#{item.orderId}</div>
      <div style={{ flex: 1 }}>
        <div className="recommendation-name">{item.customer?.name ?? 'Chưa có tên khách'}</div>
        <div className="recommendation-meta">
          <svg className="icon icon-sm"><use href="#i-phone" /></svg>
          {item.customer?.phone ?? 'Thiếu số điện thoại'} · Hẹn {formatTime(item.pickupAt)} · {item.weightKg}kg
        </div>
        <div className="recommendation-reasons">
          {item.priorityReasons.map(reason => <span key={reason}><svg className="icon icon-sm"><use href="#i-info" /></svg>{reason}</span>)}
        </div>
        <div className="recommendation-confirmation">
          {item.machineName} · {stageLabel(item.nextStage)} · Cần nhân viên kiểm tra và xác nhận
        </div>
      </div>
      <button className="bp" onClick={onOpen}>Xem đơn <svg className="icon icon-sm"><use href="#i-arrow-right" /></svg></button>
    </div>
  </div>;
}

function QueueSection({ title, tone, children }: { title: string; tone: 'risk' | 'review'; children: React.ReactNode }) {
  const color = tone === 'risk' ? 'var(--rd)' : '#92400e';
  const background = tone === 'risk' ? '#fee2e2' : '#fef3c7';
  return <div className={`card queue-section ${tone}`}>
    <div className="ch"><div className="ctitle" style={{ color }}>
      <div className="cico" style={{ color, background }}><svg className="icon icon-sm"><use href="#i-alert" /></svg></div>
      {title}
    </div></div>
    <div className="olist">{children}</div>
  </div>;
}

function QueueRow({ item, onOpen, compactMessage }: { item: QueueItem; onOpen: () => void; compactMessage?: string }) {
  const risky = isAtRisk(item);
  const review = item.operationalState === 'NEEDS_REVIEW';
  return <button className={`orow queue-row${risky ? ' risk' : ''}${review ? ' review' : ''}`} onClick={onOpen}>
    <span className={`opri ${review ? 'am' : risky ? 'rd' : item.rank === 1 ? 'bl' : 'gr'}`}>{review ? '!' : item.rank}</span>
    <span className="queue-row-main">
      <span className="oname">#{item.orderId} · {item.customer?.name ?? 'Chưa có tên khách'}</span>
      <span className="queue-detail">{compactMessage ?? `${item.customer?.phone ?? 'Thiếu số điện thoại'} · ${item.weightKg}kg · ${SERVICE_LABELS[item.serviceType] ?? item.serviceType} · ${item.status}`}</span>
      {!compactMessage && <span className="queue-detail"><strong>Hiện tại:</strong> {stageLabel(item.currentStage)} · <strong>Tiếp theo:</strong> {item.nextAction}</span>}
      <span className="queue-chips">
        {item.machineName && <span className="chip w">{item.machineName} · {stageLabel(item.nextStage)}</span>}
        {risky && <span className="chip rk">{item.riskMessage}</span>}
        {item.riskLevel === 'UNKNOWN' && item.missingFields.map(field => <span key={field} className="chip missing">Thiếu {field}</span>)}
        {review && <span className="chip review-chip">Trạng thái cần kiểm tra · Không dùng để đề xuất</span>}
      </span>
    </span>
    <span className="otime queue-times">
      <span>Hẹn {formatTime(item.pickupAt)}</span>
      <span>ETA {formatTime(item.estimatedAt)}</span>
    </span>
  </button>;
}

function stageLabel(value: string | null) {
  return value ? STAGE_LABELS[value] ?? value : 'Chưa xác định';
}

function formatTime(value: string | null, fallback = 'Chưa có') {
  return value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : fallback;
}

function isAtRisk(item: QueueItem) {
  return item.riskLevel === 'AT_RISK' || item.riskLevel === 'NOT_FEASIBLE';
}
