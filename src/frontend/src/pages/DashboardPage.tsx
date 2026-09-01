import { useDeferredValue, useEffect, useState } from 'react';
import { useApp } from '../context/useApp';
import type { ModalOrderParams } from '../types';
import { filterOrders } from '../utils/orderSearch';
import OrderFilterBar from '../components/OrderFilterBar';
import { QueueRow } from './OperationsQueuePage';
import { AlertTriangle, ArrowRight, ChevronRight, Clock3, Layers3 } from 'lucide-react';

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

function currentVietnameseTime() {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

export default function DashboardPage() {
  const { setCurrentPage, openM, orders, setOrderModalParams, orderSearch, orderFilter, shiftSummary, queueSnapshot, operationsLoading } = useApp();
  const deferredOrderSearch = useDeferredValue(orderSearch);
  const [shiftInfo, setShiftInfo] = useState({ name: '', timeRange: '', timeLeft: `Hiện tại ${currentVietnameseTime()}`, day: '' });
  const [now, setNow] = useState(() => Date.now());

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

       let timeLeft = `Hiện tại ${currentVietnameseTime()}`;
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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const openOrderModal = (params: ModalOrderParams) => {
    setOrderModalParams(params);
    openM('om');
  };

  const queueModalParams = (item: NonNullable<typeof queueSnapshot>['items'][number], openExpedite = false): ModalOrderParams => {
    const order = orders.find(value => value.orderId === item.orderId);
    return {
      orderId: item.orderId,
      name: item.customer?.name ?? `Đơn #${item.orderId}`,
      phone: item.customer?.phone,
      deadline: item.pickupAt ? new Date(item.pickupAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      atRisk: item.riskLevel === 'AT_RISK' || item.riskLevel === 'NOT_FEASIBLE',
      svcType: order?.service ?? (item.serviceType === 'WASH_DRY' ? 'combo' : item.serviceType === 'DRY' ? 'dry' : 'wash'),
      isWaiting: item.status === 'WAITING',
      recommendedMachineId: item.machineId,
      openExpedite,
    };
  };

  const visibleOrders = filterOrders(orders, deferredOrderSearch, orderFilter);
  const visibleIds = new Set(visibleOrders.map(order => order.orderId));
  const topQueueItems = (queueSnapshot?.items ?? [])
    .filter(item => visibleIds.has(item.orderId))
    .slice(0, 5);
  const lateOrders = (queueSnapshot?.items ?? [])
    .filter(item => visibleIds.has(item.orderId) && item.riskLevel === 'NOT_FEASIBLE');
  const riskOrders = (queueSnapshot?.items ?? [])
    .filter(item => visibleIds.has(item.orderId) && item.riskLevel === 'AT_RISK');
  const attentionOrders = [...lateOrders, ...riskOrders];
  const stats = {
    today: orders.filter(o => o.status === 'pending').length + orders.filter(o => o.status === 'done').length,
    processing: orders.filter(o => o.status === 'pending').length,
    late: lateOrders.length,
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
            </span>
          </p>
          <div className="hero-meta">
            <span className="hm">
               <Clock3 className="icon icon-sm" aria-hidden="true" />
              <span id="hero-time-left">{shiftInfo.timeLeft}</span>
            </span>
          </div>
          {shiftSummary && <div className="hero-handover">
            <strong>Tóm tắt ca:</strong> {shiftSummary.totals.active} đang xử lý · {shiftSummary.totals.completed} hoàn tất · {queueSnapshot?.summary.lateOrders ?? 0} sẽ trễ · {queueSnapshot?.summary.atRiskOrders ?? 0} nguy cơ trễ
          </div>}
        </div>
        <div className="hero-img"><HeroSVG /></div>
      </div>

      {/* Alert */}
      {(lateOrders.length > 0 || riskOrders.length > 0) && (
        <div className="alert">
           <AlertTriangle className="icon" aria-hidden="true" />
          <div className="alert-txt">
            <strong>Cảnh báo:</strong> {lateOrders.length > 0 ? `${lateOrders.length} đơn sẽ trễ hẹn` : ''} 
            {lateOrders.length > 0 && riskOrders.length > 0 ? ' và ' : ''}
            {riskOrders.length > 0 ? `${riskOrders.length} đơn có nguy cơ không kịp giờ hẹn` : ''}
          </div>
          <button className="alink" onClick={() => setCurrentPage('q')}>
             Xem ngay <ArrowRight className="icon icon-sm" aria-hidden="true" />
          </button>
        </div>
      )}

      {attentionOrders.length > 0 && (
        <div className="card oq-risk-card">
          <div className="ctitle oq-reference-title danger">
            <div className="cico"><AlertTriangle className="icon icon-sm" aria-hidden="true" /></div>
            Đơn có nguy cơ trễ hẹn
          </div>
          <div className="olist">
            {attentionOrders.map(item => <QueueRow key={item.orderId} item={item} now={now} onOpen={() => openOrderModal(queueModalParams(item))} onExpedite={() => openOrderModal(queueModalParams(item, true))} />)}
          </div>
        </div>
      )}

      <OrderFilterBar />

      {/* Stats */}
      <div className="srow" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="scard pur"><div className="snum">{stats.today}</div><div className="slbl">Đơn hôm nay</div></div>
        <div className="scard"><div className="snum">{stats.processing}</div><div className="slbl">Đang xử lý</div></div>
        <div className="scard red"><div className="snum">{stats.late}</div><div className="slbl">Sẽ trễ hẹn</div></div>
        <div className="scard warning" style={{ borderLeft: '4px solid #b45309', background: '#fef3c7' }}>
          <div className="snum" style={{ color: '#b45309' }}>{stats.risk}</div><div className="slbl" style={{ color: '#92400e' }}>Nguy cơ trễ</div>
        </div>
        <div className="scard grn"><div className="snum">{stats.done}</div><div className="slbl">Hoàn tất</div></div>
      </div>

      {/* Queue card */}
      <div className="crow">
        <div className="card" style={{ flex: 1.45 }}>
          <div className="ch">
            <div className="ctitle">
               <div className="cico"><Layers3 className="icon icon-sm" aria-hidden="true" /></div>
              Hàng đợi thông minh
            </div>
            <button className="clink" onClick={() => setCurrentPage('q')}>
               Xem tất cả <ChevronRight className="icon icon-sm" aria-hidden="true" />
            </button>
          </div>

           {operationsLoading ? <div style={{ color: 'var(--ts)', fontSize: 12, padding: 10 }}>Đang tải hàng đợi...</div> : topQueueItems.length === 0 ? <div style={{ color: 'var(--ts)', fontSize: 12, padding: 10 }}>Không có đơn phù hợp với bộ lọc hiện tại</div> : <div className="olist">
              {topQueueItems.map(item => <QueueRow key={item.orderId} item={item} now={now} onOpen={() => openOrderModal(queueModalParams(item))} onExpedite={() => openOrderModal(queueModalParams(item, true))} />)}
           </div>}
        </div>
      </div>
    </div>
  );
}
