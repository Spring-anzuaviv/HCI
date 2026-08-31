import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ModalOrderParams } from '../types';
import { filterOrders } from '../utils/orderSearch';
import OrderFilterBar from '../components/OrderFilterBar';

// ─── Hero SVG (washing machine illustration) ───
const HeroSVG = () => (
  <svg width="138" height="152" viewBox="0 0 138 152" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="26" width="124" height="118" rx="18" fill="white" stroke="#ddd6fe" strokeWidth="2"/>
    <rect x="7" y="26" width="124" height="38" rx="18" fill="#5b21b6"/>
    <rect x="7" y="46" width="124" height="18" fill="#5b21b6"/>
    <circle cx="43" cy="45" r="13" fill="#fbbf24"/><circle cx="43" cy="45" r="8" fill="#f59e0b"/><circle cx="43" cy="45" r="3" fill="#d97706"/>
    <rect x="70" y="36" width="12" height="12" rx="3.5" fill="#4ade80"/>
    <rect x="87" y="36" width="12" height="12" rx="3.5" fill="#ef4444"/>
    <rect x="70" y="52" width="12" height="8" rx="2.5" fill="#93c5fd"/>
    <rect x="87" y="52" width="12" height="8" rx="2.5" fill="#a78bfa"/>
    <circle cx="69" cy="106" r="40" fill="#ddd6fe"/>
    <circle cx="69" cy="106" r="33" fill="#6d28d9"/>
    <circle cx="69" cy="106" r="27" fill="#bfdbfe"/>
    <circle cx="69" cy="106" r="22" fill="#93c5fd"/>
    <ellipse cx="69" cy="116" rx="16" ry="7" fill="#3b82f6" opacity="0.45"/>
    <circle cx="56" cy="99" r="7" fill="white" opacity="0.82"/>
    <circle cx="78" cy="112" r="5" fill="white" opacity="0.72"/>
    <circle cx="64" cy="117" r="3.5" fill="white" opacity="0.62"/>
    <circle cx="81" cy="98" r="4" fill="white" opacity="0.55"/>
    <circle cx="57" cy="114" r="2.5" fill="white" opacity="0.5"/>
    <circle cx="97" cy="106" r="4.5" fill="#4c1d95"/>
    <rect x="20" y="141" width="20" height="11" rx="5.5" fill="#5b21b6"/>
    <rect x="98" y="141" width="20" height="11" rx="5.5" fill="#5b21b6"/>
  </svg>
);

export default function DashboardPage() {
  const { setCurrentPage, openM, orders, setOrderModalParams, orderSearch, orderFilter, queueSnapshot, operationsLoading } = useApp();
  const [shiftInfo, setShiftInfo] = useState({ name: '', timeRange: '', timeLeft: '', day: '' });

  // Tính thông tin ca làm việc
  useEffect(() => {
    const update = () => {
      const vnTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const day = dayNames[vnTime.getDay()];
      const hour = vnTime.getHours();
      const minute = vnTime.getMinutes();

      let name = '', timeRange = '', endHour = 0;
      if (hour >= 6 && hour < 14) { name = 'Ca sáng'; timeRange = '06:00 - 14:00'; endHour = 14; }
      else if (hour >= 14 && hour < 18) { name = 'Ca chiều'; timeRange = '14:00 - 18:00'; endHour = 18; }
      else if (hour >= 18 && hour < 22) { name = 'Ca tối'; timeRange = '18:00 - 22:00'; endHour = 22; }

      let timeLeft = '--';
      if (name) {
        const minsLeft = endHour * 60 - (hour * 60 + minute);
        const h = Math.floor(minsLeft / 60);
        const m = minsLeft % 60;
        timeLeft = `Còn ${h > 0 ? h + 'h ' : ''}${m}p trong ca`;
      }

      setShiftInfo({ name, timeRange, timeLeft, day });
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  const openOrderModal = (params: ModalOrderParams) => {
    setOrderModalParams({ ...params, readOnly: true });
    openM('om');
  };

  const visibleOrders = filterOrders(orders, orderSearch, orderFilter);
  const visibleIds = new Set(visibleOrders.map(order => order.orderId));
  const pendingOrders = (queueSnapshot?.items ?? [])
    .filter(item => visibleIds.has(item.orderId))
    .map(item => orders.find(order => order.orderId === item.orderId))
    .filter((order): order is NonNullable<typeof order> => Boolean(order));
  const riskOrders = (queueSnapshot?.items ?? [])
    .filter(item => visibleIds.has(item.orderId) && (item.riskLevel === 'AT_RISK' || item.riskLevel === 'NOT_FEASIBLE'));
  const suggestedOrder = queueSnapshot?.recommendation
    ? orders.find(order => order.orderId === queueSnapshot.recommendation?.orderId)
    : undefined;

  const stats = {
    today: orders.filter(o => o.status === 'pending').length + orders.filter(o => o.status === 'done').length,
    processing: orders.filter(o => o.status === 'pending').length,
    risk: riskOrders.length,
    done: orders.filter(o => o.status === 'done').length,
  };

  return (
    <div id="p-db" className="page on">
      {/* Hero */}
      <div className="hero">
        <div className="hero-txt">
          <h2 id="hero-greeting">
            {shiftInfo.name ? 'Chào bạn, bắt đầu ca làm việc thôi!' : 'Hết ca rồi, nghỉ ngơi thôi.'}
          </h2>
          <p>
            <span id="hero-shift">
              {shiftInfo.name
                ? `${shiftInfo.name} đang hoạt động · ${shiftInfo.timeRange} ${shiftInfo.day}`
                : `Ngoài giờ làm việc · ${shiftInfo.day}`}
            </span><br />
            Giặt Sấy Như Ý · 3 máy đang chạy
          </p>
          <div className="hero-meta">
            <span className="hm">
              <svg className="icon icon-sm"><use href="#i-clock" /></svg>
              <span id="hero-time-left">{shiftInfo.timeLeft}</span>
            </span>
            <span className="hm">
              <svg className="icon icon-sm"><use href="#i-alert" /></svg>
              {stats.risk} đơn nguy cơ trễ
            </span>
          </div>
        </div>
        <div className="hero-img"><HeroSVG /></div>
      </div>

      {/* Alert */}
      {riskOrders.length > 0 && (
        <div className="alert">
          <svg className="icon"><use href="#i-alert" /></svg>
          <div className="alert-txt"><strong>Cảnh báo:</strong> {riskOrders.length} đơn có nguy cơ không kịp giờ hẹn</div>
          <button className="alink" onClick={() => setCurrentPage('q')}>
            Xem ngay <svg className="icon icon-sm"><use href="#i-arrow-right" /></svg>
          </button>
        </div>
      )}

      <OrderFilterBar />

      {/* Stats */}
      <div className="srow">
        <div className="scard pur"><div className="snum">{stats.today}</div><div className="slbl">Đơn hôm nay</div></div>
        <div className="scard"><div className="snum">{stats.processing}</div><div className="slbl">Đang xử lý</div></div>
        <div className="scard red"><div className="snum">{stats.risk}</div><div className="slbl">Nguy cơ trễ</div></div>
        <div className="scard grn"><div className="snum">{stats.done}</div><div className="slbl">Hoàn tất</div></div>
      </div>

      {/* Queue card */}
      <div className="crow">
        <div className="card" style={{ flex: 1.45 }}>
          <div className="ch">
            <div className="ctitle">
              <div className="cico"><svg className="icon icon-sm"><use href="#i-layers" /></svg></div>
              Hàng đợi thông minh
            </div>
            <button className="clink" onClick={() => setCurrentPage('q')}>
              Xem tất cả <svg className="icon icon-sm"><use href="#i-chevron-right" /></svg>
            </button>
          </div>

          {/* Đề xuất xử lý tiếp */}
           {operationsLoading ? <div style={{ color: 'var(--ts)', fontSize: 12, padding: 10 }}>Đang tải đề xuất từ schedule hiện tại...</div> : suggestedOrder ? <div className="sugg">
            <div className="sugg-lbl">
              <svg className="icon icon-sm"><use href="#i-cpu" /></svg> Đề xuất xử lý tiếp
            </div>
            <div className="sugg-row">
               <div className="sugg-n">#{suggestedOrder.id}</div>
              <div className="sugg-info">
                 <div className="sugg-name">{suggestedOrder.name}</div>
                 <div className="sugg-meta">{suggestedOrder.kg}kg · Hẹn {suggestedOrder.deadline || 'chưa có'} · {suggestedOrder.isWaiting ? 'Chờ máy' : 'Đang xử lý'}</div>
              </div>
                <button className="bp" onClick={() => openOrderModal({ orderId: suggestedOrder.orderId, name: suggestedOrder.name, phone: suggestedOrder.phone, deadline: suggestedOrder.deadline, atRisk: suggestedOrder.atRisk, svcType: suggestedOrder.service, isWaiting: suggestedOrder.isWaiting })}>
                Xem đơn <svg className="icon icon-sm"><use href="#i-arrow-right" /></svg>
              </button>
            </div></div> : <div style={{ color: 'var(--ts)', fontSize: 12, padding: 10 }}>Không có order phù hợp với bộ lọc hiện tại</div>}
           {/* Order list (top 5) */}
          <div className="olist">
            {pendingOrders.slice(0, 5).map(order => (
              <div
                key={order.id}
                className={`orow${order.atRisk ? ' risk' : ''}`}
                 onClick={() => openOrderModal({
                   orderId: order.orderId,
                   name: order.name,
                   phone: order.phone,
                  deadline: order.deadline,
                  atRisk: order.atRisk,
                  svcType: order.service,
                  isWaiting: order.isWaiting,
                })}
              >
                <div className={`opri ${order.atRisk ? 'rd' : order.priority === 1 ? 'bl' : order.priority === 2 ? 'am' : 'gr'}`}>
                  {order.chipLabel === 'Gửi thông báo'
                    ? <svg className="icon icon-sm"><use href="#i-alert" /></svg>
                    : order.priority ?? ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="oname">#{order.id} · {order.name}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--ts)', marginTop: 3 }}>
                    {order.kg}kg · {order.service === 'combo' ? 'Giặt + Sấy' : order.service === 'wash' ? 'Chỉ Giặt' : 'Chỉ Sấy'} · {order.nextAction ?? (order.isWaiting ? 'Chờ máy' : 'Đang xử lý')}
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                    {order.chipLabel && (
                      <span className="chip" style={order.chipStyle}>{order.chipLabel}</span>
                    )}
                    {order.atRisk && <span className="chip rk">Nguy cơ trễ</span>}
                  </div>
                </div>
                <div className="otime" style={{ textAlign: 'right' }}>
                  <div>{order.deadline || 'Chưa hẹn'}</div>
                  {order.estimatedAt && <div style={{ fontSize: '9.5px', marginTop: 2 }}>ETA {new Date(order.estimatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
