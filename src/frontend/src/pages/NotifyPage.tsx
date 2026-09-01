/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { pendingNotifications, notificationPreview } from '../api/notifications';
interface NotifyCard {
  id: string;
  initials: string;
  name: string;
  phone: string;
  completedAt: string;
  message: string;
  sent: boolean;
  bgColor: string;
}

export default function NotifyPage() {
  const { showToast, store, orderSearch } = useApp();

  const [loading, setLoading] = useState(true);
  const [pendingCards, setPendingCards] = useState<NotifyCard[]>([]);
  const [notifiedList, setNotifiedList] = useState<NotifyCard[]>([]);
  const { orders } = useApp();

  const processingList = useMemo(() => {
    return orders
      .filter(o => {
        const raw = o.rawStatus ?? (o.status === 'done' ? 'COMPLETED' : 'WAITING');
        if (['COMPLETED', 'NOTIFIED', 'CANCELLED'].includes(raw)) return false;
        if (raw === 'READY') {
          // Nếu đã READY nhưng chưa được hiện ở mục Cần thông báo (do chờ group)
          const inPending = pendingCards.some(pc => pc.id === o.id);
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

  // Luồng 3 – Lấy danh sách đơn cần thông báo từ Backend
  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoading(true);

        if (!store) return;
        const orders: any[] = await pendingNotifications(store.storeId);

        // Map dữ liệu từ Backend sang NotifyCard
        const cards: NotifyCard[] = orders.map((o: any) => {
          const name: string = o.customer?.name ?? 'Khách hàng';
          const phone: string = o.customer?.phone ?? '';
          const words = name.trim().split(' ');
          const initials = words.length >= 2
            ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
            : name.substring(0, 2).toUpperCase();

          const readyTime = o.readyAt
            ? new Date(o.readyAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : '--:--';

          return {
            id: String(o.orderId),
            initials,
            name,
            phone,
            completedAt: readyTime,
            message: '',
            sent: false,
            bgColor: o.serviceType === 'WASH_DRY' ? 'var(--pu)'
              : o.serviceType === 'WASH' ? 'var(--bl)'
              : 'var(--am)',
          };
        });

        // Fetch preview message song song cho tất cả đơn
        const previews = await Promise.allSettled(
          cards.map(card => notificationPreview(Number(card.id)))
        );
        const cardsWithMessage = cards.map((card, i) => {
          const result = previews[i];
          const msg = result.status === 'fulfilled' ? (result.value?.content ?? '') : '';
          return { ...card, message: msg };
        });

        setPendingCards(cardsWithMessage);
      } catch (err) {
        console.error('[Luồng 3] Lỗi khi tải thông báo:', err);
        showToast('Không tải được danh sách thông báo. Kiểm tra Backend đang chạy chưa.', 'red');
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [store, showToast]);

  // Bấm nút Gửi Zalo
  const sendNotify = async (card: NotifyCard) => {
    try {
      // 1. Gọi API /preview để lấy nội dung tin nhắn mẫu
      const preview = await notificationPreview(Number(card.id));
      const content: string = preview.content ?? `Chào ${card.name}, đồ của bạn đã sẵn sàng, vui lòng đến nhận!`;

      // 2. Copy nội dung vào clipboard
      try { await navigator.clipboard.writeText(content); } catch { /* clipboard unavailable */ }

      // 3. Mở Zalo qua link zalo.me
      const phoneClean = card.phone.replace(/\s/g, '');
      window.open(`https://zalo.me/${phoneClean}`, '_blank');

      showToast(`Đã copy nội dung & Mở Zalo cho ${card.name}`, 'grn');

      // 4. Cập nhật UI: chuyển card từ pending → notified
      setPendingCards(prev => prev.filter(c => c.id !== card.id));
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setNotifiedList(prev => [...prev, { ...card, message: content, sent: true, completedAt: timeStr }]);
    } catch (err) {
      console.error('[Luồng 3] Lỗi khi gửi thông báo:', err);
      showToast('Có lỗi khi tải nội dung tin nhắn từ API', 'red');
    }
  };

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
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="35" fill="rgba(255,255,255,0.2)"/>
            <g transform="translate(16, 19)" color="var(--tx)">
              <svg width="44" height="44"><use href="#i-send" /></svg>
            </g>
          </svg>
        </div>
      </div>

      {/* Search result hint */}
      {orderSearch && (
        <div style={{ fontSize: 12, color: 'var(--tl)', marginBottom: 8 }}>
          Kết quả tìm kiếm cho <strong>"{orderSearch}"</strong>
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
          if (!orderSearch) return true;
          const q = orderSearch.toLowerCase();
          return card.name.toLowerCase().includes(q) || card.phone.includes(q);
        }).length === 0 ? (
          <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
            {orderSearch ? `Không tìm thấy "${orderSearch}" trong danh sách cần thông báo` : 'Không có đơn nào cần thông báo'}
          </div>
        ) : pendingCards.filter(card => {
          if (!orderSearch) return true;
          const q = orderSearch.toLowerCase();
          return card.name.toLowerCase().includes(q) || card.phone.includes(q);
        }).map(card => (
          <div key={card.id} className="nc" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10 }}>
              <div className="nca" style={{ background: card.bgColor }}>{card.initials}</div>
              <div className="ni2" style={{ flex: 1 }}>
                <div className="nname">{card.name}</div>
                <div className="nmeta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg className="icon icon-sm" style={{ color: 'var(--tl)' }}><use href="#i-phone" /></svg>
                  {card.phone} · Hoàn tất lúc {card.completedAt} · Chưa thông báo
                </div>
              </div>
              <button className="by" onClick={() => sendNotify(card)}>
                <svg className="icon icon-sm"><use href="#i-send" /></svg>
                Gửi Zalo
              </button>
            </div>
            {card.message && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginLeft: 46, fontSize: '11px', color: 'var(--ts)', background: '#f8fafc', borderRadius: 8, padding: '7px 11px', width: 'calc(100% - 46px)', boxSizing: 'border-box' }}>
                <svg className="icon icon-sm" style={{ color: 'var(--tl)', flexShrink: 0, marginTop: 1 }}><use href="#i-message" /></svg>
                <span>"{card.message}"</span>
              </div>
            )}
          </div>
        ))}

        {/* Section: Đã thông báo */}
        <div className="sdiv" style={{ marginTop: 14 }}>Đã thông báo</div>
        <div id="notified-list">
          {notifiedList.filter(card => {
            if (!orderSearch) return true;
            const q = orderSearch.toLowerCase();
            return card.name.toLowerCase().includes(q) || card.phone.includes(q);
          }).length === 0 ? (
            <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
              {orderSearch ? `Không tìm thấy "${orderSearch}"` : 'Chưa có thông báo nào gửi trong ca này'}
            </div>
          ) : notifiedList.filter(card => {
            if (!orderSearch) return true;
            const q = orderSearch.toLowerCase();
            return card.name.toLowerCase().includes(q) || card.phone.includes(q);
          }).map(card => (
            <div key={card.id} className="nc">
              <div className="nca" style={{ background: 'var(--gn)' }}>{card.initials}</div>
              <div className="ni2">
                <div className="nname">{card.name}</div>
                <div className="nmeta">Đã mở Zalo & gửi lúc {card.completedAt}</div>
                {card.message && (
                  <div style={{ marginTop: 5, fontSize: '10.5px', color: 'var(--ts)', background: '#f9fafb', padding: '6px 10px', borderRadius: 7, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                    <svg className="icon icon-sm" style={{ color: 'var(--tl)', flexShrink: 0, marginTop: 1 }}><use href="#i-message" /></svg>
                    "{card.message}"
                  </div>
                )}
              </div>
              <span className="nsent">
                <svg className="icon icon-sm"><use href="#i-check" /></svg> Đã gửi
              </span>
            </div>
          ))}
        </div>

        {/* Section: Đang xử lý */}
        <div className="sdiv" style={{ marginTop: 14 }}>Đang xử lý – chưa cần thông báo</div>
        {processingList.filter((o: any) => {
          if (!orderSearch) return true;
          const q = orderSearch.toLowerCase();
          return o.name.toLowerCase().includes(q);
        }).length === 0 ? (
          <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
            {orderSearch ? `Không tìm thấy "${orderSearch}"` : 'Không có đơn nào đang xử lý'}
          </div>
        ) : processingList.filter((o: any) => {
          if (!orderSearch) return true;
          const q = orderSearch.toLowerCase();
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
