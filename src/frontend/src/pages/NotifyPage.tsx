import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

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

const BACKEND = 'http://localhost:4000/api';

export default function NotifyPage() {
  const { showToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [pendingCards, setPendingCards] = useState<NotifyCard[]>([]);
  const [notifiedList, setNotifiedList] = useState<NotifyCard[]>([]);
  const [processingList, setProcessingList] = useState<any[]>([]);

  // Luồng 3 – Lấy danh sách đơn cần thông báo từ Backend
  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoading(true);

        const storeId = localStorage.getItem('storeId') || '1';
        const res = await fetch(`${BACKEND}/stores/${storeId}/notifications/pending`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}` }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const orders: any[] = json.data ?? json; // hỗ trợ cả { data: [] } và []

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
            message: '', // Sẽ lấy khi bấm Gửi qua API /preview
            sent: false,
            bgColor: o.serviceType === 'WASH_DRY' ? 'var(--pu)'
              : o.serviceType === 'WASH' ? 'var(--bl)'
              : 'var(--am)',
          };
        });

        setPendingCards(cards);
      } catch (err) {
        console.error('[Luồng 3] Lỗi khi tải thông báo:', err);
        showToast('Không tải được danh sách thông báo. Kiểm tra Backend đang chạy chưa.', 'red');
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  // Bấm nút Gửi Zalo
  const sendNotify = async (card: NotifyCard) => {
    try {
      // 1. Gọi API /preview để lấy nội dung tin nhắn mẫu
      const res = await fetch(`${BACKEND}/orders/${card.id}/notifications/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify({ channel: 'ZALO' }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const content: string = (json.data ?? json).content ?? `Chào ${card.name}, đồ của bạn đã sẵn sàng, vui lòng đến nhận!`;

      // 2. Copy nội dung vào clipboard
      try { await navigator.clipboard.writeText(content); } catch (_) { /* ignore */ }

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

      <div className="card">
        {/* Section: Cần thông báo */}
        <div className="sdiv">Đã hoàn tất – cần thông báo</div>

        {loading ? (
          <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
            Đang tải từ server...
          </div>
        ) : pendingCards.length === 0 ? (
          <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
            Không có đơn nào cần thông báo
          </div>
        ) : pendingCards.map(card => (
          <div key={card.id} className="nc">
            <div className="nca" style={{ background: card.bgColor }}>{card.initials}</div>
            <div className="ni2">
              <div className="nname">{card.name}</div>
              <div className="nmeta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg className="icon icon-sm" style={{ color: 'var(--tl)' }}><use href="#i-phone" /></svg>
                {card.phone} · Sẵn sàng lúc {card.completedAt} · Chưa thông báo
              </div>
            </div>
            <button className="by" onClick={() => sendNotify(card)}>
              <svg className="icon icon-sm"><use href="#i-send" /></svg>
              Gửi Zalo
            </button>
          </div>
        ))}

        {/* Section: Đã thông báo */}
        <div className="sdiv" style={{ marginTop: 14 }}>Đã thông báo</div>
        <div id="notified-list">
          {notifiedList.length === 0 ? (
            <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
              Chưa có thông báo nào gửi trong ca này
            </div>
          ) : notifiedList.map(card => (
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
        {processingList.length === 0 ? (
          <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '12px 0', textAlign: 'center' }}>
            Không có đơn nào đang xử lý
          </div>
        ) : processingList.map((o: any) => (
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
