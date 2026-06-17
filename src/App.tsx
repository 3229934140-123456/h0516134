import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/lib/api';
import HomePage from '@/pages/HomePage';
import SendThanksPage from '@/pages/SendThanksPage';
import RecognitionPage from '@/pages/RecognitionPage';
import ProfilePage from '@/pages/ProfilePage';
import HRAnalyticsPage from '@/pages/HRAnalyticsPage';
import NotificationsPage from '@/pages/NotificationsPage';

function AppRoutes() {
  const { currentUser, actions } = useAppStore();

  useEffect(() => {
    const initUser = async () => {
      const savedId = localStorage.getItem('currentUserId');
      if (savedId) {
        try {
          const user = await api.users.get(savedId);
          actions.setCurrentUser(user);
        } catch {
          localStorage.removeItem('currentUserId');
        }
      }
    };
    initUser();
  }, [actions]);

  useEffect(() => {
    const fetchUnread = async () => {
      if (currentUser) {
        try {
          const { count } = await api.notifications.unreadCount();
          actions.setUnreadCount(count);
        } catch { /* ignore */ }
      }
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 15000);
    return () => clearInterval(id);
  }, [currentUser, actions]);

  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/send-thanks" element={<Layout><SendThanksPage /></Layout>} />
      <Route
        path="/recognition"
        element={
          currentUser?.role === 'manager' ? (
            <Layout><RecognitionPage /></Layout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="/profile/:userId" element={<Layout><ProfilePage /></Layout>} />
      <Route
        path="/hr-analytics"
        element={
          currentUser && (currentUser.role === 'hr' || currentUser.role === 'manager') ? (
            <Layout><HRAnalyticsPage /></Layout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
