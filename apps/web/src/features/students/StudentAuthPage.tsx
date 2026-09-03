import React, { FormEvent, useState } from 'react';
import { ApiClient } from '../../api/client';

export function StudentAuthPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('أدخل البريد الإلكتروني وكلمة المرور.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await ApiClient.loginStudent(email, password);
      await ApiClient.getCurrentStudentIdentity();
      onAuthenticated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-12">
      <form onSubmit={submit} className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-black text-emerald-700">حساب الطالب</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">تسجيل الدخول إلى منارتك</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">تتم المصادقة عبر جلسة الخادم؛ لا تُحفظ كلمة المرور أو حالة الدخول في المتصفح.</p>
        <label htmlFor="student-email" className="mt-6 block text-sm font-bold text-slate-700">البريد الإلكتروني</label>
        <input id="student-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-emerald-700" />
        <label htmlFor="student-password" className="mt-4 block text-sm font-bold text-slate-700">كلمة المرور</label>
        <input id="student-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-emerald-700" />
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="mt-6 h-11 w-full rounded-xl bg-emerald-800 px-4 font-black text-white disabled:opacity-60">{loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}</button>
      </form>
    </main>
  );
}
