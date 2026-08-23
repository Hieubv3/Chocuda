import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { safeLocalStorageSet } from '../lib/imageUtils';
import { User } from '../types';

interface AuthCallbackPageProps {
  onLoginSuccess?: (user: User) => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to parse JWT payload
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const processCallback = async () => {
      try {
        // 1. Check hash fragment (implicit grant: #access_token=...&id_token=...)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);

        // 2. Check query params (code=... or error=...)
        const searchParams = new URLSearchParams(window.location.search);

        const error = hashParams.get('error') || searchParams.get('error');
        if (error) {
          throw new Error(error);
        }

        const idToken = hashParams.get('id_token');
        const accessToken = hashParams.get('access_token');

        let email = '';
        let name = '';
        let avatar = '';
        let googleId = '';

        if (idToken) {
          const payload = parseJwt(idToken);
          if (payload) {
            email = payload.email;
            name = payload.name || payload.given_name;
            avatar = payload.picture;
            googleId = payload.sub;
          }
        }

        // If no ID token, but access token exists, fetch userinfo from Google
        if (!email && accessToken) {
          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (userInfoRes.ok) {
              const userInfo = await userInfoRes.json();
              email = userInfo.email;
              name = userInfo.name || userInfo.given_name;
              avatar = userInfo.picture;
              googleId = userInfo.sub;
            }
          } catch (e) {
            console.warn('Could not fetch Google userinfo directly:', e);
          }
        }

        // Fallback: If still no email, check if Facebook token
        if (!email && accessToken) {
          try {
            const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
            if (fbRes.ok) {
              const fbData = await fbRes.json();
              email = fbData.email || `fb_${fbData.id}@chocudan24h.com`;
              name = fbData.name;
              avatar = fbData.picture?.data?.url;
              googleId = fbData.id;
            }
          } catch (e) {
            console.warn('Facebook graph lookup failed:', e);
          }
        }

        if (!email) {
          // If no tokens found in URL, check if there's any pending session or test param
          const emailParam = searchParams.get('email');
          if (emailParam) {
            email = emailParam;
            name = searchParams.get('name') || email.split('@')[0];
          } else {
            throw new Error('Không nhận được thông tin xác thực từ tài khoản Google.');
          }
        }

        // Send to backend API to create or fetch user session
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: name || email.split('@')[0],
            avatar,
            googleId
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Đăng nhập thất bại.');
        }

        const loggedInUser: User = data.user;
        safeLocalStorageSet('hb_user', loggedInUser);

        if (onLoginSuccess) {
          onLoginSuccess(loggedInUser);
        }

        setStatus('success');

        // Check if opened as popup
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            {
              type: 'GOOGLE_OAUTH_SUCCESS',
              user: loggedInUser
            },
            '*'
          );
          setTimeout(() => {
            window.close();
          }, 600);
        } else {
          // Redirect to home / account
          setTimeout(() => {
            navigate('/tai-khoan', { replace: true });
          }, 800);
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Lỗi xác thực Google');
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            {
              type: 'GOOGLE_OAUTH_ERROR',
              error: err.message
            },
            '*'
          );
        }
      }
    };

    processCallback();
  }, [navigate, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl text-white">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
            <h2 className="text-lg font-black">Đang xác thực Google...</h2>
            <p className="text-xs text-slate-400">Vui lòng chờ giây lát trong khi hệ thống hoàn tất đăng nhập.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-black text-emerald-400">ĐĂNG NHẬP THÀNH CÔNG!</h2>
            <p className="text-xs text-slate-300">Đang chuyển tiếp về trang chính...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-black text-red-400">Xác thực thất bại</h2>
            <p className="text-xs text-slate-400">{errorMsg}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase cursor-pointer"
            >
              Về Trang Chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
};
