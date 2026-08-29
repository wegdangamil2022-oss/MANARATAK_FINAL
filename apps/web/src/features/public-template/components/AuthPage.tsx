import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, Chrome } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="w-full max-w-sm mx-auto py-8 px-4">
      <div className="bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-[var(--mn-border)] transition-all duration-300">
        {/* Header Section */}
        <div className="bg-[var(--mn-primary)] dark:bg-[var(--mn-surface)] p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--mn-primary)] to-[var(--mn-primary)] dark:from-[#0A2238] dark:to-[#041627] opacity-90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[var(--mn-accent-soft)]/20 via-transparent to-transparent"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-[var(--mn-surface)] dark:bg-[var(--mn-surface-elevated)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-[var(--mn-accent)]">
              <LogIn className="w-7 h-7 text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)]" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">
              {isLogin ? 'مرحباً بعودتك!' : 'إنشاء حساب جديد'}
            </h2>
            <p className="text-[var(--mn-accent-text)] text-xs font-bold">
              {isLogin
                ? 'سجل دخولك لمتابعة رحلتك التعليمية'
                : 'انضم إلينا وابدأ رحلة البحث عن منحتك'}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <div className="mb-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[var(--mn-surface)] dark:bg-[var(--mn-surface-elevated)] border-2 border-slate-100 dark:border-[var(--mn-border)] hover:bg-slate-50 dark:hover:bg-[var(--mn-surface-muted)] text-slate-700 dark:text-slate-200 font-black rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              <span>المتابعة باستخدام Google</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-[var(--mn-border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--mn-surface)] dark:bg-[var(--mn-surface)] text-slate-500 text-xs font-bold">
                  أو عبر البريد الإلكتروني
                </span>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-3 pr-9 py-2.5 text-sm border border-slate-200 dark:border-[var(--mn-border)] rounded-xl bg-slate-50 dark:bg-[var(--mn-surface-elevated)] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--mn-primary)] dark:focus:ring-[var(--mn-focus)] focus:border-transparent transition-all"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-3 pr-9 py-2.5 text-sm border border-slate-200 dark:border-[var(--mn-border)] rounded-xl bg-slate-50 dark:bg-[var(--mn-surface-elevated)] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--mn-primary)] dark:focus:ring-[var(--mn-focus)] focus:border-transparent transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-3 pr-9 py-2.5 text-sm border border-slate-200 dark:border-[var(--mn-border)] rounded-xl bg-slate-50 dark:bg-[var(--mn-surface-elevated)] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--mn-primary)] dark:focus:ring-[var(--mn-focus)] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-end">
                <a
                  href="#"
                  className="text-xs font-bold text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] hover:underline"
                >
                  نسيت كلمة المرور؟
                </a>
              </div>
            )}

            <button
              type="button"
              className="w-full py-3 px-4 bg-[var(--mn-primary)] dark:bg-[var(--mn-accent)] hover:bg-[var(--mn-primary-hover)] dark:hover:bg-[var(--mn-accent-soft)] text-white dark:text-[var(--mn-on-accent)] text-sm font-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
            >
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
              {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-black text-[var(--mn-heading)] dark:text-[var(--mn-accent-text)] hover:underline cursor-pointer"
              >
                {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
