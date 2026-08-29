import React, { useState, useEffect } from 'react';
import { PushNotificationItem } from '../types';
import {
  Bell,
  BellRing,
  Sparkles,
  Clock,
  Check,
  X,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Volume2,
  VolumeX,
  Send,
  CheckCheck,
} from 'lucide-react';

interface PushNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onTriggerTestPush: () => void;
  onSelectAction?: (actionType?: string, targetId?: string) => void;
  activeToast: PushNotificationItem | null;
  onDismissToast: () => void;
}

export const PushNotificationCenter: React.FC<PushNotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onTriggerTestPush,
  onSelectAction,
  activeToast,
  onDismissToast,
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'opportunity' | 'deadline' | 'course'>(
    'all',
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* 1. Real-time Dropdown Toast for Instant Push Alert */}
      {activeToast && (
        <div
          id="instant-push-toast"
          className="fixed top-3 inset-x-3 max-w-md mx-auto z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
        >
          <div className="bg-[var(--mn-surface-elevated)]/95 backdrop-blur-md rounded-2xl p-3.5 border-2 border-amber-400 shadow-2xl flex items-start justify-between gap-3 text-right">
            {/* App Icon & Badge */}
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0 shadow-xs">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>

            {/* Notification Text */}
            <div
              className="flex-1 cursor-pointer"
              onClick={() => {
                onSelectAction?.(activeToast.actionType, activeToast.targetId);
                onDismissToast();
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                  منارتك • تنبيه دفع فوري ⚡
                </span>
                <span className="text-[10px] text-stone-400">{activeToast.timestamp}</span>
              </div>
              <h4 className="text-xs font-black text-stone-900 leading-snug mt-0.5">
                {activeToast.title}
              </h4>
              <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">{activeToast.body}</p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={onDismissToast}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Full Notification Center Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[var(--mn-surface)] rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-6 duration-200 text-right">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--mn-primary)] via-[var(--mn-secondary)] to-[var(--mn-primary)] p-4 text-white flex items-center justify-between border-b border-[var(--mn-border-brand)]/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-amber-400 flex items-center justify-center text-amber-300">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>مركز التنبيهات الفورية</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black">
                        {unreadCount} جديد
                      </span>
                    )}
                  </h2>
                  <p className="text-[10px] text-blue-200">
                    إشعارات فورية بكل منحة جديدة وموعد نهائي
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 text-stone-300 hover:text-amber-300 rounded-lg"
                  title={soundEnabled ? 'صوت التنبيهات مفعل' : 'صوت التنبيهات صامت'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-stone-300 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Actions Bar */}
            <div className="bg-stone-50 p-2.5 border-b border-stone-200 flex items-center justify-between gap-2">
              <button
                onClick={onTriggerTestPush}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-[10px] font-black shadow-xs active:scale-95 transition-all"
              >
                <Send className="w-3 h-3" />
                <span>تجربة تنبيه فوري الآن ⚡</span>
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-[var(--mn-heading)] hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>تحديد الكل كمقروء</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-2 bg-stone-100/70 border-b border-stone-200">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'urgent', label: '⚡ عاجل' },
                { id: 'opportunity', label: '🎓 منح جديدة' },
                { id: 'deadline', label: '⏰ مواعيد نهائية' },
                { id: 'course', label: '📚 دورات' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                    filter === f.id
                      ? 'bg-[#002E52] text-amber-300 shadow-2xs'
                      : 'bg-[var(--mn-surface)] text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-2">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  لا توجد تنبيهات في هذا التصنيف حالياً.
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onMarkAsRead(notif.id);
                      if (notif.actionType) {
                        onSelectAction?.(notif.actionType, notif.targetId);
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      notif.read
                        ? 'bg-stone-50/70 border-stone-200/80 text-stone-600'
                        : 'bg-amber-50/50 border-amber-300 text-stone-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                        <h4 className="text-xs font-black leading-snug">{notif.title}</h4>
                      </div>
                      <span className="text-[9px] text-stone-400 whitespace-nowrap">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">{notif.body}</p>

                    {notif.actionType && (
                      <div className="mt-2 text-left">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[var(--mn-heading)] hover:underline">
                          <span>عرض وتفاصيل الفرصة</span>
                          <span>❯</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
