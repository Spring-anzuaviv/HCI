import { useState } from 'react';
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

export default function NotifyPage() {
  const { showToast, orders } = useApp();

  const [notifiedList, setNotifiedList] = useState<NotifyCard[]>([]);
  const [pendingCards, setPendingCards] = useState<NotifyCard[]>([
    {
      id: 'dqa', initials: 'ĐA', name: 'Đặng Quốc Anh', phone: '0945 678 901',
      completedAt: '16:30', message: 'Đồ của bạn đã sạch và sẵn sàng. Cảm ơn đã tin dùng Như Ý!',
      sent: false, bgColor: 'var(--pu)',
    },
  ]);

  const processingCards = orders.filter(o => o.status === 'pending' && !o.isWaiting && o.id !== 'dqa');

  const sendNotify = (card: NotifyCard) => {
    // Xóa khỏi pending
    setPendingCards(prev => prev.filter(c => c.id !== card.id));
    // Thêm vào notified
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setNotifiedList(prev => [...prev, { ...card, sent: true, completedAt: timeStr }]);
    showToast(`Đã gửi Zalo cho ${card.name}`, 'grn');
  };

  return (
    <div id="p-n" className="page">
      {/* Hero */}
      <div className="hero hero-sub">
        <div className="hero-txt">
          <h2>Cập nhật tiến trình &amp; Thông báo khách</h2>
          <p style={{ marginBottom: 0 }}>
            Hệ thống soạn sẵn nội dung thông báo cho từng đơn. Bạn chỉ cần kiểm tra và nhấn Gửi — không cần soạn tay hay lo bỏ sót khách.
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
        {/* Cần thông báo */}
        <div className="sdiv">Đã hoàn tất – cần thông báo</div>

        {pendingCards.length === 0 && (
          <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '10px 0', textAlign: 'center' }}>
            Không có đơn nào cần thông báo
          </div>
        )}

        {pendingCards.map(card => (
          <div key={card.id} className="nc">
            <div className="nca" style={{ background: card.bgColor }}>{card.initials}</div>
            <div className="ni2">
              <div className="nname">{card.name}</div>
              <div className="nmeta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg className="icon icon-sm" style={{ color: 'var(--tl)' }}><use href="#i-phone" /></svg>
                {card.phone} · Hoàn tất lúc {card.completedAt} · Chưa thông báo
              </div>
              <div style={{ marginTop: 5, fontSize: '10.5px', color: 'var(--ts)', background: '#f9fafb', padding: '6px 10px', borderRadius: 7, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                <svg className="icon icon-sm" style={{ color: 'var(--tl)', flexShrink: 0, marginTop: 1 }}><use href="#i-message" /></svg>
                "{card.message}"
              </div>
            </div>
            <button className="by" onClick={() => sendNotify(card)}>
              <svg className="icon icon-sm"><use href="#i-send" /></svg>
              Gửi Zalo
            </button>
          </div>
        ))}

        {/* Đã thông báo */}
        <div className="sdiv" style={{ marginTop: 14 }}>Đã thông báo</div>
        <div id="notified-list">
          {notifiedList.length === 0 ? (
            <div style={{ fontSize: '12.5px', color: 'var(--tl)', padding: '10px 0', textAlign: 'center' }}>
              Chưa có thông báo nào gửi trong ca này
            </div>
          ) : notifiedList.map(card => (
            <div key={card.id} className="nc">
              <div className="nca" style={{ background: 'var(--gn)' }}>{card.initials}</div>
              <div className="ni2">
                <div className="nname">{card.name}</div>
                <div className="nmeta">Đã gửi Zalo lúc {card.completedAt}</div>
              </div>
              <span className="nsent">
                <svg className="icon icon-sm"><use href="#i-check" /></svg> Đã gửi
              </span>
            </div>
          ))}
        </div>

        {/* Đang xử lý */}
        <div className="sdiv" style={{ marginTop: 14 }}>Đang xử lý – chưa cần thông báo</div>
        <div className="nc">
          <div className="nca" style={{ background: 'var(--bl)' }}>MT</div>
          <div className="ni2">
            <div className="nname">Nguyễn Minh Tuấn</div>
            <div className="nmeta">Đang giặt · Hẹn 17:30 · Dự kiến xong 17:15</div>
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--tl)', background: '#f1f5f9', padding: '5px 10px', borderRadius: 7 }}>Đang xử lý</span>
        </div>
        <div className="nc">
          <div className="nca" style={{ background: 'var(--pk)' }}>TH</div>
          <div className="ni2">
            <div className="nname">Trần Thị Hoa</div>
            <div className="nmeta">Đang sấy · Hẹn 17:30 · Dự kiến xong 17:20</div>
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--tl)', background: '#f1f5f9', padding: '5px 10px', borderRadius: 7 }}>Đang xử lý</span>
        </div>
      </div>
    </div>
  );
}
