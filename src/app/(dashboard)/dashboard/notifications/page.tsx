'use client';

import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { clinicService, type ClinicNotificationItem } from '@/services/clinic.service';
import {
  Bell,
  Clock,
  Search,
  RefreshCw,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ClinicNotificationsPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<ClinicNotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await clinicService.getNotifications({ limit: 50 });
      setNotifications(res?.data?.data || []);
    } catch (err: any) {
      toast({
        title: t('error', 'Error'),
        description: err?.response?.data?.message || t('failedToLoadNotifications', 'Failed to load notifications'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (filterType === 'UNREAD' && item.isRead) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return item.title?.toLowerCase().includes(q) || item.body?.toLowerCase().includes(q);
    });
  }, [notifications, searchQuery, filterType]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t('clinicNotifications', 'Clinic Notifications')}
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-blue-600 text-white">
                {unreadCount} {t('unread', 'Unread')}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              'notificationsSubtitle',
              'Real-time alerts for incoming bookings, doctor schedule updates, and system events.'
            )}
          </p>
        </div>

        <Button
          onClick={fetchNotifications}
          variant="outline"
          size="sm"
          disabled={loading}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('refresh', 'Refresh')}</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchNotifications', 'Search alerts...')}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rtl:pl-4 rtl:pr-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant={filterType === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilterType('ALL')}
            className={filterType === 'ALL' ? 'bg-blue-600 text-white' : ''}
          >
            {t('all', 'All')} ({notifications.length})
          </Button>
          <Button
            size="sm"
            variant={filterType === 'UNREAD' ? 'default' : 'outline'}
            onClick={() => setFilterType('UNREAD')}
            className={filterType === 'UNREAD' ? 'bg-blue-600 text-white' : ''}
          >
            {t('unreadOnly', 'Unread Only')} ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Notifications Feed */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
          <Inbox className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-3 text-base font-semibold text-gray-900">
            {t('noNotifications', 'No Notifications Found')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('noNotificationsDesc', 'You have no alerts matching the current filter.')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
                !item.isRead
                  ? 'border-blue-200 bg-blue-50/40'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      !item.isRead
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">{item.body}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
