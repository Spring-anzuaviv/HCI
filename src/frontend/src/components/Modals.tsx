import { useApp } from '../context/AppContext';
import type { ToastItem } from '../context/AppContext';

// ─── Toast Container ───
export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="tc" id="tc">
      {toasts.map(t => <Toast key={t.id} toast={t} />)}
    </div>
  );
}

function Toast({ toast }: { toast: ToastItem }) {
  const ico = toast.type === 'grn' ? '#i-check-circle' : '#i-alert';
  return (
    <div className={`toast show ${toast.type}`}>
      <svg className="icon icon-sm"><use href={ico} /></svg>
      {toast.msg}
    </div>
  );
}

// ─── Generic Modal Wrapper ───
interface ModalProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}

export function Modal({ id, title, children, footer, width = 470 }: ModalProps) {
  const { openModal, closeM } = useApp();
  const isOpen = openModal === id;

  return (
    <div className={`mov${isOpen ? ' open' : ''}`} id={id} onClick={() => closeM(id)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width }}>
        {title && (
          <div className="mhd">
            <div className="mtitle">{title}</div>
            <button className="mxbtn" onClick={() => closeM(id)}>
              <svg className="icon icon-sm"><use href="#i-x" /></svg>
            </button>
          </div>
        )}
        {children}
        {footer && (
          <div style={{ display: 'flex', gap: 9, marginTop: 18, justifyContent: 'flex-end' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
