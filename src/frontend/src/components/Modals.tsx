import { useApp } from '../context/useApp';
import type { ToastItem } from '../context/app-context';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

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
  const Icon = toast.type === 'grn' ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`toast show ${toast.type}`}>
      <Icon className="icon icon-sm" aria-hidden="true" />
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
              <X className="icon icon-sm" aria-hidden="true" />
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
