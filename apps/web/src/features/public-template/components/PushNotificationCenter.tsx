import React, { useState, useEffect } from 'react';
import { useOverlayDialog } from '../useOverlayDialog';
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
  useOverlayDialog(isOpen, onClose, 'mn-notification-dialog');
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
      {activeToast && !isOpen && (
        <div
          id="instant-push-toast"
          className="fixed top-3 inset-x-3 max-w-md mx-auto z-[80] animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
        >
          <div className="bg-[var(--mn-surface-elevated)]/95 backdrop-blur-md rounded-2xl p-3.5 border-2 border-[var(--mn-border-gold)] shadow-2xl flex items-start justify-between gap-3 text-right mn-panel ">
            {/* App Icon & Badge */}
            <div className="w-10 h-10 rounded-xl bg-[var(--mn-primary)] border border-[var(--mn-border-gold)] flex items-center justify-center text-[var(--mn-accent-soft)] shrink-0 shadow-xs mn-inverse ">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>

            {/* Notification Text */}
            <div
              className="flex-1 cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectAction?.(activeToast.actionType, activeToast.targetId);
                  onDismissToast();
                }
              }}
              onClick={() => {
                onSelectAction?.(activeToast.actionType, activeToast.targetId);
                onDismissToast();
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[var(--mn-accent-text)] uppercase tracking-wider">
                  منارتك • تنبيه دفع فوري ⚡
                </span>
                <span className="text-[10px] text-[var(--mn-text-muted)]">{activeToast.timestamp}</span>
              </div>
              <h4 className="text-xs font-black text-[var(--mn-heading)] leading-snug mt-0.5">
                {activeToast.title}
              </h4>
              <p className="text-[11px] text-[var(--mn-text-muted)] line-clamp-2 mt-0.5">{activeToast.body}</p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={onDismissToast}
              className="p-1 text-[var(--mn-text-muted)] hover:text-[var(--mn-text)] rounded-lg hover:bg-[var(--mn-surface-muted)] hover:mn-panel "
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Full Notification Center Drawer / Modal */}
      {isOpen && (
        <div role="presentation" tabIndex={-1} onKeyDown={function (event) { if (event.key === 'Escape') onClose(); }} onClick={event => {if (event.target === event.currentTarget) onClose();}} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div id="mn-notification-dialog" role="dialog" aria-modal="true" aria-label="مركز التنبيهات" tabIndex={-1} className="bg-[var(--mn-surface)] rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-[var(--mn-border)] overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-6 duration-200 text-right mn-panel ">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--mn-primary)] via-[var(--mn-hero-secondary)] to-[var(--mn-primary)] p-4 text-white flex items-center justify-between border-b border-[var(--mn-border-brand)]/60 mn-inverse ">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--mn-primary)] border border-[var(--mn-border-gold)] flex items-center justify-center text-[var(--mn-accent-soft)] mn-inverse ">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>مركز التنبيهات الفورية</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[var(--mn-accent)] text-[var(--mn-on-accent)] text-[10px] font-black mn-gold ">
                        {unreadCount} جديد
                      </span>
                    )}
                  </h2>
                  <p className="text-[10px] text-[var(--mn-on-dark-muted)]">
                    إشعارات فورية بكل منحة جديدة وموعد نهائي
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 text-[var(--mn-text-muted)] hover:text-[var(--mn-accent-soft)] rounded-lg"
                  title={soundEnabled ? 'صوت التنبيهات مفعل' : 'صوت التنبيهات صامت'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  aria-label="إغلاق" onClick={onClose}
                  className="p-1.5 text-[var(--mn-text-muted)] hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Actions Bar */}
            <div className="bg-[var(--mn-page)] p-2.5 border-b border-[var(--mn-border)] flex items-center justify-between gap-2 mn-panel ">
              <button
                onClick={onTriggerTestPush}
                className="flex items-center gap-1 px-2.5 py-1 bg-[var(--mn-accent)] hover:bg-[var(--mn-accent)] text-[var(--mn-on-accent)] rounded-xl text-[10px] font-black shadow-xs active:scale-95 transition-all mn-gold hover:mn-gold "
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
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-2 bg-[var(--mn-surface-muted)]/70 border-b border-[var(--mn-border)]">
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
                      ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-soft)] shadow-2xs mn-inverse '
                      : 'bg-[var(--mn-surface)] text-[var(--mn-text-muted)] hover:bg-[var(--mn-surface-muted)] mn-panel hover:mn-panel '
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-2">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center text-[var(--mn-text-muted)] text-xs">
                  لا توجد تنبيهات في هذا التصنيف حالياً.
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={function (event) {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onMarkAsRead(notif.id);
                        if (notif.actionType) {
                          onSelectAction?.(notif.actionType, notif.targetId);
                          onClose();
                        }
                      }
                    }}
                    onClick={() => {
                      onMarkAsRead(notif.id);
                      if (notif.actionType) {
                        onSelectAction?.(notif.actionType, notif.targetId);
                        onClose();
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      notif.read
                        ? 'bg-[var(--mn-page)]/70 border-[var(--mn-border)] text-[var(--mn-text-muted)]'
                        : 'bg-[var(--mn-gold-surface)]/50 border-[var(--mn-border-gold)] text-[var(--mn-heading)] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[var(--mn-accent)] shrink-0 mn-gold " />
                        )}
                        <h4 className="text-xs font-black leading-snug">{notif.title}</h4>
                      </div>
                      <span className="text-[9px] text-[var(--mn-text-muted)] whitespace-nowrap">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--mn-text-muted)] mt-1 leading-relaxed">{notif.body}</p>

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
