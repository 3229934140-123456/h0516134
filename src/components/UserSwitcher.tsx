import { useEffect, useState } from 'react';
import { Crown, Users, X, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { ROLE_LABEL } from '@/lib/constants';
import type { User, Department } from '@shared/types';

export function UserSwitcher({ onClose }: { onClose?: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [deptFilter, setDeptFilter] = useState<Department | '全部'>('全部');
  const [loading, setLoading] = useState(true);
  const { actions } = useAppStore();
  const departments: (Department | '全部')[] = ['全部', '技术部', '产品部', '设计部', '市场部', '运营部', '人力资源部'];

  useEffect(() => {
    api.users.list().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filteredUsers = deptFilter === '全部' ? users : users.filter(u => u.department === deptFilter);

  const handleSelect = (user: User) => {
    localStorage.setItem('currentUserId', user.id);
    actions.setCurrentUser(user);
    window.location.reload();
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden gold-border animate-fade-in-up">
      <div className="p-6 bg-gradient-to-br from-champagne-50 via-cream to-white border-b border-champagne-100 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold-lg animate-float">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="heading-serif text-2xl text-jade-600">欢迎来到荣耀墙</h2>
              <p className="text-sm text-gray-500 mt-1">请选择您的身份以继续</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-warmGray transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${deptFilter === d
                  ? 'bg-gold-gradient text-white shadow-gold'
                  : 'bg-white text-gray-600 border border-champagne-100 hover:border-champagne-300'
                }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-warmGray rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 animate-stagger">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-warmGray/50 hover:bg-champagne-50 border-2 border-transparent hover:border-champagne-200 transition-all group text-left"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full border-3 border-white shadow-md"
                  />
                  {user.role === 'manager' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-gradient flex items-center justify-center text-[10px] shadow-md">
                      👑
                    </div>
                  )}
                  {user.role === 'hr' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-jade-gradient flex items-center justify-center text-[10px] shadow-md">
                      📋
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-champagne-100 text-[11px] font-medium text-champagne-600 mr-1.5">
                      <Users className="w-3 h-3" />
                      {ROLE_LABEL[user.role]}
                    </span>
                    {user.department} · {user.position}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-champagne-300 group-hover:text-champagne-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-cream border-t border-champagne-50 text-center">
        <p className="text-xs text-gray-400">
          💡 提示：您可以通过左下角的头像随时切换用户身份来体验不同角色的功能
        </p>
      </div>
    </div>
  );
}
