import { useState } from 'react';
import { login } from '../api/auth';
import type { StoreSession } from '../api/auth';
import { ApiRequestError } from '../api/client';
import { useAsyncAction } from '../hooks/useAsyncAction';

interface LoginPageProps {
  onLogin: (store: StoreSession) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [panel, setPanel] = useState<'login' | 'register'>('login');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdReg, setShowPwdReg] = useState(false);
  const { pending: loading, run: runLogin } = useAsyncAction('auth:login');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('admin@washtrack.com');
  const [password, setPassword] = useState('your-password');

  const handleLogin = async () => {
    await runLogin(async () => {
      setError('');
      try {
        const result = await login(email, password);
        onLogin(result.store);
      }
      catch (cause) { setError(cause instanceof ApiRequestError ? cause.message : 'Không thể kết nối máy chủ'); }
    });
  };

  const handleRegister = () => {
    setError('Đăng ký tài khoản chưa được hỗ trợ trong prototype này.');
  };

  return (
    <div id="login-shell" style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(135deg, #4b1a8d 0%, #20104f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes fadein { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .mat-input {
          width:100%; height:30px; background:transparent; border:none; border-bottom:2px solid #d4c5f9;
          padding:0; font-size:14px; font-weight:500; color:#1e293b; outline:none; transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .mat-input:focus { border-bottom-color: #a369eb; }
        .pill-btn {
          width:140px; height:40px; border-radius:20px;
          background:linear-gradient(90deg, #a369eb 0%, #c47af8 100%);
          color:#fff; border:none; font-size:14px; font-weight:600; cursor:pointer;
          box-shadow: 0 4px 15px rgba(163,105,235,0.4); margin: 0 auto; display:block;
          transition: all 0.2s; font-family: 'Inter', sans-serif;
        }
        .pill-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(163,105,235,0.5); }
        .link-text { color:#94a3b8; font-size:11px; font-weight:600; text-decoration:none; transition:all 0.2s; cursor:pointer; background:none; border:none; font-family:'Inter',sans-serif; }
        .link-text:hover { color:#a369eb; }
        .google-btn {
          display:flex; align-items:center; justify-content:center; gap:8px;
          background:#fff; border:1px solid #e2e8f0; border-radius:8px;
          height:38px; width:100%; max-width:180px; margin: 0 auto;
          color:#475569; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s;
          font-family:'Inter',sans-serif;
        }
        .google-btn:hover { background:#f8fafc; border-color:#cbd5e1; }
      `}</style>

      <div style={{ width: 780, height: 480, background: '#fff', borderRadius: 24, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', display: 'flex', overflow: 'hidden' }}>

        {/* Cột trái – Graphic */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #a855f7 0%, #7d3ced 100%)', position: 'relative', padding: 30, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', transform: 'translateY(-15px)' }}>
            <div style={{ width: 100, height: 100, background: '#fbbf24', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(251,191,36,.5)', margin: '0 auto 20px' }}>
              <svg style={{ width: 64, height: 64, color: '#4b1a8d' }}><use href="#i-washer" /></svg>
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 10, letterSpacing: '0.5px', textShadow: '0 2px 10px rgba(0,0,0,0.1)', margin: '0 0 10px' }}>WashTrack</h1>
            <h2 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.4, marginBottom: 15, opacity: 1, textShadow: '0 1px 5px rgba(0,0,0,0.1)', margin: '0 0 15px' }}>Hệ thống quản lý giặt ủi thông minh</h2>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#e9d5ff', lineHeight: 1.5, maxWidth: 280, margin: '0 auto' }}>
              Đơn giản hóa quy trình vận hành, nâng cao hiệu suất tiệm của bạn mỗi ngày!
            </p>
          </div>
        </div>

        {/* Cột phải – Form */}
        <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#fff' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, background: '#9f54ef', color: '#fff', padding: '10px 20px', borderBottomRightRadius: 18, fontWeight: 600, fontSize: 12, boxShadow: '2px 2px 10px rgba(0,0,0,0.05)' }}>
            Chào mừng trở lại
          </div>

          <div style={{ flex: 1, padding: '60px 45px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Login Panel */}
            {panel === 'login' && (
              <div style={{ animation: 'fadein 0.3s ease-out' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#6c56b7', textAlign: 'center', marginBottom: 30 }}>Đăng nhập tài khoản</h2>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#877ab4', marginBottom: 4 }}>Email</label>
                    <input className="mat-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div style={{ marginBottom: 35 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#877ab4', marginBottom: 4 }}>Mật khẩu</label>
                  <div style={{ position: 'relative' }}>
                    <input className="mat-input" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 30 }} />
                    <div onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: showPwd ? 1 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: '#64748b' }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {error && <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', borderRadius: 8, padding: '9px 11px', fontSize: 12, marginBottom: 16 }}>{error}</div>}

                <button className="pill-btn" onClick={handleLogin} disabled={loading}>
                  {loading ? '↻ Đang xử lý...' : 'Đăng nhập'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <button className="link-text" style={{ fontSize: 12 }} onClick={() => setPanel('register')}>
                    Tạo tài khoản mới
                  </button>
                </div>
              </div>
            )}

            {/* Register Panel */}
            {panel === 'register' && (
              <div style={{ animation: 'fadein 0.3s ease-out' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#6c56b7', textAlign: 'center', marginBottom: 20 }}>Đăng ký tài khoản</h2>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#877ab4', marginBottom: 4 }}>Tên cửa hàng</label>
                  <input className="mat-input" type="text" placeholder="Nhập tên tiệm giặt ủi của bạn" />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#877ab4', marginBottom: 4 }}>Email</label>
                  <input className="mat-input" type="email" placeholder="Nhập địa chỉ email của bạn" />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#877ab4', marginBottom: 4 }}>Mật khẩu</label>
                  <div style={{ position: 'relative' }}>
                    <input className="mat-input" type={showPwdReg ? 'text' : 'password'} placeholder="********" style={{ paddingRight: 30 }} />
                    <div onClick={() => setShowPwdReg(v => !v)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: showPwdReg ? 1 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: '#64748b' }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button className="pill-btn" onClick={handleRegister} disabled={loading}>
                  {loading ? '↻ Đang tạo...' : 'Đăng ký ngay'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 15 }}>
                  <button className="link-text" style={{ fontSize: 12 }} onClick={() => setPanel('login')}>
                    Quay lại Đăng nhập
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ paddingBottom: 30, textAlign: 'center' }}>
            <div style={{ marginBottom: 15 }}>
              <button className="link-text" style={{ textDecoration: 'underline' }}>Quên mật khẩu?</button>
            </div>
            <button className="google-btn">
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Đăng nhập với Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
