import React, { useState } from 'react';
import { useOverlayDialog } from '../useOverlayDialog';
import { PushNotificationItem } from '../types';
import {
  AlertTriangle,
  Bell,
  BellRing,
  BookOpen,
  Building2,
  CheckCheck,
  ChevronLeft,
  Clock,
  GraduationCap,
  Send,
  Volume2,
  VolumeX,
  X,
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

type NotificationFilter = 'all' | 'urgent' | 'opportunity' | 'deadline' | 'course';


const notificationTitle = (value: string) =>
  value.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s:–—-]+/u, '').trim();

const typeIcon = (notification: PushNotificationItem) => {
  if (notification.actionType === 'scholarship') return GraduationCap;
  if (notification.type === 'urgent') return AlertTriangle;
  if (notification.type === 'deadline') return Clock;
  if (notification.type === 'course') return BookOpen;
  if (notification.type === 'opportunity') return notification.title.includes('جامعة') ? Building2 : GraduationCap;
  return Bell;
};

const FILTERS: Array<{ id: NotificationFilter; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'all', label: 'الكل', icon: Bell },
  { id: 'urgent', label: 'عاجل', icon: AlertTriangle },
  { id: 'opportunity', label: 'فرص', icon: GraduationCap },
  { id: 'deadline', label: 'مواعيد نهائية', icon: Clock },
  { id: 'course', label: 'دورات', icon: BookOpen },
];

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
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const filteredNotifications = notifications.filter((notification) => filter === 'all' || notification.type === filter);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <>
      {activeToast && !isOpen && (() => {
        const ToastIcon = typeIcon(activeToast);
        return (
          <div id="instant-push-toast" className="fixed inset-x-2 top-2 z-[80] mx-auto max-w-md pointer-events-auto">
            <div className="mn-card flex items-start gap-3 border-[var(--mn-border-gold)] p-3.5 shadow-2xl">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--mn-border-gold)] bg-[var(--mn-primary)] text-[var(--mn-accent-soft)] mn-inverse">
                <ToastIcon className="h-5 w-5" />
              </span>
              <button type="button" className="min-w-0 flex-1 text-right" onClick={() => { onSelectAction?.(activeToast.actionType, activeToast.targetId); onDismissToast(); }}>
                <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold text-[var(--mn-accent-text)]">منارتك · تنبيه فوري</span><span className="text-[10px] text-[var(--mn-text-muted)]">{activeToast.timestamp}</span></div>
                <h4 className="mt-0.5 text-xs font-semibold leading-snug text-[var(--mn-heading)]">{notificationTitle(activeToast.title)}</h4>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--mn-text-muted)]">{activeToast.body}</p>
              </button>
              <button type="button" onClick={onDismissToast} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--mn-text-muted)] hover:bg-[var(--mn-surface-muted)]" aria-label="إغلاق التنبيه"><X className="h-4 w-4" /></button>
            </div>
          </div>
        );
      })()}

      {isOpen && (
        <div role="presentation" tabIndex={-1} onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-xs sm:items-center sm:p-4">
          <div id="mn-notification-dialog" role="dialog" aria-modal="true" aria-label="مركز التنبيهات" tabIndex={-1} className="mn-card flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-[var(--mn-border-gold)] shadow-2xl sm:rounded-3xl">
            <div className="mn-search-hero flex items-center justify-between p-4 text-white mn-inverse">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mn-border-gold)] bg-white/10 text-[var(--mn-accent-soft)]"><Bell className="h-4 w-4" /></span>
                <div>
                  <h2 className="flex items-center gap-1.5 text-sm font-bold text-white">مركز التنبيهات{unreadCount > 0 && <span className="rounded-full bg-[var(--mn-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--mn-on-accent)] mn-gold">{unreadCount} جديد</span>}</h2>
                  <p className="text-[10px] text-[var(--mn-on-dark-muted)]">منح، جامعات، دورات ومواعيد مهمة</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setSoundEnabled((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 hover:bg-white/10" aria-label={soundEnabled ? 'كتم صوت التنبيهات' : 'تفعيل صوت التنبيهات'} title={soundEnabled ? 'صوت التنبيهات مفعل' : 'صوت التنبيهات صامت'}>{soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
                <button type="button" aria-label="إغلاق" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 hover:bg-white/10"><X className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-[var(--mn-border)] bg-[var(--mn-surface-muted)] p-2.5">
              <button type="button" onClick={onTriggerTestPush} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[var(--mn-accent)] px-2.5 text-[10px] font-semibold text-[var(--mn-on-accent)] mn-gold"><Send className="h-3.5 w-3.5" />تجربة تنبيه</button>
              {unreadCount > 0 && <button type="button" onClick={onMarkAllAsRead} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--mn-heading)]"><CheckCheck className="h-3.5 w-3.5" />تحديد الكل كمقروء</button>}
            </div>

            <div className="flex gap-1.5 overflow-x-auto border-b border-[var(--mn-border)] bg-[var(--mn-surface-muted)]/70 p-2 hide-scrollbar">
              {FILTERS.map((item) => {
                const Icon = item.icon;
                return <button type="button" key={item.id} onClick={() => setFilter(item.id)} aria-pressed={filter === item.id} className={`mn-filter-chip inline-flex items-center gap-1 whitespace-nowrap ${filter === item.id ? 'is-selected' : ''}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>;
              })}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {filteredNotifications.length === 0 ? <div className="py-12 text-center text-xs text-[var(--mn-text-muted)]">لا توجد تنبيهات في هذا التصنيف حاليًا.</div> : filteredNotifications.map((notification) => {
                const Icon = typeIcon(notification);
                return (
                  <button type="button" key={notification.id} onClick={() => { onMarkAsRead(notification.id); if (notification.actionType) { onSelectAction?.(notification.actionType, notification.targetId); onClose(); } }} className={`w-full rounded-2xl border p-3 text-right transition ${notification.read ? 'border-[var(--mn-border)] bg-[var(--mn-surface)]' : 'border-[var(--mn-border-gold)] bg-[var(--mn-gold-surface)]/50 shadow-sm'}`}>
                    <div className="flex items-start gap-2.5">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${notification.read ? 'border-[var(--mn-border)] bg-[var(--mn-surface-muted)] text-[var(--mn-text-muted)]' : 'border-[var(--mn-border-gold)] bg-[var(--mn-primary)] text-[var(--mn-accent-soft)] mn-inverse'}`}><Icon className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h4 className="text-xs font-semibold leading-snug text-[var(--mn-heading)]">{notificationTitle(notification.title)}</h4><span className="whitespace-nowrap text-[9px] text-[var(--mn-text-muted)]">{notification.timestamp}</span></div><p className="mt-1 text-[11px] leading-5 text-[var(--mn-text-muted)]">{notification.body}</p>{notification.actionType && <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--mn-accent-text)]">عرض التفاصيل<ChevronLeft className="mn-card-arrow h-3.5 w-3.5" /></span>}</div>
                      {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--mn-accent)]" aria-label="غير مقروء" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
