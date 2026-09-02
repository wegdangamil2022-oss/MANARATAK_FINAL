import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Mail, ShieldAlert } from 'lucide-react';
import { CsrfClientManager } from '@manaratak/shared';

type AuthResponse = {
  data?: {
    authenticated?: boolean;
  };
  message?: string;
};

type CurrentUserResponse = {
  data?: {
    primaryEmail?: string;
    displayName?: string;
    effectivePermissions?: string[];
  };
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

const hasAdminPermission = (permissions: string[] = []): boolean =>
  permissions.some(
    (permission) =>
      permission === '*' ||
      permission === 'admin:*' ||
      permission.startsWith('admin:'),
  );

export function LoginPage() {
  const navigate = useNavigate();
  const isLocalAdminReadOnly = import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLocalAdminReadOnly) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (!email.trim() || !password) {
      setMessage('أدخل البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);

    try {
      const csrfClient = CsrfClientManager.getInstance(API_BASE_URL);
      const loginResponse = await csrfClient.fetchWithCsrf(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const loginPayload = (await loginResponse.json()) as AuthResponse;

      if (!loginResponse.ok || !loginPayload.data?.authenticated) {
        setMessage(loginPayload.message || 'تعذر تسجيل الدخول بهذه البيانات.');
        return;
      }

      const meResponse = await csrfClient.fetchWithCsrf(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
      });

      if (!meResponse.ok) {
        setMessage('تعذر التحقق من هوية الحساب وصلاحياته.');
        return;
      }

      const currentUser = (await meResponse.json()) as CurrentUserResponse;
      if (!hasAdminPermission(currentUser.data?.effectivePermissions)) {
        setMessage('هذا الحساب لا يملك صلاحية الوصول إلى لوحة الإدارة.');
        return;
      }

      localStorage.setItem(
        'manaratak_user_email',
        currentUser.data?.primaryEmail || email.trim(),
      );
      localStorage.setItem(
        'manaratak_user_name',
        currentUser.data?.displayName || email.trim(),
      );
      localStorage.removeItem('manaratak_demo_email');
      localStorage.removeItem('manaratak_admin_access');

      navigate('/admin/dashboard', { replace: true });
    } catch {
      setMessage('تعذر الاتصال بخدمة المصادقة حاليًا.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="-mx-4 -my-6 min-h-screen bg-gradient-to-br from-[#071d3a] via-[#0b3763] to-[#123f6b] px-4 py-12 text-slate-950 sm:-my-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d6ae57] text-[#071d3a]">
            <ShieldAlert size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">دخول منارتك</h1>
            <p className="mt-1 text-sm text-slate-600">
              استخدم حسابًا إداريًا مخولًا.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="mb-2 block text-sm font-semibold" htmlFor="email">
            البريد الإلكتروني
          </label>
          <div className="relative mb-5">
            <Mail
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full border border-slate-300 bg-white pr-10 pl-3 outline-none focus:border-slate-700"
              placeholder="name@example.com"
              disabled={loading}
            />
          </div>

          <label className="mb-2 block text-sm font-semibold" htmlFor="password">
            كلمة المرور
          </label>
          <div className="relative">
            <Lock
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full border border-slate-300 bg-white pr-10 pl-3 outline-none focus:border-slate-700"
              disabled={loading}
            />
          </div>

          {message ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 bg-[#0b3763] px-4 font-semibold text-white hover:bg-[#071d3a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} aria-hidden="true" />
            {loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </main>
  );
}
