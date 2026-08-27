import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, AlertCircle, CheckCircle2, Building2, Briefcase, Check } from 'lucide-react';
import { User as UserType, BUSINESS_CATEGORIES } from '../types';
import { Logo } from './Logo';
import { TripartiteAgreementModal } from './TripartiteAgreementModal';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserType, token?: string) => void;
}

const DEFAULT_GOOGLE_CLIENT_ID = '676805214069-67li6kv4ppmc1jmff5u29lcns84idk6a.apps.googleusercontent.com';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'owner' | 'sale' | 'visitor'>('owner');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['bds-vinhomes']);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTripartiteModal, setShowTripartiteModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  // Register OTP States
  const [registerStep, setRegisterStep] = useState<'form' | 'otp_verification'>('form');
  const [regEmailOtpDigits, setRegEmailOtpDigits] = useState<string[]>(['8', '5', '4', '3', '2', '1']);
  const [regPhoneOtpDigits, setRegPhoneOtpDigits] = useState<string[]>(['6', '9', '2', '4', '1', '8']);
  const [regEmailTimer, setRegEmailTimer] = useState<number>(30);
  const [regPhoneTimer, setRegPhoneTimer] = useState<number>(30);

  // Timer countdown for Registration OTPs
  useEffect(() => {
    let interval: any = null;
    if (registerStep === 'otp_verification' && (regEmailTimer > 0 || regPhoneTimer > 0)) {
      interval = setInterval(() => {
        setRegEmailTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setRegPhoneTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [registerStep, regEmailTimer, regPhoneTimer]);

  // Helper to decode Google JWT token if GSI returns one
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Handle Google Identity Services credential response
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response.credential) return;
    const payload = parseJwt(response.credential);
    if (!payload || !payload.email) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          name: payload.name || payload.given_name || payload.email.split('@')[0],
          avatar: payload.picture,
          googleId: payload.sub
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Lỗi xác thực Google');
      } else {
        setSuccessMsg('Đăng nhập Google thành công!');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 400);
      }
    } catch (err) {
      setErrorMsg('Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for popup OAuth message
  useEffect(() => {
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('VITE_GOOGLE_CLIENT_ID') || DEFAULT_GOOGLE_CLIENT_ID;
    const isInIframe = window.self !== window.top;

    if (!isInIframe && (window as any).google?.accounts?.id && googleClientId) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          use_fedcm_for_prompt: false,
          auto_select: false
        });
      } catch (e) {
        // Safe catch for iframe security policies
      }
    }

    const handleMessageEvent = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS' && event.data.user) {
        setSuccessMsg('Đăng nhập Google thành công!');
        setTimeout(() => {
          onLoginSuccess(event.data.user);
        }, 300);
      } else if (event.data && event.data.type === 'GOOGLE_OAUTH_ERROR') {
        setErrorMsg(event.data.error || 'Đăng nhập Google không thành công.');
      }
    };

    window.addEventListener('message', handleMessageEvent);
    return () => {
      window.removeEventListener('message', handleMessageEvent);
    };
  }, []);

  // Real Google OAuth Handler
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('VITE_GOOGLE_CLIENT_ID') || DEFAULT_GOOGLE_CLIENT_ID;

    // Approach 1: Try GIS Token Client if available in window
    if ((window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setIsLoading(false);
              if (tokenResponse.error === 'popup_closed' || tokenResponse.error === 'access_denied' || tokenResponse.error === 'user_cancel') {
                // User simply dismissed or cancelled the popup dialog
                return;
              }
              setErrorMsg('Đăng nhập Google chưa hoàn tất hoặc bị hủy.');
              return;
            }
            try {
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              if (!userInfoRes.ok) {
                throw new Error('Không thể lấy thông tin từ tài khoản Google.');
              }
              const userInfo = await userInfoRes.json();

              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: userInfo.email,
                  name: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0],
                  avatar: userInfo.picture,
                  googleId: userInfo.sub
                })
              });

              const data = await res.json();
              if (!res.ok) {
                setErrorMsg(data.error || 'Đăng nhập thất bại.');
              } else {
                setSuccessMsg('Đăng nhập bằng tài khoản Google thành công!');
                setTimeout(() => {
                  onLoginSuccess(data.user);
                }, 400);
              }
            } catch (err: any) {
              setErrorMsg(err.message || 'Lỗi kết nối máy chủ khi đăng nhập Google.');
            } finally {
              setIsLoading(false);
            }
          },
          error_callback: (err: any) => {
            setIsLoading(false);
            const errType = err?.type || '';
            const errMsg = err?.message || String(err || '');
            
            // Check if user dismissed popup or closed the auth window
            if (errType === 'popup_closed' || errMsg.toLowerCase().includes('closed') || errMsg.toLowerCase().includes('cancel')) {
              console.info('Google sign-in popup was dismissed by user.');
              return;
            }

            if (errType === 'popup_blocked_by_browser') {
              setErrorMsg('Trình duyệt đã chặn cửa sổ đăng nhập Google. Vui lòng cho phép popup.');
              return;
            }

            console.warn('Google Token Client notice:', err);
            setErrorMsg('Không thể mở cửa sổ đăng nhập Google. Vui lòng thử lại.');
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('GIS TokenClient init failed, falling back to direct OAuth popup:', err);
      }
    }

    // Approach 2: Direct Google OAuth 2.0 Authorization Endpoint Popup
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: redirectUri,
        response_type: 'token id_token',
        scope: 'openid email profile',
        prompt: 'select_account',
        nonce: nonce
      }).toString();

      const popup = window.open(googleAuthUrl, 'google_oauth_popup', 'width=520,height=650,scrollbars=yes,resizable=yes');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Fallback to direct redirect if popup is blocked by browser
        window.location.href = googleAuthUrl;
      }
    } catch (err: any) {
      setErrorMsg('Không thể mở cửa sổ đăng nhập Google. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Facebook Authentication Handlers
  const handleFacebookAuth = () => {
    setErrorMsg('');
    setSuccessMsg('');

    const facebookAppId = (import.meta as any).env?.VITE_FACEBOOK_APP_ID || localStorage.getItem('VITE_FACEBOOK_APP_ID') || '1000000000000000';

    const redirectUri = `${window.location.origin}/auth/callback`;
    const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` + new URLSearchParams({
      client_id: facebookAppId,
      redirect_uri: redirectUri,
      scope: 'email,public_profile',
      response_type: 'token'
    }).toString();

    // Directly open real Facebook Login dialog popup / window!
    const popup = window.open(fbAuthUrl, 'facebook_oauth_popup', 'width=600,height=750,scrollbars=yes,resizable=yes');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.location.href = fbAuthUrl;
    }
  };

  const submitFacebookLoginWithEmail = async (emailStr: string, nameStr?: string, avatarStr?: string) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const cleanEmail = emailStr.trim().toLowerCase();
      const nameFromEmail = cleanEmail.split('@')[0];
      const formattedName = nameStr || (nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) + ' (FB)');

      const res = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: formattedName,
          avatar: avatarStr || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Đăng nhập Facebook thất bại.');
      } else {
        setSuccessMsg('Đăng nhập bằng Facebook thành công!');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 400);
      }
    } catch (err) {
      setErrorMsg('Có lỗi xảy ra khi kết nối máy chủ Facebook.');
    } finally {
      setIsLoading(false);
    }
  };

  // Zalo Authentication Handler
  const handleZaloAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const defaultPhone = phone || '';
      const defaultName = name || 'Cư dân Zalo 24H';

      const res = await fetch('/api/auth/zalo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: defaultPhone,
          name: defaultName,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Đăng nhập Zalo thất bại.');
      } else {
        setSuccessMsg('Đăng nhập bằng Zalo thành công!');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 400);
      }
    } catch (err) {
      setErrorMsg('Có lỗi xảy ra khi kết nối Zalo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Form Submit (Login or Register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegister) {
      if (registerStep === 'form') {
        if (!name.trim()) {
          setErrorMsg('Vui lòng nhập đầy đủ Họ và tên.');
          return;
        }
        if (!phone.trim()) {
          setErrorMsg('Vui lòng nhập Số điện thoại liên hệ / Zalo.');
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMsg('Vui lòng nhập địa chỉ Email hợp lệ.');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Mật khẩu đăng ký phải có ít nhất 6 ký tự.');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Mật khẩu xác nhận không trùng khớp. Vui lòng nhập lại!');
          return;
        }
        if (!agreeTerms) {
          setErrorMsg('⚠️ Bạn phải tích chọn đồng ý với Thỏa thuận 3 bên (Bên A Cư dân - Bên B Nhà cung cấp - Bên C chocudan24h.com) thì mới có thể chuyển sang bước tiếp theo.');
          return;
        }

        // Proceed to Email OTP verification step
        setIsLoading(true);
        try {
          const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: name.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim()
            })
          });
          const data = await res.json();
          if (!res.ok) {
            setErrorMsg(data.error || 'Không thể gửi mã OTP tới Email.');
            return;
          }

          setRegisterStep('otp_verification');
          setRegEmailTimer(30);

          if (data.code) {
            // Auto-fill or store for easy test verification when GMAIL_APP_PASS is not configured
            const codeArr = String(data.code).split('');
            if (codeArr.length === 6) {
              setRegEmailOtpDigits(codeArr);
            }
          }

          if (data.sentLive) {
            setSuccessMsg(`✓ Mã OTP đã được gửi trực tiếp tới email ${email}! Vui lòng kiểm tra hộp thư.`);
          } else {
            setSuccessMsg(`✓ Mã OTP xác thực Email đã được tạo thành công!`);
          }
        } catch (err) {
          setErrorMsg('Lỗi kết nối máy chủ gửi OTP.');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // OTP Verification Submission
      const enteredOtp = regEmailOtpDigits.join('');
      if (enteredOtp.length < 6) {
        setErrorMsg('Vui lòng nhập đủ 6 chữ số mã OTP Email!');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            email: email.trim().toLowerCase(), 
            phone, 
            password, 
            role, 
            businessCategories: selectedCategories,
            otpCode: enteredOtp
          })
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Đăng ký không thành công.');
        } else {
          setSuccessMsg('✓ Xác thực Email OTP thành công! Đang kích hoạt tài khoản...');
          // Store JWT token for API calls
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }
          setTimeout(() => {
            onLoginSuccess({
              ...data.user,
              emailVerified: true
            }, data.token);
          }, 600);
        }
      } catch (err) {
        setErrorMsg('Không thể gửi yêu cầu đăng ký tới máy chủ.');
      } finally {
        setIsLoading(false);
      }

    } else {
      // Login Flow
      if (!email.trim()) {
        setErrorMsg('Vui lòng nhập Địa chỉ Email hoặc Tên đăng nhập.');
        return;
      }
      if (!password) {
        setErrorMsg('Vui lòng nhập Mật khẩu.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Đăng nhập không thành công.');
        } else {
          setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
          // Store JWT token for API calls
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }
          setTimeout(() => {
            onLoginSuccess(data.user, data.token);
          }, 500);
        }
      } catch (err) {
        setErrorMsg('Lỗi kết nối máy chủ. Vui lòng kiểm tra lại đường truyền!');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      {/* Screen Safety Fixed Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-2.5 right-2.5 sm:top-5 sm:right-5 z-[70] p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
        title="Đóng cửa sổ"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-sm sm:max-w-md w-full p-4 sm:p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto my-auto">
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Logo Header */}
        <Logo variant="auth" className="mb-2" />

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-3 sm:mb-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black rounded-lg sm:rounded-xl transition ${
              !isRegister
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ĐĂNG NHẬP
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black rounded-lg sm:rounded-xl transition ${
              isRegister
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ĐĂNG KÝ TÀI KHOẢN MỚI
          </button>
        </div>

        <div className="text-center space-y-0.5 mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {isRegister ? 'TẠO TÀI KHOẢN CHÍNH THỨC' : 'XÁC THỰC TÀI KHOẢN BĐS 24H'}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Hệ thống lưu giữ tài khoản & quản lý bài đăng BĐS Vinhomes chính chủ
          </p>
        </div>

        {/* Real Social Auth Shortcuts */}
        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleAuth}
            className="w-full py-2 sm:py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-[11px] sm:text-xs rounded-xl flex items-center justify-center gap-2 transition border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer active:scale-[0.99]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
            </svg>
            <span>{isLoading ? 'Đang kết nối Google...' : 'Đăng nhập bằng tài khoản Google'}</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleFacebookAuth}
            className="w-full py-2 sm:py-2.5 px-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-[11px] sm:text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
          >
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Đăng nhập trực tiếp bằng Facebook</span>
          </button>
        </div>

        <div className="relative flex py-0.5 items-center mb-3">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="flex-shrink mx-2 sm:mx-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {isRegister ? 'Hoặc điền biểu mẫu đăng ký' : 'Hoặc đăng nhập mật khẩu'}
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        {isRegister && registerStep === 'otp_verification' ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRegisterStep('form')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
              >
                ← Sửa thông tin đăng ký
              </button>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Xác thực Email OTP
              </span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
              <div className="font-extrabold text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Bảo mật tài khoản Email chính chủ:</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Hệ thống đã gửi mã xác thực OTP 6 chữ số tới hộp thư <strong>{email}</strong>. Vui lòng kiểm tra Email (bao gồm cả thư mục Spam/Rác) và nhập bên dưới:
              </p>
            </div>

            {/* Email OTP Section */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span>Mã OTP Email ({email})</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  ✓ Đã gửi Email
                </span>
              </div>

              <div className="flex justify-center gap-1.5 sm:gap-2">
                {regEmailOtpDigits.map((digit, idx) => (
                  <input
                    key={`email-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      if (!/^\d*$/.test(e.target.value)) return;
                      const next = [...regEmailOtpDigits];
                      next[idx] = e.target.value.slice(-1);
                      setRegEmailOtpDigits(next);
                    }}
                    className="w-9 h-11 sm:w-10 sm:h-12 text-center text-lg font-black border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
                  />
                ))}
              </div>

              <div className="text-center text-[11px] text-slate-500 pt-1">
                {regEmailTimer > 0 ? (
                  <span>Thử lại mã Email trong <b className="text-slate-800 dark:text-slate-200">{regEmailTimer}s</b></span>
                ) : (
                  <button 
                    type="button" 
                    onClick={async () => {
                      setRegEmailTimer(30);
                      try {
                        const res = await fetch('/api/auth/send-otp', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            name: name.trim(),
                            email: email.trim().toLowerCase(),
                            phone: phone.trim()
                          })
                        });
                        const data = await res.json();
                        if (data.code) {
                          setRegEmailOtpDigits(String(data.code).split(''));
                        }
                        setSuccessMsg(data.message || 'Đã gửi lại mã OTP Email!');
                      } catch (e) {
                        setErrorMsg('Lỗi khi gửi lại OTP.');
                      }
                    }} 
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    🔄 Gửi lại mã OTP Email
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              ) : (
                '✓ XÁC NHẬN & HOÀN TẤT ĐĂNG KÝ'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <>
              {/* Role Selection Tabs for Registration */}
              <div className="space-y-1.5 pb-2">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-900 dark:text-white text-xs">
                    VAI TRÒ / TÀI KHOẢN TRÊN NỀN TẢNG <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Khách hàng & Thành viên
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRole('visitor')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center text-center justify-center gap-1 ${
                      role === 'visitor'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">🏠</span>
                    <span className="text-[10px] uppercase font-black leading-tight">CƯ DÂN</span>
                    <span className="text-[9px] text-slate-400 font-normal leading-none hidden sm:block">Mua sắm / Thuê nhà</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center text-center justify-center gap-1 ${
                      role === 'owner'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">🏪</span>
                    <span className="text-[10px] uppercase font-black leading-tight">CHỦ SHOP</span>
                    <span className="text-[9px] text-slate-400 font-normal leading-none hidden sm:block">Bán hàng / Dịch vụ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('sale')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center text-center justify-center gap-1 ${
                      role === 'sale'
                        ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">💼</span>
                    <span className="text-[10px] uppercase font-black leading-tight">MÔI GIỚI</span>
                    <span className="text-[9px] text-slate-400 font-normal leading-none hidden sm:block">Tư vấn BĐS</span>
                  </button>
                </div>
              </div>

              {/* Multi-Select Industry / Business Category Picker */}
              <div className="space-y-1.5 pb-2">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-900 dark:text-white text-xs flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                    <span>NGÀNH NGHỀ BÁN HÀNG & DỊCH VỤ</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {selectedCategories.length} ngành nghề đã chọn
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  💡 Cư dân, chủ shop, môi giới đều có thể chọn <strong>1 hoặc nhiều ngành nghề</strong> bên dưới để hệ thống dễ dàng quản lý & đề xuất khách hàng:
                </p>
                <div className="max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {BUSINESS_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`p-2 rounded-lg border text-left text-xs transition flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-extrabold shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0">{cat.icon}</span>
                          <span className="truncate text-[11px] leading-tight">{cat.name}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] shrink-0 transition ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500 text-slate-950 font-black'
                            : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Bùi Văn Hiếu"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Số điện thoại liên hệ / Zalo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập SĐT/Zalo của bạn (VD: 0912.xxx.xxx)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 sm:top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn (VD: name@gmail.com)"
                className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 sm:top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Tối thiểu 6 ký tự" : "Nhập mật khẩu của bạn"}
                className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nhập lại Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 sm:top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận lại mật khẩu"
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 sm:p-3 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1">
                <label htmlFor="agreeTerms" className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer w-4 h-4 shrink-0"
                  />
                  <span className="text-[10.5px] sm:text-[11px] text-slate-800 dark:text-slate-200 leading-snug font-semibold">
                    Tôi đồng ý tuân thủ{' '}
                    <button
                      type="button"
                      onClick={() => setShowTripartiteModal(true)}
                      className="text-amber-600 dark:text-amber-400 font-extrabold underline hover:text-amber-500 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Thỏa thuận Ba Bên</span>
                    </button>
                    {' '}& Chính sách Bảo mật. <span className="text-rose-500 font-black">(*)</span>
                  </span>
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block animate-spin border-2 border-slate-950 border-t-transparent rounded-full w-4 h-4"></span>
            ) : isRegister ? (
              'TIẾP TỤC XÁC THỰC OTP (EMAIL & SĐT)'
            ) : (
              'ĐĂNG NHẬP HỆ THỐNG'
            )}
          </button>
        </form>
      )}

        <div className="mt-3 sm:mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký mới'}
          </button>
        </div>

      </div>

      <TripartiteAgreementModal
        isOpen={showTripartiteModal}
        onClose={() => setShowTripartiteModal(false)}
        onAccept={() => {
          setAgreeTerms(true);
          setShowTripartiteModal(false);
        }}
        userRole={role === 'owner' ? 'partner' : 'resident'}
      />
    </div>
  );
};


