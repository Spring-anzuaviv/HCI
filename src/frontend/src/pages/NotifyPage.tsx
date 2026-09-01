/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useDeferredValue, useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/useApp';
import { Check, LoaderCircle, MessageSquare, Phone, Send } from 'lucide-react';
import { pendingNotifications, sendNotification, notifiedNotifications, completeOrder } from '../api/notifications';
import { useKeyedAsyncAction } from '../hooks/useAsyncAction';
interface NotifyCard {
  id: string;
  initials: string;
  name: string;
  phone: string;
  completedAt: string;
  message: string;
  sent: boolean;
  bgColor: string;
  groupCode: string | null;
  groupCount: number;
  orderIds: number[];
}

const cardGroupKey = (card: NotifyCard) => card.groupCode ?? `order-${card.id}`;

export default function NotifyPage() {
  const { showToast, store, orderSearch, orders, refreshOperations } = useApp();
  const deferredOrderSearch = useDeferredValue(orderSearch);

  const [loading, setLoading] = useState(true);
  const [pendingCards, setPendingCards] = useState<NotifyCard[]>([]);
  const [notifiedList, setNotifiedList] = useState<NotifyCard[]>([]);
  const { isPending: isActionPending, run: runNotificationAction } = useKeyedAsyncAction();

  const processingList = useMemo(() => {
    return orders
      .filter(o => {
        const raw = o.rawStatus ?? (o.status === 'done' ? 'COMPLETED' : 'WAITING');
        if (['COMPLETED', 'NOTIFIED', 'CANCELLED'].includes(raw)) return false;
        if (raw === 'READY') {
          // Nếu đã READY nhưng chưa được hiện ở mục Cần thông báo (do chờ group)
          const inPending = pendingCards.some(pc =>
            pc.id === o.id || Boolean(o.groupCode && pc.groupCode === o.groupCode),
          );
          return !inPending;
        }
        return true;
      })
      .map(o => {
        const words = (o.name || 'Khách').trim().split(' ');
        const initials = words.length >= 2
          ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
          : (o.name || 'KH').substring(0, 2).toUpperCase();
        
        const raw = o.rawStatus ?? (o.status === 'done' ? 'COMPLETED' : 'WAITING');
        const displayStatus = raw === 'READY' 
          ? 'Đã xong, chờ mẻ khác'
          : o.service === 'combo' ? 'Giặt + Sấy' : o.service === 'wash' ? 'Chỉ giặt' : 'Chỉ sấy';

        return {
          id: o.id,
          initials,
          name: o.name,
          status: displayStatus
        };
      });
  }, [orders, pendingCards]);

  // Luồng 3 – lấy card đã được backend gộp theo groupCode.
  const loadNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      if (!store) return;
      const [pendingOrders, notifiedOrders] = await Promise.all([
        pendingNotifications(store.storeId),
        notifiedNotifications(store.storeId),
      ]);

      const mapToCard = (order: any): NotifyCard => {
        const name: string = order.customer?.name ?? 'Khách hàng';
        const phone: string = order.customer?.phone ?? '';
        const words = name.trim().split(' ');
        const initials = words.length >= 2
          ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
          : name.substring(0, 2).toUpperCase();
        const readyTime = order.readyAt
          ? new Date(order.readyAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          : '--:--';

        return {
          id: String(order.orderId),
          initials,
          name,
          phone,
          completedAt: readyTime,
          message: order.notificationPreview?.content ?? '',
          sent: order.status === 'NOTIFIED',
          bgColor: order.serviceType === 'WASH_DRY' ? 'var(--pu)'
            : order.serviceType === 'WASH' ? 'var(--bl)'
            : 'var(--am)',
          groupCode: order.groupCode ?? null,
          groupCount: Number(order.groupCount ?? 1),
          orderIds: Array.isArray(order.orderIds) ? order.orderIds.map(Number) : [Number(order.orderId)],
        };
      };

      setPendingCards(pendingOrders.map(mapToCard));
      setNotifiedList(notifiedOrders.map(mapToCard));
    } catch (err) {
      console.error('[Luồng 3] Lỗi khi tải thông báo:', err);
      if (showLoading) showToast('Không tải được danh sách thông báo. Kiểm tra Backend đang chạy chưa.', 'red');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [store, showToast]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void Promise.all([loadNotifications(true), refreshOperations()]);
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadNotifications, refreshOperations]);

  // Bấm nút Gửi Zalo
  const sendNotify = async (card: NotifyCard) => runNotificationAction(`notify-send:${cardGroupKey(card)}`, async () => {
    try {
      const content = card.message || (card.groupCount > 1
        ? `Chào ${card.name}, cả ${card.groupCount} mẻ đồ của bạn đã sẵn sàng, vui lòng đến nhận!`
        : `Chào ${card.name}, đồ của bạn đã sẵn sàng, vui lòng đến nhận!`);

      // Mở tab ngay trong user gesture để trình duyệt không chặn popup.
      const phoneClean = card.phone.replace(/\s/g, '');
      window.open(`https://zalo.me/${phoneClean}`, '_blank', 'noopener,noreferrer');
      try { await navigator.clipboard.writeText(content); } catch { /* clipboard unavailable */ }

      // GỌI API CẬP NHẬT TRẠNG THÁI TRONG DATABASE
      await sendNotification(Number(card.id));

      showToast(`Đã copy nội dung & Mở Zalo cho ${card.name}`, 'grn');

      // Cập nhật ngay một card đại diện; đồng bộ lại context ở nền để không giữ trạng thái READY cũ.
      setPendingCards(prev => prev.filter(c => cardGroupKey(c) !== cardGroupKey(card)));
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setNotifiedList(prev => [
        ...prev.filter(c => cardGroupKey(c) !== cardGroupKey(card)),
        { ...card, message: content, sent: true, completedAt: timeStr },
      ]);
      void Promise.all([refreshOperations(), loadNotifications(false)]);
    } catch (err) {
      console.error('[Luồng 3] Lỗi khi gửi thông báo:', err);
      showToast('Có lỗi khi chuẩn bị nội dung thông báo', 'red');
    }
  });

  // Bấm nút Đã giao đồ
  const completeNotify = async (card: NotifyCard) => runNotificationAction(`notify-complete:${cardGroupKey(card)}`, async () => {
    try {
      await completeOrder(Number(card.id));
      showToast(card.groupCount > 1
        ? `Đã hoàn tất ${card.groupCount} mẻ trong đơn của ${card.name}`
        : `Đã hoàn tất đơn hàng cho ${card.name}`, 'grn');
      setNotifiedList(prev => prev.filter(c => cardGroupKey(c) !== cardGroupKey(card)));
      void Promise.all([refreshOperations(), loadNotifications(false)]);
    } catch (err) {
      console.error('Lỗi khi hoàn tất đơn hàng:', err);
      showToast('Không thể hoàn tất đơn hàng. Vui lòng thử lại.', 'red');
    }
  });

  return (
    <div id="p-n" className="page">
      {/* Hero */}
      <div className="hero hero-sub">
        <div className="hero-txt">
          <h2>Cập nhật tiến trình &amp; Thông báo khách</h2>
          <p style={{ marginBottom: 0 }}>
            Hệ thống tự động tải danh sách đơn hoàn tất từ server. Bấm Gửi — hệ thống copy nội dung và mở Zalo cho bạn.
          </p>
        </div>
        <div className="hero-img">
          <Send width={80} height={80} color="var(--tx)" aria-hidden="true" />
        </div>
      </div>

      {/* Search result hint */}
      {deferredOrderSearch && (
        <div style={{ fontSize: 12, color: 'var(--tl)', marginBottom: 8 }}>
          Kết quả tìm kiếm cho <strong>"{deferredOrderSearch}"</strong>
        </div>
      )}

      <div className="card">
        {/* Section: Cần thông báo */}
        <div className="sdiv">Đã hoàn tất – cần thông báo</div>

        {loading ? (
          <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
            Đang tải từ server...
          </div>
        ) : pendingCards.filter(card => {
          if (!deferredOrderSearch) return true;
          const q = deferredOrderSearch.toLowerCase();
          return card.name.toLowerCase().includes(q) || card.phone.includes(q);
        }).length === 0 ? (
          <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
            {deferredOrderSearch ? `Không tìm thấy "${deferredOrderSearch}" trong danh sách cần thông báo` : 'Không có đơn nào cần thông báo'}
          </div>
        ) : pendingCards.filter(card => {
          if (!deferredOrderSearch) return true;
          const q = deferredOrderSearch.toLowerCase();
          return card.name.toLowerCase().includes(q) || card.phone.includes(q);
        }).map(card => (
          <div key={card.id} className="nc" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10 }}>
              <div className="nca" style={{ background: card.bgColor }}>{card.initials}</div>
              <div className="ni2" style={{ flex: 1 }}>
                <div className="nname">{card.name}</div>
                <div className="nmeta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                   <Phone className="icon icon-sm" style={{ color: 'var(--tl)' }} aria-hidden="true" />
                  {card.phone} · Hoàn tất lúc {card.completedAt}
                  {card.groupCount > 1 ? ` · Đơn tách ${card.groupCount} mẻ` : ''} · Chưa thông báo
                </div>
              </div>
              <button className="by" onClick={() => { void sendNotify(card); }} disabled={isActionPending(`notify-send:${cardGroupKey(card)}`)} aria-busy={isActionPending(`notify-send:${cardGroupKey(card)}`)}>
                 {isActionPending(`notify-send:${cardGroupKey(card)}`) ? <LoaderCircle className="icon icon-sm oq-spin" aria-hidden="true" /> : <Send className="icon icon-sm" aria-hidden="true" />}
                {isActionPending(`notify-send:${cardGroupKey(card)}`) ? 'Đang mở...' : 'Gửi Zalo'}
              </button>
            </div>
            {card.message && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginLeft: 46, fontSize: '11px', color: 'var(--ts)', background: '#f8fafc', borderRadius: 8, padding: '7px 11px', width: 'calc(100% - 46px)', boxSizing: 'border-box' }}>
                 <MessageSquare className="icon icon-sm" style={{ color: 'var(--tl)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                <span>"{card.message}"</span>
              </div>
            )}
          </div>
        ))}

        {/* Section: Đã thông báo */}
        <div className="sdiv" style={{ marginTop: 14 }}>Đã thông báo</div>
        <div id="notified-list">
          {notifiedList.filter(card => {
            if (!deferredOrderSearch) return true;
            const q = deferredOrderSearch.toLowerCase();
            return card.name.toLowerCase().includes(q) || card.phone.includes(q);
          }).length === 0 ? (
            <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
              {deferredOrderSearch ? `Không tìm thấy "${deferredOrderSearch}"` : 'Chưa có thông báo nào gửi trong ca này'}
            </div>
          ) : notifiedList.filter(card => {
            if (!deferredOrderSearch) return true;
            const q = deferredOrderSearch.toLowerCase();
            return card.name.toLowerCase().includes(q) || card.phone.includes(q);
          }).map(card => (
            <div key={card.id} className="nc">
              <div className="nca" style={{ background: 'var(--gn)' }}>{card.initials}</div>
              <div className="ni2">
                <div className="nname">{card.name}</div>
                <div className="nmeta">
                  Đã mở Zalo & gửi lúc {card.completedAt}
                  {card.groupCount > 1 ? ` · ${card.groupCount} mẻ` : ''}
                </div>
                {card.message && (
                  <div style={{ marginTop: 5, fontSize: '10.5px', color: 'var(--ts)', background: '#f9fafb', padding: '6px 10px', borderRadius: 7, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                     <MessageSquare className="icon icon-sm" style={{ color: 'var(--tl)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                    "{card.message}"
                  </div>
                )}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="bp" onClick={() => { void completeNotify(card); }} disabled={isActionPending(`notify-complete:${cardGroupKey(card)}`)} aria-busy={isActionPending(`notify-complete:${cardGroupKey(card)}`)} style={{ fontSize: '12px', padding: '7px 12px' }}>
                   {isActionPending(`notify-complete:${cardGroupKey(card)}`) ? <LoaderCircle className="icon icon-sm oq-spin" aria-hidden="true" /> : <Check className="icon icon-sm" aria-hidden="true" />}
                  {isActionPending(`notify-complete:${cardGroupKey(card)}`) ? 'Đang cập nhật...' : 'Đã giao đồ'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Section: Đang xử lý */}
        <div className="sdiv" style={{ marginTop: 14 }}>Đang xử lý – chưa cần thông báo</div>
        {processingList.filter((o: any) => {
          if (!deferredOrderSearch) return true;
          const q = deferredOrderSearch.toLowerCase();
          return o.name.toLowerCase().includes(q);
        }).length === 0 ? (
          <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
          {deferredOrderSearch ? `Không tìm thấy "${deferredOrderSearch}"` : 'Không có đơn nào đang xử lý'}
          </div>
        ) : processingList.filter((o: any) => {
          if (!deferredOrderSearch) return true;
          const q = deferredOrderSearch.toLowerCase();
          return o.name.toLowerCase().includes(q);
        }).map((o: any) => (
          <div key={o.id} className="nc">
            <div className="nca" style={{ background: 'var(--bl)' }}>{o.initials}</div>
            <div className="ni2">
              <div className="nname">{o.name}</div>
              <div className="nmeta">{o.status}</div>
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--tl)', background: '#f1f5f9', padding: '5px 10px', borderRadius: 7 }}>Đang xử lý</span>
          </div>
        ))}
      </div>
    </div>
  );
}
