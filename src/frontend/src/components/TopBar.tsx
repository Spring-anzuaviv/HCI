import { useApp } from '../context/AppContext';

export default function TopBar() {
  const { config, openM, setCurrentPage, orderSearch, setOrderSearch } = useApp();

  const shopName = config.shopName || 'WashTrack';
  const parts = shopName.trim().split(' ');
  let initials = 'WT';
  if (parts.length >= 2) initials = (parts[0][0] + parts[1][0]).toUpperCase();
  else if (parts.length === 1) initials = parts[0].substring(0, 2).toUpperCase();

  return (
    <header className="topbar">
      {/* <div className="searchbar">
        <svg className="icon icon-sm"><use href="#i-search" /></svg>
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng, khách hàng…"
          value={orderSearch}
          onChange={e => setOrderSearch(e.target.value)}
          onFocus={() => setCurrentPage('orders')}
        />
      </div> */}

      <div className="tbr">
        <button className="bp" onClick={() => openM('am')} style={{ marginRight: 5, padding: '8px 12px' }}>
          <svg className="icon icon-sm"><use href="#i-plus" /></svg>
          Thêm đơn
        </button>

        <button className="ibtn" title="Cài đặt" onClick={() => openM('sm')}>
          <svg className="icon icon-sm"><use href="#i-settings" /></svg>
        </button>

        <div className="ibtn" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('n')}>
          <svg className="icon icon-sm"><use href="#i-send" /></svg>
          <span className="bdg">1</span>
        </div>

        <div className="tbuser">
          <div className="tbav" id="header-avatar">{initials}</div>
          <span className="tbname" id="header-shop-name">{shopName}</span>
        </div>
      </div>
    </header>
  );
}
