import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { THANKS_TYPE_CONFIG, formatDate } from '@/lib/constants';
import { MonthlyStarsBanner } from '@/components/MonthlyStarsBanner';
import { RecognitionCarousel } from '@/components/RecognitionCarousel';
import { ThanksCard } from '@/components/ThanksCard';
import {
  Send, Filter, Heart, Calendar, Building2, Users, EyeOff, Eye,
  Trophy, TrendingUp, ChevronDown, X
} from 'lucide-react';
import type {
  User, ThanksCard as TC, MonthlyStar, Recognition, ThanksType, Department,
} from '@shared/types';

type TimeRange = 'all' | 'today' | 'week' | 'month' | 'quarter';
type AnonymousFilter = 'all' | 'anonymous' | 'named';

const TIME_RANGES: Array<{ k: TimeRange; label: string }> = [
  { k: 'all', label: '全部时间' },
  { k: 'today', label: '今天' },
  { k: 'week', label: '本周' },
  { k: 'month', label: '本月' },
  { k: 'quarter', label: '本季度' },
];

const ANONYMOUS_FILTERS: Array<{ k: AnonymousFilter; label: string; icon: typeof Eye }> = [
  { k: 'all', label: '全部', icon: Eye },
  { k: 'anonymous', label: '仅匿名', icon: EyeOff },
  { k: 'named', label: '仅实名', icon: Eye },
];

const ALL_DEPTS: (Department | '全部')[] = ['全部', '技术部', '产品部', '设计部', '市场部', '运营部', '人力资源部'];

function isInTimeRange(dateStr: string, range: TimeRange): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'all':
      return true;
    case 'today':
      return d.toDateString() === now.toDateString();
    case 'week':
      start.setDate(now.getDate() - 7);
      return d >= start;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return d >= start;
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3) * 3;
      start.setMonth(q, 1);
      start.setHours(0, 0, 0, 0);
      return d >= start;
    }
    default:
      return true;
  }
}

export default function HomePage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [allCards, setAllCards] = useState<TC[]>([]);
  const [stars, setStars] = useState<MonthlyStar[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const { dataVersion, actions } = useAppStore();

  const [deptFilter, setDeptFilter] = useState<Department | '全部'>('全部');
  const [typeFilter, setTypeFilter] = useState<ThanksType | '全部'>('全部');
  const [timeFilter, setTimeFilter] = useState<TimeRange>('all');
  const [anonFilter, setAnonFilter] = useState<AnonymousFilter>('all');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [u, c, s, r] = await Promise.all([
          api.users.list(),
          api.thanksCards.list(),
          api.monthlyStars.list(),
          api.recognitions.list(),
        ]);
        setUsers(u);
        setAllCards(c);
        setStars(s);
        setRecognitions(r);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [dataVersion]);

  const userMap: Record<string, User> = useMemo(() => {
    const m: Record<string, User> = {};
    users.forEach(u => m[u.id] = u);
    return m;
  }, [users]);

  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      if (typeFilter !== '全部' && card.type !== typeFilter) return false;
      if (anonFilter === 'anonymous' && !card.isAnonymous) return false;
      if (anonFilter === 'named' && card.isAnonymous) return false;
      if (!isInTimeRange(card.createdAt, timeFilter)) return false;

      const receiver = userMap[card.receiverId];
      const sender = userMap[card.senderId];
      if (deptFilter !== '全部') {
        const receiverMatch = receiver?.department === deptFilter;
        const senderMatch = sender?.department === deptFilter;
        if (!receiverMatch && !senderMatch) return false;
      }

      return true;
    });
  }, [allCards, typeFilter, anonFilter, timeFilter, deptFilter, userMap]);

  const memberStats = useMemo(() => {
    const stats: Record<string, { received: number; sent: number }> = {};
    users.forEach(u => {
      stats[u.id] = { received: 0, sent: 0 };
    });
    filteredCards.forEach(c => {
      if (stats[c.receiverId]) stats[c.receiverId].received++;
      if (stats[c.senderId]) stats[c.senderId].sent++;
    });
    return stats;
  }, [filteredCards, users]);

  const topReceivers = useMemo(() => {
    return users
      .map(u => ({ user: u, count: memberStats[u.id]?.received || 0 }))
      .filter(x => x.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [users, memberStats]);

  const hasActiveFilters = deptFilter !== '全部' || typeFilter !== '全部' || timeFilter !== 'all' || anonFilter !== 'all';

  const resetFilters = () => {
    setDeptFilter('全部');
    setTypeFilter('全部');
    setTimeFilter('all');
    setAnonFilter('all');
  };

  const allTypes: (ThanksType | '全部')[] = ['全部', '协作互助', '解决难题', '超越期待', '导师指导', '创新贡献'];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <MonthlyStarsBanner stars={stars} userMap={userMap} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
              <div>
                <h3 className="heading-serif text-xl text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  团队荣誉墙
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-champagne-100 text-champagne-600 text-xs font-semibold">
                    {filteredCards.length} 张感谢卡
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">每一份感谢都值得被看见</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5
                    ${showFilters ? 'bg-champagne-100 text-champagne-700' : 'bg-warmGray text-gray-600 hover:bg-champagne-50'}`}
                >
                  <Filter className="w-4 h-4" />
                  筛选
                  {hasActiveFilters && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/send-thanks')}
                  className="btn-gold flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  发送感谢卡
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mb-6 p-5 bg-gradient-to-br from-champagne-50/60 to-pink-50/40 rounded-2xl border border-champagne-100 space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-champagne-500" />
                    筛选条件
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-gray-500 hover:text-champagne-600 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      重置
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> 部门筛选
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {ALL_DEPTS.map(d => {
                      const active = deptFilter === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setDeptFilter(d)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                            ${active
                              ? 'bg-jade-500 text-white shadow-sm'
                              : 'bg-white text-gray-600 hover:bg-jade-50 border border-gray-200'
                            }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> 感谢类型
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {allTypes.map(type => {
                      const active = typeFilter === type;
                      const cfg = type !== '全部' ? THANKS_TYPE_CONFIG[type] : null;
                      return (
                        <button
                          key={type}
                          onClick={() => setTypeFilter(type)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5
                            ${active
                              ? 'bg-gold-gradient text-white shadow-sm'
                              : 'bg-white text-gray-600 hover:bg-champagne-50 border border-gray-200'
                            }`}
                        >
                          {cfg && <cfg.icon className="w-3 h-3" />}
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> 时间范围
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {TIME_RANGES.map(t => {
                        const active = timeFilter === t.k;
                        return (
                          <button
                            key={t.k}
                            onClick={() => setTimeFilter(t.k)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                              ${active
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                              }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> 匿名设置
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {ANONYMOUS_FILTERS.map(f => {
                        const active = anonFilter === f.k;
                        const Icon = f.icon;
                        return (
                          <button
                            key={f.k}
                            onClick={() => setAnonFilter(f.k)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1
                              ${active
                                ? f.k === 'anonymous'
                                  ? 'bg-purple-500 text-white'
                                  : f.k === 'named'
                                    ? 'bg-champagne-500 text-white'
                                    : 'bg-gray-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                              }`}
                          >
                            <Icon className="w-3 h-3" />
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="masonry">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="masonry-item">
                    <div className="h-40 bg-warmGray rounded-2xl animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredCards.length > 0 ? (
              <div className="masonry animate-stagger">
                {filteredCards.map(card => (
                  <div key={card.id} className="masonry-item">
                    <ThanksCard
                      card={card}
                      sender={userMap[card.senderId]}
                      receiver={userMap[card.receiverId]}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无符合条件的感谢卡</p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-3 text-sm text-champagne-600 hover:underline"
                  >
                    清除筛选条件
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <RecognitionCarousel items={recognitions} userMap={userMap} />

          {hasActiveFilters && topReceivers.length > 0 && (
            <div className="rounded-3xl bg-gradient-to-br from-champagne-50 to-pink-50 p-6 border border-champagne-200 shadow-sm">
              <h3 className="heading-serif text-lg text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-champagne-600" />
                筛选期 Top 榜
              </h3>
              <div className="space-y-3">
                {topReceivers.map((item, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <button
                      key={item.user.id}
                      onClick={() => navigate(`/profile/${item.user.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/80 hover:bg-white transition-all group text-left"
                    >
                      <span className="text-2xl w-8 text-center">{medals[idx]}</span>
                      <img
                        src={item.user.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">{item.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{item.user.department} · {item.user.position}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">
                        <Heart className="w-3 h-3" />
                        {item.count}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
            <h3 className="heading-serif text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-jade-600" />
              团队成员
              <span className="ml-auto text-xs text-gray-400 font-normal">{users.length} 人</span>
            </h3>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
              {users
                .slice()
                .sort((a, b) => (memberStats[b.id]?.received || 0) - (memberStats[a.id]?.received || 0))
                .map(user => {
                  const received = memberStats[user.id]?.received || 0;
                  return (
                    <button
                      key={user.id}
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-champagne-50 transition-all group text-left"
                    >
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.department} · {user.position}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 text-pink-500 text-xs font-semibold">
                        <Heart className="w-3 h-3" />
                        {received}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
