import { useApp } from '../context/AppContext';
import type { ModalOrderParams } from '../types';
import { filterOrders } from '../utils/orderSearch';
import OrderFilterBar from '../components/OrderFilterBar';

export default function QueuePage() {
  const { orders, openM, setOrderModalParams, orderSearch, orderFilter } = useApp();

  const openOrderModal = (params: ModalOrderParams) => {
    setOrderModalParams(params);
    openM('om');
  };

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
            {riskOrders.map(order => (
               <div key={order.id} className="orow risk" onClick={() => openOrderModal({ orderId: order.orderId, name: order.name, phone: order.phone, deadline: order.deadline, atRisk: true, svcType: order.service, isWaiting: order.isWaiting })}>
                <div className="opri rd">!</div>
                <div style={{ flex: 1 }}>
                  <div className="oname">{order.name}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--ts)', marginTop: 2 }}>
                    Chờ máy · {order.service === 'combo' ? 'Giặt + Sấy' : order.service === 'wash' ? 'Chỉ Giặt' : 'Chỉ Sấy'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--rd)' }}>Hẹn {order.deadline}</div>
                </div>
              </div>
            ))}
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
          {allPending.map(order => (
            <div
              key={order.id}
              className={`orow${order.atRisk ? ' risk' : ''}`}
               onClick={() => openOrderModal({ orderId: order.orderId, name: order.name, phone: order.phone, deadline: order.deadline, atRisk: order.atRisk, svcType: order.service, isWaiting: order.isWaiting })}
            >
              <div className={`opri ${order.atRisk ? 'rd' : order.chipLabel === 'Gửi thông báo' ? 'am' : order.priority === 1 ? 'bl' : order.priority === 2 ? 'am' : 'gr'}`}>
                {order.chipLabel === 'Gửi thông báo'
                  ? <svg className="icon icon-sm"><use href="#i-alert" /></svg>
                  : order.priority ?? ''}
              </div>
                <div style={{ flex: 1 }}>
                  <div className="oname">#{order.id} · {order.name}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--ts)', marginTop: 3 }}>
                    {order.phone} · {order.kg}kg · {order.service === 'combo' ? 'Giặt + Sấy' : order.service === 'wash' ? 'Chỉ Giặt' : 'Chỉ Sấy'} · {order.nextAction ?? (order.isWaiting ? 'Chờ máy' : 'Đang xử lý')}
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                  {order.chipLabel && <span className="chip" style={order.chipStyle}>{order.chipLabel}</span>}
                  {order.atRisk && <span className="chip rk">Nguy cơ trễ</span>}
                  {!order.chipLabel && order.isWaiting && <span className="chip wt">Chờ máy</span>}
                </div>
              </div>
                <div className="otime" style={{ textAlign: 'right' }}>
                  <div>{order.deadline || 'Chưa hẹn'}</div>
                  {order.estimatedAt && <div style={{ fontSize: '9.5px', marginTop: 2 }}>Dự kiến hoàn thành lúc {new Date(order.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>}
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
