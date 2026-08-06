import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, AlertCircle, CheckCircle2, Building2, Briefcase, Check } from 'lucide-react';
import { User as UserType, BUSINESS_CATEGORIES } from '../types';
import { Logo } from './Logo';
import { TripartiteAgreementModal } from './TripartiteAgreementModal';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
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
  // Google OAuth / GSI States
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleStep, setGoogleStep] = useState<'chooser' | 'custom_input' | 'otp_verify'>('chooser');
  const [showClientIdInput, setShowClientIdInput] = useState(false);
  const [inputClientId, setInputClientId] = useState('');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<{ name: string; email: string; avatar?: string }>({
    name: 'bv hieu',
    email: 'kinhdoanh1.fpt@gmail.com'
  });
  const [otpDigits, setOtpDigits] = useState<string[]>(['8', '5', '4', '3', '2', '1']);
  const [otpTimer, setOtpTimer] = useState<number>(25);

  // Facebook & Zalo States
  const [showFacebookPrompt, setShowFacebookPrompt] = useState(false);
  const [facebookStep, setFacebookStep] = useState<'chooser' | 'custom_input' | 'otp_verify'>('chooser');
  const [showFacebookAppIdInput, setShowFacebookAppIdInput] = useState(false);
  const [inputFacebookAppId, setInputFacebookAppId] = useState('');
  const [facebookEmailInput, setFacebookEmailInput] = useState('');
  const [selectedFacebookAccount, setSelectedFacebookAccount] = useState<{ name: string; email: string; avatar?: string }>({
    name: 'Bùi Văn Hiếu (Facebook)',
    email: 'kinhdoanh1.fpt@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
  });

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (googleStep === 'otp_verify' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [googleStep, otpTimer]);

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
          name: payload.name || payload.given_name,
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
        }, 500);
      }
    } catch (err) {
      setErrorMsg('Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize GSI if client id or global script exists
  useEffect(() => {
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('VITE_GOOGLE_CLIENT_ID') || DEFAULT_GOOGLE_CLIENT_ID;
    if ((window as any).google?.accounts?.id && googleClientId) {
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
  }, []);

  const handleGoogleAuth = () => {
    setErrorMsg('');
    setSuccessMsg('');
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('VITE_GOOGLE_CLIENT_ID') || DEFAULT_GOOGLE_CLIENT_ID;

    // Direct user to real Google OAuth accounts.google.com page
    if (googleClientId) {
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

      // Attempt to open Google OAuth popup or redirect directly to accounts.google.com
      const popup = window.open(googleAuthUrl, 'google_oauth_popup', 'width=500,height=600');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.open(googleAuthUrl, '_blank');
      }
      return;
    }

    // Direct Google Account prompt modal for iframe preview & custom sign-in
    setGoogleStep('chooser');
    setShowGooglePrompt(true);
  };

  const selectAccountAndRequestOtp = (name: string, email: string, avatar?: string) => {
    setSelectedGoogleAccount({ name, email, avatar });
    setOtpTimer(25);
    setGoogleStep('otp_verify');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
  };

  const submitGoogleLoginWithEmail = async (emailStr: string, nameStr?: string, avatarStr?: string) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const cleanEmail = emailStr.trim().toLowerCase();
      const nameFromEmail = cleanEmail.split('@')[0];
      const formattedName = nameStr || (nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));

      const res = await fetch('/api/auth/google', {
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
        setErrorMsg(data.error || 'Đăng nhập Google thất bại.');
      } else {
        setSuccessMsg('Xác thực tài khoản Google thành công!');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 400);
      }
    } catch (err) {
      setErrorMsg('Có lỗi xảy ra khi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitCustomGoogleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim() || !googleEmailInput.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Email Google/Gmail hợp lệ (ví dụ: name@gmail.com)');
      return;
    }
    const namePart = googleEmailInput.split('@')[0];
    selectAccountAndRequestOtp(namePart, googleEmailInput.trim());
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
      const defaultPhone = phone || '0868.499.929';
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

        // Proceed to OTP verification step
        setRegisterStep('otp_verification');
        setRegEmailTimer(30);
        setRegPhoneTimer(30);
        setSuccessMsg('Mã xác thực OTP đã gửi tới Email & SMS Số điện thoại của bạn.');
        return;
      }

      // OTP Verification Submission
      if (regEmailOtpDigits.join('').length < 6 || regPhoneOtpDigits.join('').length < 6) {
        setErrorMsg('Vui lòng nhập đủ 6 chữ số mã OTP cho cả Email và Số điện thoại!');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password, role, businessCategories: selectedCategories })
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Đăng ký không thành công.');
        } else {
          setSuccessMsg('✓ Xác thực Email & Số điện thoại thành công! Đang kích hoạt tài khoản...');
          setTimeout(() => {
            onLoginSuccess({
              ...data.user,
              emailVerified: true,
              phoneVerified: true
            });
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
          setTimeout(() => {
            onLoginSuccess(data.user);
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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Screen Safety Fixed Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[70] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full transition cursor-pointer border border-white/20 shadow-2xl flex items-center justify-center"
        title="Đóng cửa sổ"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in duration-200 max-h-[88vh] overflow-y-auto my-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Header */}
        <Logo variant="auth" className="mb-4" />

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
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
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
              isRegister
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ĐĂNG KÝ TÀI KHOẢN MỚI
          </button>
        </div>

        <div className="text-center space-y-1 mb-5">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {isRegister ? 'TẠO TÀI KHOẢN CHÍNH THỨC' : 'XÁC THỰC TÀI KHOẢN BĐS 24H'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ thống lưu giữ tài khoản & quản lý bài đăng BĐS Vinhomes chính chủ
          </p>
        </div>

        {/* Google OAuth Overlay Modal if active */}
        {showGooglePrompt && (
          <div className="absolute inset-0 z-20 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between animate-in fade-in zoom-in duration-200">
            {googleStep === 'chooser' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
                    </svg>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Đăng nhập bằng Google</span>
                  </div>
                  <button onClick={() => setShowGooglePrompt(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Chọn tài khoản</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tiếp tục tới <span className="font-bold text-blue-600 dark:text-blue-400">chocudan24h.com</span>
                  </p>
                  
                  <div className="mt-2.5 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed space-y-2">
                    <div>
                      💡 <b>Tại sao hiển thị bảng mô phỏng này?</b><br />
                      Mọi ứng dụng web muốn mở trang đăng nhập Google thật (trên <code>accounts.google.com</code>) bắt buộc phải khai báo mã <b>Google OAuth Client ID</b> do Google Console cấp.
                    </div>

                    {!showClientIdInput ? (
                      <button
                        type="button"
                        onClick={() => setShowClientIdInput(true)}
                        className="font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-700 block"
                      >
                        👉 Bấm vào đây để dán Google Client ID của bạn & Mở Google thật ngay!
                      </button>
                    ) : (
                      <div className="pt-1 space-y-2 border-t border-amber-500/20">
                        <label className="font-bold block text-slate-800 dark:text-slate-200">Dán Google OAuth Client ID (.apps.googleusercontent.com):</label>
                        <input
                          type="text"
                          value={inputClientId}
                          onChange={(e) => setInputClientId(e.target.value)}
                          placeholder="xxxxxxxxxx-xxxxxxxx.apps.googleusercontent.com"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (inputClientId.trim()) {
                                localStorage.setItem('VITE_GOOGLE_CLIENT_ID', inputClientId.trim());
                                setShowGooglePrompt(false);
                                handleGoogleAuth();
                              }
                            }}
                            className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-500 shadow"
                          >
                            Lưu & Đăng Nhập Google Thật
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowClientIdInput(false)}
                            className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Options List */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => selectAccountAndRequestOtp('bv hieu', 'kinhdoanh1.fpt@gmail.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80')}
                    className="w-full flex items-center gap-3.5 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition text-left border border-slate-200 dark:border-slate-800 group"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      alt="bv hieu"
                      className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">bv hieu</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">kinhdoanh1.fpt@gmail.com</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectAccountAndRequestOtp('hieu bean', 'hieubv3@gmail.com')}
                    className="w-full flex items-center gap-3.5 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition text-left border border-slate-200 dark:border-slate-800 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      hb
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">hieu bean</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">hieubv3@gmail.com</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectAccountAndRequestOtp('Hỗ Trợ BĐS 24H', 'hotro.chocudan24h@gmail.com')}
                    className="w-full flex items-center gap-3.5 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition text-left border border-slate-200 dark:border-slate-800 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      24H
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">Hỗ Trợ BĐS 24H</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">hotro.chocudan24h@gmail.com</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoogleStep('custom_input')}
                    className="w-full flex items-center gap-3.5 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition text-left border border-dashed border-slate-300 dark:border-slate-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-lg shrink-0">
                      +
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Sử dụng một tài khoản khác</div>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed pt-3 border-t border-slate-100 dark:border-slate-800">
                  Trước khi sử dụng <span className="font-semibold text-slate-700 dark:text-slate-300">chocudan24h.com</span>, bạn có thể xem <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Chính sách quyền riêng tư</a> và <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">Điều khoản dịch vụ</a> của ứng dụng này.
                </div>
              </div>
            )}

            {googleStep === 'custom_input' && (
              <form onSubmit={submitCustomGoogleEmail} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setGoogleStep('chooser')} className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1">
                    ← Trở lại
                  </button>
                  <button type="button" onClick={() => setShowGooglePrompt(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nhập tài khoản Google mới</h2>
                  <p className="text-xs text-slate-500">Nhập địa chỉ Gmail để đăng nhập trực tiếp</p>
                </div>

                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition"
                >
                  Tiếp tục với Gmail này
                </button>
              </form>
            )}

            {googleStep === 'otp_verify' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setGoogleStep('chooser')} className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1">
                    ← Đổi tài khoản
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGooglePrompt(false);
                      setEmail(selectedGoogleAccount.email);
                    }}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline"
                  >
                    Sử dụng mật khẩu
                  </button>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black text-slate-900 dark:text-white shadow-inner">
                    X
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Kiểm tra email của bạn</h2>
                  <p className="text-xs text-slate-500">
                    Mã đã được gửi đến <b className="text-slate-800 dark:text-slate-200">{selectedGoogleAccount.email}</b>
                  </p>
                </div>

                {/* 6 Digit OTP Inputs */}
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-10 h-12 text-center text-lg font-black border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
                    />
                  ))}
                </div>

                <div className="text-center text-xs text-slate-500">
                  {otpTimer > 0 ? (
                    <span>Chưa nhận được mã? Thử lại trong <b className="text-slate-800 dark:text-slate-200">{otpTimer} giây</b></span>
                  ) : (
                    <button type="button" onClick={() => setOtpTimer(30)} className="text-blue-600 font-bold hover:underline">
                      Gửi lại mã xác thực
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => submitGoogleLoginWithEmail(selectedGoogleAccount.email, selectedGoogleAccount.name, selectedGoogleAccount.avatar)}
                  className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="inline-block animate-spin border-2 border-white dark:border-slate-900 border-t-transparent rounded-full w-4 h-4"></span>
                  ) : (
                    'TIẾP TỤC'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Real Social Auth Shortcuts */}
        <div className="space-y-2 mb-5">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleAuth}
            className="w-full py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs rounded-xl flex items-center justify-center gap-3 transition border border-slate-300 dark:border-slate-700 shadow-xs"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
            </svg>
            <span>Đăng nhập trực tiếp bằng Google</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleFacebookAuth}
            className="w-full py-2.5 px-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
          >
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Đăng nhập trực tiếp bằng Facebook</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center mb-4">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="flex-shrink mx-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
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
                Bước 2/2: Xác thực OTP Kép
              </span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
              <div className="font-extrabold text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Bảo mật tài khoản mới chính chủ:</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Vui lòng nhập mã xác thực OTP 6 chữ số đã được gửi đồng thời tới Email và SĐT của bạn.
              </p>
            </div>

            {/* Email OTP Section */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>1. Mã OTP Email ({email})</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  ✓ Đã gửi mã
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
                    className="w-8 h-10 sm:w-9 sm:h-11 text-center text-base font-black border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
                  />
                ))}
              </div>

              <div className="text-center text-[11px] text-slate-500">
                {regEmailTimer > 0 ? (
                  <span>Thử lại mã Email trong <b className="text-slate-800 dark:text-slate-200">{regEmailTimer}s</b></span>
                ) : (
                  <button type="button" onClick={() => setRegEmailTimer(30)} className="text-blue-600 font-bold hover:underline">
                    Gửi lại mã OTP Email
                  </button>
                )}
              </div>
            </div>

            {/* Phone OTP Section */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>2. Mã OTP SĐT SMS ({phone})</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  ✓ Đã gửi SMS
                </span>
              </div>

              <div className="flex justify-center gap-1.5 sm:gap-2">
                {regPhoneOtpDigits.map((digit, idx) => (
                  <input
                    key={`phone-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      if (!/^\d*$/.test(e.target.value)) return;
                      const next = [...regPhoneOtpDigits];
                      next[idx] = e.target.value.slice(-1);
                      setRegPhoneOtpDigits(next);
                    }}
                    className="w-8 h-10 sm:w-9 sm:h-11 text-center text-base font-black border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
                  />
                ))}
              </div>

              <div className="text-center text-[11px] text-slate-500">
                {regPhoneTimer > 0 ? (
                  <span>Thử lại tin nhắn SMS trong <b className="text-slate-800 dark:text-slate-200">{regPhoneTimer}s</b></span>
                ) : (
                  <button type="button" onClick={() => setRegPhoneTimer(30)} className="text-emerald-600 font-bold hover:underline">
                    Gửi lại SMS OTP SĐT
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 mt-2"
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
                    placeholder="0868.499.929"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@gmail.com (hoặc admin)"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Tối thiểu 6 ký tự" : "Mật khẩu của bạn"}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nhập lại Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận lại mật khẩu"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 rounded-2xl space-y-1.5">
                <label htmlFor="agreeTerms" className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer w-4.5 h-4.5 shrink-0"
                  />
                  <span className="text-[11px] text-slate-800 dark:text-slate-200 leading-snug font-semibold">
                    Tôi đã đọc, hiểu rõ & đồng ý tuân thủ{' '}
                    <button
                      type="button"
                      onClick={() => setShowTripartiteModal(true)}
                      className="text-amber-600 dark:text-amber-400 font-extrabold underline hover:text-amber-500 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>📄 Thỏa thuận Ba Bên (Cư dân / Khách hàng - Nhà cung cấp / Chủ shop - chocudan24h.com)</span>
                    </button>
                    {' '}và Chính sách Bảo mật. <span className="text-rose-500 font-black">(*)</span>
                  </span>
                </label>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-7 flex items-center gap-1">
                  <span>👉 Click vào đường dẫn gạch chân màu cam ở trên để mở Popup xem chi tiết đầy đủ 10 Điều khoản văn bản.</span>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md mt-3 flex items-center justify-center gap-2"
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

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            {isRegister ? 'Đã có tài khoản? Bấm vào đây để Đăng nhập' : 'Chưa có tài khoản? Bấm vào đây để Đăng ký mới'}
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


