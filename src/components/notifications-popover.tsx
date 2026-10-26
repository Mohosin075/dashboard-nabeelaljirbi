'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';
import { clinicService, type ClinicNotificationItem } from '@/services/clinic.service';
import { adminService, type AdminStats } from '@/services/admin.service';
import {
  Bell,
  RefreshCw,
  Inbox,
  Clock,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Building2,
  Receipt,
  MessageSquareWarning,
  CheckCheck,
} from 'lucide-react';

interface AdminAlert {
  id: string;
  title: string;
  count: number;
  desc: string;
  href: string;
  icon: any;
  badgeClass: string;
}

export default function NotificationsPopover() {
  const router = useRouter();
  const { t, language, isRTL } = useLanguage();
  const role = useAuthStore((state) => state.role);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<ClinicNotificationItem[]>([]);
  const [adminAlerts, setAdminAlerts] = useState<AdminAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const formatTimeAgo = useCallback(
    (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return language === 'ar' ? 'الآن' : 'Just now';
      }
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return language === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;
      }
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return language === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
      }
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return language === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;
      }

      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    },
    [language]
  );

  const fetchClinicNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await clinicService.getNotifications({ limit: 8 });
      const items = res?.data?.data || [];
      setNotifications(items);
      const unread = items.filter((item) => !item.isRead).length;
      setUnreadCount(unread);
    } catch {
      // Keep existing items on failure
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getStats();
      const stats: AdminStats = res?.data || ({} as AdminStats);

      const alerts: AdminAlert[] = [];
      let totalUnread = 0;

      if ((stats.pendingSettlements || 0) > 0) {
        alerts.push({
          id: 'settlements',
          title: language === 'ar' ? 'طلبات تسوية معلقة' : 'Pending Settlements',
          count: stats.pendingSettlements || 0,
          desc:
            language === 'ar'
              ? `${stats.pendingSettlements} طلب سحب بانتظار المعالجة`
              : `${stats.pendingSettlements} withdrawal requests pending review`,
          href: '/dashboard/settlements',
          icon: Receipt,
          badgeClass: 'bg-emerald-100 text-emerald-800',
        });
        totalUnread += stats.pendingSettlements || 0;
      }

      if ((stats.pendingVerifications || 0) > 0) {
        alerts.push({
          id: 'verifications',
          title: language === 'ar' ? 'توثيق عيادات بانتظار الاعتماد' : 'Pending Clinic Verifications',
          count: stats.pendingVerifications || 0,
          desc:
            language === 'ar'
              ? `${stats.pendingVerifications} عيادة تنتظر اعتماد الحساب`
              : `${stats.pendingVerifications} clinics awaiting account approval`,
          href: '/dashboard/clinics',
          icon: Building2,
          badgeClass: 'bg-amber-100 text-amber-800',
        });
        totalUnread += stats.pendingVerifications || 0;
      }

      if ((stats.openComplaints || 0) > 0) {
        alerts.push({
          id: 'complaints',
          title: language === 'ar' ? 'شكاوى مستخدمين مفتوحة' : 'Open User Complaints',
          count: stats.openComplaints || 0,
          desc:
            language === 'ar'
              ? `${stats.openComplaints} شكوى تتطلب المتابعة والحل`
              : `${stats.openComplaints} complaints requiring resolution`,
          href: '/dashboard/complaints',
          icon: MessageSquareWarning,
          badgeClass: 'bg-rose-100 text-rose-800',
        });
        totalUnread += stats.openComplaints || 0;
      }

      if ((stats.pendingBookings || 0) > 0) {
        alerts.push({
          id: 'bookings',
          title: language === 'ar' ? 'حجوزات بانتظار التأكيد' : 'Pending Bookings',
          count: stats.pendingBookings || 0,
          desc:
            language === 'ar'
              ? `${stats.pendingBookings} حجز قيد المعالجة`
              : `${stats.pendingBookings} appointments awaiting confirmation`,
          href: '/dashboard/bookings',
          icon: CalendarCheck,
          badgeClass: 'bg-blue-100 text-blue-800',
        });
        totalUnread += stats.pendingBookings || 0;
      }

      setAdminAlerts(alerts);
      setUnreadCount(totalUnread);
    } catch {
      // Silently catch stats error
    } finally {
      setLoading(false);
    }
  }, [language]);

  const refreshData = useCallback(() => {
    if (role === 'ADMIN') {
      fetchAdminAlerts();
    } else {
      fetchClinicNotifications();
    }
  }, [role, fetchAdminAlerts, fetchClinicNotifications]);

  useEffect(() => {
    refreshData();
    // Poll every 45 seconds for real-time updates
    const timer = setInterval(() => {
      refreshData();
    }, 45000);
    return () => clearInterval(timer);
  }, [refreshData]);

  const handleNotificationClick = (_item?: ClinicNotificationItem) => {
    setIsOpen(false);
    router.push('/dashboard/notifications');
  };

  const handleAlertClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-gray-600 hover:bg-slate-100 hover:text-gray-900 transition-colors focus-visible:ring-1 focus-visible:ring-blue-500"
          aria-label={t('notifications', 'Notifications')}
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />

          {unreadCount > 0 && (
            <>
              {/* Subtle Pulsing Halo */}
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
              </span>

              {/* Dynamic Badge Count */}
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={isRTL ? 'start' : 'end'}
        sideOffset={8}
        className="w-80 sm:w-96 p-0 shadow-xl rounded-xl border border-slate-200 bg-white overflow-hidden z-50 animate-in fade-in-0 zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-sm text-slate-900">
              {t('notifications', 'Notifications')}
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                {unreadCount} {language === 'ar' ? 'جديد' : 'New'}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              refreshData();
            }}
            disabled={loading}
            className="h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg"
            title={language === 'ar' ? 'تحديث الإشعارات' : 'Refresh notifications'}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </Button>
        </div>

        {/* List Content */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
          {loading && (notifications.length === 0 && adminAlerts.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-xs">{language === 'ar' ? 'جاري التحميل...' : 'Loading alerts...'}</span>
            </div>
          ) : role === 'ADMIN' ? (
            /* Admin Alerts List */
            adminAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCheck className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  {language === 'ar' ? 'كل شيء على ما يرام' : 'All caught up!'}
                </h4>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  {language === 'ar'
                    ? 'لا توجد إجراءات معلقة أو شكاوى بانتظار المراجعة.'
                    : 'No pending actions, settlements, or complaints require attention.'}
                </p>
              </div>
            ) : (
              adminAlerts.map((alert) => {
                const IconComponent = alert.icon;
                return (
                  <div
                    key={alert.id}
                    onClick={() => handleAlertClick(alert.href)}
                    className="flex items-start gap-3 p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {alert.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${alert.badgeClass}`}>
                          {alert.count}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 line-clamp-1">{alert.desc}</p>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Clinic Notifications List */
            notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <Inbox className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications yet'}
                </h4>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  {language === 'ar'
                    ? 'ستظهر هنا التنبيهات الخاصة بالحجوزات والمواعيد الجديدة.'
                    : "You'll see alerts for new bookings and appointments here."}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 cursor-pointer transition-colors relative group ${
                    !item.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {/* Unread blue dot indicator */}
                  {!item.isRead && (
                    <span className="absolute top-4 ltr:left-1.5 rtl:right-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}

                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      !item.isRead
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </span>
                      {item.status && (
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            item.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>

                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/60 p-2 text-center">
          <Link
            href={role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/notifications'}
            onClick={() => setIsOpen(false)}
            className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 rounded-lg transition-colors"
          >
            <span>
              {role === 'ADMIN'
                ? language === 'ar'
                  ? 'لوحة التحكم الإدارية'
                  : 'Go to Admin Control Center'
                : language === 'ar'
                ? 'عرض جميع الإشعارات'
                : 'View all notifications'}
            </span>
            <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
