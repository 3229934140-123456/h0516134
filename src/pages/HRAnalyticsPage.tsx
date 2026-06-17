import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Users, Heart, Award, Lightbulb,
  AlertCircle, PieChart, Building2, Sparkles, Target, Eye
} from 'lucide-react';
import { api } from '@/lib/api';
import { THANKS_TYPE_CONFIG, RECOGNITION_LEVEL, formatDate } from '@/lib/constants';
import type {
  User, ThanksType, Department, HRStatsResponse, MonthlyStar, Recognition,
} from '@shared/types';

export default function HRAnalyticsPage() {
  const [stats, setStats] = useState<HRStatsResponse | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [quietUsers, setQuietUsers] = useState<User[]>([]);
  const [stars, setStars] = useState<MonthlyStar[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [s, u, q, st, r] = await Promise.all([
          api.hr.stats(),
          api.users.list(),
          api.hr.quietContributors(),
          api.monthlyStars.list(),
          api.recognitions.list(),
        ]);
        setStats(s);
        setUsers(u);
        setQuietUsers(q as User[]);
        setStars(st);
        setRecognitions(r);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const userMap = useMemo(() => {
    const m: Record<string, User> = {};
    users.forEach(u => m[u.id] = u);
    return m;
  }, [users]);

  const deptTotals = useMemo(() => {
    const m: Record<Department, number> = {
      '技术部': 0, '产品部': 0, '设计部': 0, '市场部': 0, '运营部': 0, '人力资源部': 0,
    };
    users.forEach(u => {
      const stat = stats?.topContributors.find(t => t.userId === u.id);
      if (stat) m[u.department] += stat.received;
    });
    return m;
  }, [users, stats]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-warmGray rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  const typePctBase = Math.max(...Object.values(stats?.thanksByType || {}), 1);
  const deptPctBase = Math.max(...Object.values(stats?.thanksByDepartment || {}), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="rounded-3xl bg-gradient-to-br from-jade-600 via-jade-500 to-jade-700 p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-champagne-300/20 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="heading-serif text-2xl">HR 数据洞察中心</h1>
              <p className="text-white/70 text-sm">基于感谢数据的团队健康度与贡献分析</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Heart, label: '感谢卡总数', value: stats?.totalThanksCards || 0, sub: '累计发出', color: 'from-pink-400 to-pink-500' },
              { icon: Award, label: '正式表彰数', value: stats?.totalRecognitions || 0, sub: '金银铜奖', color: 'from-yellow-400 to-yellow-500' },
              { icon: Users, label: '参与员工数', value: users.filter(u => (stats?.topContributors.find(t => t.userId === u.id)?.received || 0) > 0).length, sub: `/${users.length}人`, color: 'from-blue-400 to-blue-500' },
              { icon: TrendingUp, label: '平均每人', value: (stats?.totalThanksCards! / Math.max(users.length, 1)).toFixed(1), sub: '张感谢卡', color: 'from-champagne-300 to-champagne-500' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2 shadow-md`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/80 text-xs">{s.label}</p>
                <p className="heading-serif text-3xl text-white mt-0.5">
                  {s.value}<span className="text-base font-normal ml-1 text-white/60">{s.sub}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
          <h3 className="heading-serif text-lg text-gray-800 mb-5 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-champagne-500" />
            感谢类型分布
          </h3>
          <div className="space-y-4 animate-stagger">
            {(Object.keys(THANKS_TYPE_CONFIG) as ThanksType[]).map(t => {
              const cfg = THANKS_TYPE_CONFIG[t];
              const count = stats?.thanksByType[t] || 0;
              const pct = (count / typePctBase) * 100;
              const pctDisplay = stats?.totalThanksCards ? ((count / stats.totalThanksCards) * 100).toFixed(1) : '0';
              return (
                <div key={t} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      {cfg.label}
                    </span>
                    <div className="text-right">
                      <span className="heading-serif text-xl text-gray-800">{count}</span>
                      <span className="text-xs text-gray-400 ml-1">({pctDisplay}%)</span>
                    </div>
                  </div>
                  <div className="h-3 bg-warmGray rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cfg.card} rounded-full transition-all duration-1000 border-r-2 border-white shadow-inner`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
          <h3 className="heading-serif text-lg text-gray-800 mb-5 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-jade-600" />
            部门贡献度
          </h3>
          <div className="space-y-3 animate-stagger">
            {(Object.keys(deptTotals) as Department[]).sort((a, b) => deptTotals[b] - deptTotals[a]).map(d => {
              const count = stats?.thanksByDepartment[d] || 0;
              const pct = (count / deptPctBase) * 100;
              const deptUsers = users.filter(u => u.department === d).length;
              const avg = deptUsers ? (count / deptUsers).toFixed(1) : '0';
              const deptColors: Record<Department, string> = {
                '技术部': 'from-blue-400 to-blue-600',
                '产品部': 'from-purple-400 to-purple-600',
                '设计部': 'from-pink-400 to-pink-600',
                '市场部': 'from-orange-400 to-orange-600',
                '运营部': 'from-green-400 to-green-600',
                '人力资源部': 'from-champagne-400 to-champagne-600',
              };
              return (
                <div key={d} className="p-3 rounded-2xl bg-warmGray/50 hover:bg-warmGray transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-700">{d}</span>
                    <div className="text-xs text-gray-500">
                      <span className="font-bold text-gray-700">{count}</span> 次 · 人均 {avg}
                    </div>
                  </div>
                  <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${deptColors[d]} rounded-full transition-all duration-1000`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
        <h3 className="heading-serif text-lg text-gray-800 mb-5 flex items-center gap-2">
          <Target className="w-5 h-5 text-champagne-500" />
          贡献度排行榜 (按收到感谢数)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 animate-stagger">
          {(stats?.topContributors || []).slice(0, 10).map((t, idx) => {
            const u = userMap[t.userId];
            if (!u) return null;
            const medals = ['🥇', '🥈', '🥉'];
            const isStar = stars.find(s => s.userId === u.id);
            return (
              <Link
                key={t.userId}
                to={`/profile/${u.id}`}
                className="relative p-4 rounded-2xl bg-gradient-to-br from-warmGray/70 to-white border border-champagne-100 hover:border-champagne-300 hover:shadow-gold transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="relative">
                    <img src={u.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
                    {idx < 3 && (
                      <span className="absolute -top-2 -right-2 text-2xl animate-bounce-soft">{medals[idx]}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">排名</p>
                    <p className="heading-serif text-2xl text-gray-700">#{idx + 1}</p>
                  </div>
                </div>
                <p className="font-semibold text-sm text-gray-800 truncate">{u.name}</p>
                <p className="text-[11px] text-gray-500 truncate mb-3">{u.department}</p>
                <div className="flex justify-between text-xs border-t border-champagne-50 pt-2">
                  <div>
                    <p className="text-gray-400">收到</p>
                    <p className="font-bold text-pink-600">{t.received} 💝</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">发出</p>
                    <p className="font-bold text-champagne-600">{t.sent}</p>
                  </div>
                </div>
                {isStar && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-jade-50 via-white to-champagne-50 p-6 border border-jade-200 shadow-sm">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="heading-serif text-lg text-gray-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-jade-600" />
                默默耕耘者识别
              </h3>
              <p className="text-sm text-gray-500 mt-1">不善表达但深受同事认可的员工</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-jade-100 text-jade-700 text-xs font-bold">
              ⚠️ 建议重点关注
            </div>
          </div>
          {quietUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">暂未识别到此类员工</div>
          ) : (
            <div className="space-y-3 animate-stagger">
              {quietUsers.map(u => {
                const stat = stats?.topContributors.find(t => t.userId === u.id);
                return (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-jade-50 border border-jade-100 transition-all group"
                  >
                    <div className="relative">
                      <img src={u.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-jade-gradient flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                        <Lightbulb className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.department} · {u.position}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <span className="text-pink-600 font-medium">收到 {stat?.received || 0} 次感谢</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">尚未发出感谢卡</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-semibold">
                        高贡献低表达
                      </div>
                      <button className="flex items-center gap-1 text-xs text-jade-600 font-medium group-hover:text-jade-700">
                        <Eye className="w-3 h-3" />
                        查看详情
                      </button>
                    </div>
                  </Link>
                );
              })}
              <div className="mt-4 p-4 rounded-2xl bg-white/70 border border-jade-100">
                <p className="text-xs text-gray-600 leading-relaxed">
                  💡 <strong className="text-jade-700">绩效评估建议：</strong>
                  这类员工通常是团队的骨干，工作扎实但不善于社交。建议在绩效评估中给予倾斜，
                  并通过1v1沟通鼓励他们更积极地分享和表达。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
          <h3 className="heading-serif text-lg text-gray-800 mb-5 flex items-center gap-2">
            <Award className="w-5 h-5 text-champagne-500" />
            表彰记录总览
          </h3>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 animate-stagger">
            {recognitions.map(r => {
              const cfg = RECOGNITION_LEVEL[r.level];
              const receiver = userMap[r.receiverId];
              const issuer = userMap[r.issuerId];
              if (!receiver || !issuer) return null;
              return (
                <div key={r.id} className="p-4 rounded-2xl border-2 hover:shadow-md transition-all" style={{ borderColor: r.level === 'gold' ? '#FCD34D' : r.level === 'silver' ? '#D1D5DB' : '#FED7AA' }}>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                      {cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-gray-800 truncate">{r.title}</p>
                            <span className={`px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} text-[10px] font-bold`}>{cfg.label}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                            <Link to={`/profile/${receiver.id}`} className="inline-flex items-center gap-1 hover:text-champagne-600 transition-colors">
                              <img src={receiver.avatar} className="w-4 h-4 rounded-full" />
                              {receiver.name}
                            </Link>
                            <span>·</span>
                            <span>{formatDate(r.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{r.description}</p>
                      <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
                        {r.rewardType === 'bonus' && '💰'}
                        {r.rewardType === 'gift' && '🎁'}
                        {r.rewardType === 'both' && '✨'}
                        {r.rewardDetail}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
