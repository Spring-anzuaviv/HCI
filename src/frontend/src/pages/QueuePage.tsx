import { useApp } from '../context/AppContext';
import type { ModalOrderParams, Order } from '../types';
import { filterOrders } from '../utils/orderSearch';
import OrderFilterBar from '../components/OrderFilterBar';

const STAGE_LABELS: Record<string, string> = {
  RECEIVED: 'Tiếp nhận', SORTING: 'Phân loại', WASHING: 'Đang giặt', WASH: 'Đang giặt',
  TRANSFER: 'Chuyển đồ', DRYING: 'Đang sấy', DRY: 'Đang sấy', FOLDING_PACKING: 'Gấp & đóng gói',
  PACKING: 'Đóng gói', READY: 'Chờ thông báo', NOTIFIED: 'Chờ bàn giao', COMPLETED: 'Hoàn tất',
};

function stageLabel(stage?: string | null) {
  return stage ? STAGE_LABELS[stage] ?? stage : 'Chưa xác định';
}

function formatTime(value?: string | null) {
  return value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa có';
}

export function QueueOrderRow({ order, onOpen }: { order: Order; onOpen: (order: Order) => void }) {
  const stages = order.stages ?? [];
  const currentIndex = stages.findIndex(stage => stage.status === 'RUNNING');
  const firstOpenIndex = stages.findIndex(stage => stage.status !== 'COMPLETED');
  const activeIndex = currentIndex >= 0 ? currentIndex : firstOpenIndex;
  const currentStage = order.isWaiting && currentIndex < 0 ? 'Chờ máy' : stageLabel(stages[activeIndex]?.stage ?? order.currentStage);
  const nextStage = stages.slice(Math.max(activeIndex + 1, 0)).find(stage => stage.status !== 'COMPLETED');
  const nextAction = order.isWaiting && !nextStage ? 'Chọn máy phù hợp' : order.nextAction ?? stageLabel(nextStage?.stage);
  const nextActionTime = nextStage?.plannedStartAt ?? stages[activeIndex]?.plannedStartAt;
  const serviceLabel = order.service === 'combo' ? 'Giặt + Sấy' : order.service === 'wash' ? 'Chỉ giặt' : 'Chỉ sấy';

  return <div className={`queue-row${order.atRisk ? ' risk' : ''}`} onClick={() => onOpen(order)}>
    <div className={`queue-priority ${order.atRisk ? 'rd' : order.priority === 1 ? 'bl' : order.priority === 2 ? 'am' : 'gr'}`}>
      {order.atRisk ? '!' : order.priority ?? ''}
    </div>
    <div className="queue-order">
      <strong>#{order.id} · {order.name}</strong>
      <span>{serviceLabel} · {order.kg}kg</span>
    </div>
    <div className="queue-facts">
      <div><span>Đang làm</span><strong>{currentStage}{order.currentMachine?.name ? ` · ${order.currentMachine.name}` : ''}</strong></div>
      <div><span>Sắp làm</span><strong>{stageLabel(nextStage?.stage) === 'Chưa xác định' ? 'Không còn' : stageLabel(nextStage?.stage)}</strong></div>
      <div><span>Dự kiến xong</span><strong>{order.groupCode ? <><small className="queue-eta-line">Mẻ này: {formatTime(order.estimatedAt)}</small><small className="queue-eta-line queue-group-eta">Cả nhóm: {formatTime(order.groupETA ?? order.estimatedAt)}</small></> : formatTime(order.estimatedAt)}</strong></div>
      <div><span>Hành động tiếp theo</span><strong>{nextAction} <em>{formatTime(nextActionTime)}</em></strong></div>
    </div>
    <div className={`queue-deadline${order.atRisk ? ' danger' : ''}`}><span>Hẹn lấy</span><strong>{order.deadline || 'Chưa hẹn'}</strong></div>
  </div>;
}

export default function QueuePage() {
  const { orders, openM, setOrderModalParams, orderSearch, orderFilter } = useApp();

  const openOrderModal = (params: ModalOrderParams) => {
    setOrderModalParams(params);
    openM('om');
  };
  const openOrderForRow = (order: Order) => openOrderModal({ orderId: order.orderId, name: order.name, phone: order.phone, deadline: order.deadline, atRisk: order.atRisk, svcType: order.service, isWaiting: order.isWaiting });

  const visibleOrders = filterOrders(orders, orderSearch, orderFilter);
  const riskOrders = visibleOrders.filter(o => o.atRisk && o.status === 'pending');
  const allPending = visibleOrders.filter(o => o.status === 'pending');
  const suggestedOrder = allPending[0];

  return (
    <div id="p-q" className="page">
      <OrderFilterBar />
      {/* Hero */}
      <div className="hero hero-sub">
        <div className="hero-txt">
          <h2>Hàng đợi công việc thông minh</h2>
          <p style={{ marginBottom: 0 }}>
            Hệ thống đề xuất thứ tự xử lý và giúp nhân viên ca sau nắm toàn bộ ngữ cảnh để bắt đầu ngay.
            Bạn có thể điều chỉnh bất kỳ lúc nào.
          </p>
        </div>
        <div className="hero-img">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="35" fill="rgba(255,255,255,0.2)"/>
            <g transform="translate(18,18)" color="var(--tx)">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            </g>
          </svg>
        </div>
      </div>

      {/* Recommendation preview */}
      {suggestedOrder && <div className="card">
        <div className="sugg-lbl" style={{ fontSize: '10.5px', marginBottom: 11 }}>
           <svg className="icon icon-sm"><use href="#i-cpu" /></svg> Đề xuất xử lý tiếp
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 15, background: 'linear-gradient(135deg,#f0ebff,#ede9fe)', borderRadius: 13, border: '1.5px solid #c4b5fd' }}>
           <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--pu)', lineHeight: 1 }}>#{suggestedOrder.id}</div>
           <div style={{ flex: 1 }}>
             <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--tx)' }}>{suggestedOrder.name}</div>
             <div style={{ fontSize: '11.5px', color: 'var(--ts)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
               <svg className="icon icon-sm" style={{ color: 'var(--tl)' }}><use href="#i-phone" /></svg>
               {suggestedOrder.phone} · Hẹn {suggestedOrder.deadline || 'chưa có'} · {suggestedOrder.kg}kg · {suggestedOrder.isWaiting ? 'Chờ máy' : 'Đang xử lý'}
             </div>
             <div style={{ fontSize: '11.5px', color: 'var(--pu)', fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
               <svg className="icon icon-sm"><use href="#i-info" /></svg>
               Lý do: {suggestedOrder.priorityReason ?? 'Theo schedule hiện tại'} · {suggestedOrder.nextAction ?? 'Kiểm tra công đoạn tiếp theo'}
             </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
             <button className="bp" onClick={() => openOrderModal({ orderId: suggestedOrder.orderId, name: suggestedOrder.name, phone: suggestedOrder.phone, deadline: suggestedOrder.deadline, atRisk: suggestedOrder.atRisk, svcType: suggestedOrder.service, isWaiting: suggestedOrder.isWaiting })}>
              Xử lý đơn này <svg className="icon icon-sm"><use href="#i-arrow-right" /></svg>
            </button>
          </div>
        </div>
      </div>}

      {/* At-risk orders */}
      {riskOrders.length > 0 && (
        <div className="card" style={{ borderLeft: '3px solid var(--rd)' }}>
          <div className="ch">
            <div className="ctitle" style={{ color: 'var(--rd)' }}>
              <div className="cico" style={{ background: '#fee2e2', color: 'var(--rd)' }}>
                <svg className="icon icon-sm"><use href="#i-alert" /></svg>
              </div>
              Đơn có nguy cơ trễ hẹn
            </div>
          </div>
          <div className="olist">
             {riskOrders.map(order => <QueueOrderRow key={order.id} order={order} onOpen={openOrderForRow} />)}
          </div>
        </div>
      )}

      {/* Full queue */}
      <div className="card">
        <div className="ch">
          <div className="ctitle">
            <div className="cico"><svg className="icon icon-sm"><use href="#i-list" /></svg></div>
            Toàn bộ hàng đợi · {allPending.length} đơn
          </div>
        </div>
        <div className="olist">
           {allPending.map(order => <QueueOrderRow key={order.id} order={order} onOpen={openOrderForRow} />)}
        </div>
      </div>
    </div>
  );
}
