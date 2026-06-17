import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox, Heart, Send, Trophy, Award, Star,
  CheckCheck, BellRing, MessageCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatTime } from '@/lib/constants';
import type { Notification, NotificationType } from '@shared/types';

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Heart; label: string; gradient: string; text: string }> = {
  thanks_received: { icon: Heart, label: '收到感谢', gradient: 'from-pink-100 to-pink-200', text: 'text-pink-600' },
  thanks_sent: { icon: Send, label: '已发送', gradient: 'from-champagne-100 to-champagne-200', text: 'text-champagne-600' },
  recognition_received: { icon: Trophy, label: '获得表彰', gradient: 'from-yellow-100 to-yellow-200', text: 'text-yellow-700' },
  recognition_broadcast: { icon: Award, label: '表彰通告', gradient: 'from-jade-100 to-jade-200', text: 'text-jade-700' },
  monthly_star: { icon: Star, label: '月度之星', gradient: 'from-champagne-200 to-yellow-200', text: 'text-champagne-700' },
};

type FilterType = 'all' | 'unread' | NotificationType;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [marking, setMarking] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleReadAll = async () => {
    setMarking(true);
    await api.notifications.readAll();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setMarking(false);
  };

  const handleRead = async (id: string) => {
    await api.notifications.read(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filters: Array<{ k: FilterType; label: string; icon?: typeof Heart }> = [
    { k: 'all', label: '全部' },
    { k: 'unread', label: '未读', icon: BellRing },
    { k: 'thanks_received', label: '收到感谢', icon: Heart },
    { k: 'thanks_sent', label: '已发送', icon: Send },
    { k: 'recognition_received', label: '我的表彰', icon: Trophy },
    { k: 'recognition_broadcast', label: '表彰通告', icon: Award },
    { k: 'monthly_star', label: '月度之星', icon: Star },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="rounded-3xl bg-gradient-to-br from-champagne-50 via-cream to-pink-50 p-6 mb-6 border border-champagne-100 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="heading-serif text-2xl text-gray-800">消息中心</h1>
              <p className="text-sm text-gray-500 mt-1">
                共 <strong className="text-gray-700">{notifications.length}</strong> 条消息
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                    {unreadCount} 条未读
                  </span>
                )}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleReadAll}
              disabled={marking}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-champagne-100 hover:bg-champagne-200 text-champagne-700 font-semibold text-sm transition-all disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              {marking ? '处理中...' : '全部标为已读'}
            </button>
          )}
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          {filters.map(f => {
            const isSel = filter === f.k;
            const count = f.k === 'all' ? notifications.length
              : f.k === 'unread' ? unreadCount
                : notifications.filter(n => n.type === f.k).length;
            return (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5
                  ${isSel
                    ? 'bg-gold-gradient text-white shadow-gold'
                    : 'bg-white text-gray-600 hover:bg-champagne-50 border border-champagne-100'
                  }`}
              >
                {f.icon && <f.icon className="w-3.5 h-3.5" />}
                {f.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${isSel ? 'bg-white/30 text-white' : 'bg-warmGray text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-champagne-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-warmGray rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-warmGray flex items-center justify-center mb-5">
              <Inbox className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">暂无消息</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter !== 'all' ? '试试切换其他筛选条件' : '当你有新动态时会在这里显示'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-champagne-50 animate-stagger">
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type];
              const Icon = cfg.icon;
              return (
                <Link
                  key={n.id}
                  to={
                    n.type === 'recognition_broadcast' || n.type === 'monthly_star'
                      ? '/'
                      : '/profile/me'
                  }
                  onClick={() => !n.isRead && handleRead(n.id)}
                  className={`flex gap-4 p-5 transition-all group
                    ${n.isRead ? 'hover:bg-warmGray/40' : 'bg-gradient-to-r from-champagne-50/60 via-transparent to-transparent hover:from-champagne-50'}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${cfg.text}`} />
                    </div>
                    {!n.isRead && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`font-semibold ${n.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                          {n.title}
                          {!n.isRead && (
                            <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-red-50 text-red-500 text-[10px] font-bold align-middle">
                              NEW
                            </span>
                          )}
                        </p>
                        <p className={`text-sm mt-1 line-clamp-2 ${n.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                          {n.content}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-full ${cfg.gradient} ${cfg.text} text-[10px] font-bold`}>
                          {cfg.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
