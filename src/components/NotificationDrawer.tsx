import { useEffect, useState } from 'react';
import { X, CheckCheck, Heart, Award, Trophy, MessageCircleHeart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { formatTime } from '@/lib/constants';
import type { Notification, NotificationType } from '@shared/types';

const NOTIF_ICONS: Record<NotificationType, { icon: typeof Heart; color: string; bg: string }> = {
  thanks_received: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100' },
  thanks_sent: { icon: MessageCircleHeart, color: 'text-champagne-600', bg: 'bg-champagne-100' },
  recognition_received: { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  recognition_broadcast: { icon: Award, color: 'text-jade-600', bg: 'bg-jade-100' },
  monthly_star: { icon: Trophy, color: 'text-champagne-600', bg: 'bg-champagne-100' },
};

export function NotificationDrawer() {
  const navigate = useNavigate();
  const { showNotificationDrawer, actions, currentUser } = useAppStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showNotificationDrawer) fetchData();
  }, [showNotificationDrawer, currentUser]);

  const handleRead = async (id: string) => {
    await api.notifications.read(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    actions.setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleReadAll = async () => {
    await api.notifications.readAll();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    actions.setUnreadCount(0);
  };

  const handleClick = (n: Notification) => {
    handleRead(n.id);
    actions.toggleNotificationDrawer(false);
    if (n.type === 'recognition_broadcast' || n.type === 'monthly_star') {
      navigate('/');
    } else if (n.type === 'recognition_received' || n.type === 'thanks_received' || n.type === 'thanks_sent') {
      navigate(`/profile/${currentUser?.id}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {showNotificationDrawer && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => actions.toggleNotificationDrawer(false)}
        />
      )}
      <div
        className={`fixed right-0 top-0 h-full w-[420px] max-w-full bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-out
          ${showNotificationDrawer ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-champagne-100 bg-gradient-to-br from-cream to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="heading-serif text-xl text-gray-800">消息中心</h3>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount > 0 ? (
                  <span className="text-red-500 font-medium">{unreadCount} 条未读</span>
                ) : (
                  <span>暂无新消息</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleReadAll}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-champagne-600 hover:bg-champagne-50 font-medium transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  全部已读
                </button>
              )}
              <button
                onClick={() => actions.toggleNotificationDrawer(false)}
                className="p-2 rounded-lg hover:bg-warmGray transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-warmGray rounded-2xl animate-pulse" />
            ))
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-20 h-20 rounded-full bg-warmGray flex items-center justify-center mb-4">
                <MessageCircleHeart className="w-10 h-10 opacity-50" />
              </div>
              <p className="font-medium">还没有任何消息</p>
            </div>
          ) : (
            <div className="space-y-3 animate-stagger">
              {notifications.map(n => {
                const cfg = NOTIF_ICONS[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all group
                      ${n.isRead
                        ? 'bg-warmGray/30 hover:bg-warmGray'
                        : 'bg-champagne-50/60 hover:bg-champagne-50 border border-champagne-100 shadow-sm'
                      }`}
                  >
                    {!n.isRead && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
