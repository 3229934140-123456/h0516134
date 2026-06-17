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
  Trophy, TrendingUp, ChevronDown, X, BarChart3, PieChart, Sparkles,
  Award, ArrowUpRight, ArrowDownRight, Minus
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

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  const [y, m] = key.split('-');
  return `${parseInt(m)}月`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [allCards, setAllCards] = useState<TC[]>([]);
  const [rawStars, setRawStars] = useState<MonthlyStar[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const { dataVersion, actions } = useAppStore();

  const [deptFilter, setDeptFilter] = useState<Department | '全部'>('全部');
  const [typeFilter, setTypeFilter] = useState<ThanksType | '全部'>('全部');
  const [timeFilter, setTimeFilter] = useState<TimeRange>('all');
  const [anonFilter, setAnonFilter] = useState<AnonymousFilter>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [showTrend, setShowTrend] = useState(true);

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
        setRawStars(s);
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

  const hasActiveFilters = deptFilter !== '全部' || typeFilter !== '全部' || timeFilter !== 'all' || anonFilter !== 'all';

  const displayStars: MonthlyStar[] = useMemo(() => {
    if (!hasActiveFilters) return rawStars;

    const counts: Record<string, number> = {};
    filteredCards.forEach(c => {
      counts[c.receiverId] = (counts[c.receiverId] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([userId, thanksCount]) => ({ userId, thanksCount }))
      .sort((a, b) => b.thanksCount - a.thanksCount)
      .slice(0, 3);

    if (sorted.length === 0) return [];

    return sorted.map((item, idx) => ({
      id: `filtered-star-${idx}`,
      userId: item.userId,
      month: '筛选期',
      rank: (idx + 1) as 1 | 2 | 3,
      thanksCount: item.thanksCount,
      quote: idx === 0 ? '筛选期内收到感谢最多！' : idx === 1 ? '表现亮眼！' : '继续加油！',
    }));
  }, [rawStars, hasActiveFilters, filteredCards]);

  const starsLabel = useMemo(() => {
    if (!hasActiveFilters) return null;
    if (filteredCards.length === 0) return null;
    return '筛选期感谢之星';
  }, [hasActiveFilters, filteredCards.length]);

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
      .slice(0, 5);
  }, [users, memberStats]);

  const monthlyTrend = useMemo(() => {
    const groups: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(d.toISOString());
      groups[key] = 0;
    }
    filteredCards.forEach(c => {
      const key = getMonthKey(c.createdAt);
      if (key in groups) groups[key]++;
    });
    return Object.entries(groups).map(([k, v]) => ({ key, label: getMonthLabel(k), count: v }));
  }, [filteredCards]);

  const typeDistribution = useMemo(() => {
    const counts: Record<ThanksType, number> = {
      '协作互助': 0, '解决难题': 0, '超越期待': 0, '导师指导': 0, '创新贡献': 0,
    };
    filteredCards.forEach(c => {
      counts[c.type]++;
    });
    const total = filteredCards.length || 1;
    return (Object.keys(counts) as ThanksType[]).map(t => ({
      type: t,
      count: counts[t],
      pct: Math.round((counts[t] / total) * 100),
    })).sort((a, b) => b.count - a.count);
  }, [filteredCards]);

  const uniqueReceiverCount = useMemo(() => {
    const ids = new Set(filteredCards.map(c => c.receiverId));
    return ids.size;
  }, [filteredCards]);

  const uniqueSenderCount = useMemo(() => {
    const ids = new Set(filteredCards.map(c => c.senderId));
    return ids.size;
  }, [filteredCards]);

  const maxTrendCount = useMemo(() => {
    const m = Math.max(...monthlyTrend.map(m => m.count), 1);
    return m;
  }, [monthlyTrend]);

  const resetFilters = () => {
    setDeptFilter('全部');
    setTypeFilter('全部');
    setTimeFilter('all');
    setAnonFilter('all');
  };

  const allTypes: (ThanksType | '全部')[] = ['全部', '协作互助', '解决难题', '超越期待', '导师指导', '创新贡献'];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {starsLabel ? (
        <div className="relative">
          <MonthlyStarsBanner stars={displayStars} userMap={userMap} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="px-3 py-1 rounded-full bg-purple-500/90 text-white text-xs font-bold shadow-md backdrop-blur-sm flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              {starsLabel}（共 {filteredCards.length} 张）
            </span>
          </div>
        </div>
      ) : (
        <MonthlyStarsBanner stars={displayStars} userMap={userMap} />
      )}

      {showTrend && filteredCards.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-br from-cream via-white to-champagne-50 border border-champagne-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 className="heading-serif text-xl text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-champagne-600" />
              数据洞察
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-champagne-100 text-champagne-700 text-xs font-semibold">
                {hasActiveFilters ? '筛选范围' : '全站数据'}
              </span>
            </h3>
            <button
              onClick={() => setShowTrend(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 rounded-2xl bg-white/80 p-5 border border-champagne-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  近6个月感谢卡趋势
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold-gradient" />
                    感谢卡数量
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between h-40 gap-2">
                {monthlyTrend.map((m, idx) => {
                  const hPct = (m.count / maxTrendCount) * 100;
                  const isLast = idx === monthlyTrend.length - 1;
                  return (
                    <div key={m.key} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-champagne-600">{m.count}</span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? 'bg-gold-gradient' : 'bg-gradient-to-t from-champagne-300 to-champagne-400'}`}
                          style={{ height: `${Math.max(hPct, 4)}%` }}
                        />
                      </div>
                      <span className={`text-xs ${isLast ? 'font-bold text-gray-700' : 'text-gray-500'}`}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white/80 p-5 border border-champagne-100">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-purple-500" />
                  感谢类型分布
                </p>
                <div className="space-y-2.5">
                  {typeDistribution.map(t => {
                    const cfg = THANKS_TYPE_CONFIG[t.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={t.type} className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">{cfg.label}</span>
                            <span className="text-xs font-bold text-gray-600">{t.count}张</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cfg.bg} transition-all duration-700`}
                              style={{ width: `${t.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 p-4 border border-pink-200">
                  <p className="text-xs text-pink-700 mb-1">被感谢人数</p>
                  <p className="heading-serif text-2xl text-pink-800 flex items-center gap-1">
                    {uniqueReceiverCount}
                    <span className="text-xs font-normal">人</span>
                  </p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
                  <p className="text-xs text-blue-700 mb-1">发出人次</p>
                  <p className="heading-serif text-2xl text-blue-800 flex items-center gap-1">
                    {uniqueSenderCount}
                    <span className="text-xs font-normal">人</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {topReceivers.length > 0 && (
            <div className="mt-5 pt-5 border-t border-champagne-100">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-600" />
                筛选期感谢榜 Top5
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {topReceivers.map((item, idx) => {
                  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                  const isTop3 = idx < 3;
                  return (
                    <button
                      key={item.user.id}
                      onClick={() => navigate(`/profile/${item.user.id}`)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl transition-all group text-left
                        ${isTop3
                          ? 'bg-gradient-to-br from-champagne-50 to-yellow-50 border border-champagne-200 hover:shadow-md'
                          : 'bg-white border border-gray-100 hover:border-champagne-200'
                        }`}
                    >
                      <span className="text-lg">{medals[idx]}</span>
                      <img
                        src={item.user.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">{item.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{item.user.department}</p>
                      </div>
                      <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">
                        <Heart className="w-2.5 h-2.5" />
                        {item.count}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!showTrend && (
        <button
          onClick={() => setShowTrend(true)}
          className="w-full py-3 rounded-2xl bg-champagne-50 hover:bg-champagne-100 text-champagne-700 text-sm font-medium flex items-center justify-center gap-2 transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          展开数据洞察
        </button>
      )}

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
