import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Award, Heart, Send, BookOpen, Medal,
  Trophy, Star, Gift, Coins, ChevronRight, Building2, Users, Briefcase,
  Download, Copy, CheckCircle2, FileText, Archive, TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { THANKS_TYPE_CONFIG, RECOGNITION_LEVEL, formatDate, ROLE_LABEL } from '@/lib/constants';
import { ThanksCard as ThanksCardComp } from '@/components/ThanksCard';
import type {
  User, ThanksCard, Recognition, MonthlyStar, ThanksType,
} from '@shared/types';

type TabType = 'received' | 'sent' | 'awards';

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, dataVersion, actions: storeActions } = useAppStore();
  const [user, setUser] = useState<User | null>(null);
  const [cardsReceived, setCardsReceived] = useState<ThanksCard[]>([]);
  const [cardsSent, setCardsSent] = useState<ThanksCard[]>([]);
  const [awards, setAwards] = useState<Recognition[]>([]);
  const [allStars, setAllStars] = useState<MonthlyStar[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>('received');

  useEffect(() => {
    const t = searchParams.get('tab') as TabType;
    if (t && ['received', 'sent', 'awards'].includes(t)) {
      setTab(t);
    }
  }, [searchParams]);

  useEffect(() => {
    if (userId === 'me' && currentUser) {
      navigate(`/profile/${currentUser.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, { replace: true });
      return;
    }
    if (!userId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const [u, rec, sent, aw, st, us] = await Promise.all([
          api.users.get(userId),
          api.thanksCards.list({ receiverId: userId }),
          api.thanksCards.list({ senderId: userId }),
          api.recognitions.list(userId),
          api.monthlyStars.list(),
          api.users.list(),
        ]);
        setUser(u);
        setCardsReceived(rec);
        setCardsSent(sent);
        setAwards(aw);
        setAllStars(st);
        setAllUsers(us);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, currentUser, navigate, searchParams, dataVersion]);

  const handleTabChange = (t: TabType) => {
    setTab(t);
    setSearchParams({ tab: t });
  };

  const userMap: Record<string, User> = useMemo(() => {
    const m: Record<string, User> = {};
    allUsers.forEach(u => m[u.id] = u);
    return m;
  }, [allUsers]);

  const isOwnProfile = user?.id === currentUser?.id;

  const displayedSentCards = useMemo(() => {
    if (isOwnProfile) return cardsSent;
    return cardsSent.filter(c => !c.isAnonymous);
  }, [cardsSent, isOwnProfile]);

  const groupByMonth = <T extends { createdAt: string }>(items: T[]): Array<{ monthKey: string; monthLabel: string; items: T[] }> => {
    const groups: Record<string, T[]> = {};
    items.forEach(item => {
      const d = new Date(item.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, items]) => {
        const [y, m] = key.split('-');
        return { monthKey: key, monthLabel: `${y}年${parseInt(m)}月`, items };
      });
  };

  const receivedByMonth = useMemo(() => groupByMonth(cardsReceived), [cardsReceived]);
  const sentByMonth = useMemo(() => groupByMonth(displayedSentCards), [displayedSentCards]);
  const awardsByMonth = useMemo(() => groupByMonth(awards), [awards]);

  const [copied, setCopied] = useState(false);

  const generateSummary = (): string => {
    if (!user) return '';
    const lines: string[] = [];
    lines.push(`═══════════════════════════════════════`);
    lines.push(`           个人荣誉档案摘要`);
    lines.push(`═══════════════════════════════════════`);
    lines.push('');
    lines.push(`【员工信息】`);
    lines.push(`  姓名：${user.name}`);
    lines.push(`  部门：${user.department}`);
    lines.push(`  职位：${user.position}`);
    lines.push(`  角色：${ROLE_LABEL[user.role] || user.role}`);
    lines.push(`  入职日期：${formatDate(user.joinDate)}`);
    lines.push('');

    lines.push(`【荣誉概览】`);
    lines.push(`  📬 收到感谢卡：${cardsReceived.length} 张`);
    lines.push(`  📤 发出感谢卡：${isOwnProfile ? cardsSent.length : cardsSent.filter(c => !c.isAnonymous).length} 张`);
    lines.push(`  🏆 正式表彰：${awards.length} 次`);
    if (stats.stars) {
      lines.push(`  ⭐ 月度之星：第 ${stats.stars.rank} 名（${stats.stars.month}）`);
    }
    lines.push('');

    lines.push(`【感谢类型分布（收到）】`);
    (Object.keys(THANKS_TYPE_CONFIG) as ThanksType[]).forEach(t => {
      const count = stats.byType[t];
      const pct = cardsReceived.length > 0 ? ((count / cardsReceived.length) * 100).toFixed(1) : '0.0';
      const bar = '█'.repeat(Math.round((count / Math.max(1, ...Object.values(stats.byType))) * 10));
      lines.push(`  ${THANKS_TYPE_CONFIG[t].label.padEnd(6)}：${String(count).padStart(2)} 次 (${pct}%) ${bar}`);
    });
    lines.push('');

    if (topKeywords.length > 0) {
      lines.push(`【高频关键词（收到的感谢）】`);
      topKeywords.forEach((kw, i) => {
        lines.push(`  ${String(i + 1).padStart(2)}. ${kw.word.padEnd(6)} 出现 ${kw.count} 次`);
      });
      lines.push('');
    }

    if (quarterlyReport.length > 0) {
      lines.push(`【季度成长报告】`);
      quarterlyReport.forEach(q => {
        const topTypeLabel = q.topType ? `${THANKS_TYPE_CONFIG[q.topType[0]].label}(${q.topType[1]}次)` : '-';
        lines.push(`  ${q.label}：收到 ${q.received} 张 / 发出 ${q.sent} 张 / 表彰 ${q.awards} 次`);
        lines.push(`     主力类型：${topTypeLabel}`);
      });
      lines.push('');
    }

    if (interactionPartners.topReceived.length > 0) {
      lines.push(`【互动最多的同事（收到感谢 TOP3）】`);
      interactionPartners.topReceived.slice(0, 3).forEach((p, i) => {
        lines.push(`  ${i + 1}. ${p.user.name}（${p.user.department}） - ${p.count} 次`);
      });
      lines.push('');
    }

    if (interactionPartners.topSent.length > 0 && isOwnProfile) {
      lines.push(`【互动最多的同事（发出感谢 TOP3）】`);
      interactionPartners.topSent.slice(0, 3).forEach((p, i) => {
        lines.push(`  ${i + 1}. ${p.user.name}（${p.user.department}） - ${p.count} 次`);
      });
      lines.push('');
    }

    if (awards.length > 0) {
      lines.push(`【表彰记录与奖励】`);
      awards.forEach((a, i) => {
        const cfg = RECOGNITION_LEVEL[a.level];
        const rewardLabel = a.rewardType === 'bonus' ? '奖金' : a.rewardType === 'gift' ? '实物' : '双重奖励';
        lines.push(`  ${i + 1}. [${cfg.label}] ${a.title}`);
        lines.push(`     授予日期：${formatDate(a.createdAt)}`);
        lines.push(`     奖励类型：${rewardLabel}`);
        lines.push(`     奖励详情：${a.rewardDetail}`);
        lines.push(`     事迹说明：${a.description.substring(0, 60)}${a.description.length > 60 ? '...' : ''}`);
        lines.push('');
      });
    }

    if (achievements.length > 0) {
      lines.push(`【成就徽章】`);
      achievements.forEach(ach => {
        lines.push(`  🏅 ${ach.name} - ${ach.desc}`);
      });
      lines.push('');
    }

    lines.push(`═══════════════════════════════════════`);
    lines.push(`   生成时间：${new Date().toLocaleString('zh-CN')}`);
    lines.push(`═══════════════════════════════════════`);

    return lines.join('\n');
  };

  const handleExport = async () => {
    const summary = generateSummary();
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user?.name || '个人'}_荣誉档案摘要.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const stats = useMemo(() => {
    const byType: Record<ThanksType, number> = {
      '协作互助': 0, '解决难题': 0, '超越期待': 0, '导师指导': 0, '创新贡献': 0,
    };
    cardsReceived.forEach(c => byType[c.type]++);
    const stars = allStars.find(s => s.userId === userId);
    const totalAwardLevels = awards.reduce((acc, a) => ({
      ...acc,
      [a.level]: (acc as any)[a.level] + 1,
    }), { gold: 0, silver: 0, bronze: 0 });
    return { byType, stars, totalAwardLevels };
  }, [cardsReceived, awards, allStars, userId]);

  const STOP_WORDS = new Set([
    '的', '了', '是', '我', '你', '他', '她', '们', '在', '有', '和', '就', '不',
    '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你好', '谢谢',
    '感谢', '非常', '真的', '特别', '很', '太', '超', '超级', '啊', '哦', '嗯', '哈',
    '呢', '吧', '吗', '对', '这个', '那个', '这', '那', '什么', '怎么', '可以', '能',
    '帮', '帮忙', '帮助', '一起', '同事', '同学', '伙伴', '大家', '我们', '咱们',
    '工作', '任务', '项目', '事情', '东西', '问题', '时候', '时间', '今天', '昨天',
    '这次', '上次', '下次', '一直', '总是', '经常', '还是', '但是', '不过', '而且',
    '因为', '所以', '如果', '虽然', '不仅', '而且', '就是', '只是', '只有', '只要',
  ]);

  const extractKeywords = (text: string): string[] => {
    const cleaned = text.replace(/[，。！？、；：""''（）\[\]【】\s,.!?;:'"()\-—…·]/g, ' ');
    const words = cleaned.split(/\s+/).filter(w => w.length >= 2 && !STOP_WORDS.has(w));
    const shortPhrases: string[] = [];
    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i <= text.length - len; i++) {
        const sub = text.substring(i, i + len);
        if (/^[\u4e00-\u9fa5]+$/.test(sub) && !STOP_WORDS.has(sub)) {
          shortPhrases.push(sub);
        }
      }
    }
    return [...words, ...shortPhrases];
  };

  const topKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    cardsReceived.forEach(c => {
      extractKeywords(c.content).forEach(w => {
        counts[w] = (counts[w] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }, [cardsReceived]);

  const getQuarterKey = (dateStr: string): string => {
    const d = new Date(dateStr);
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `${d.getFullYear()}Q${q}`;
  };

  const getQuarterLabel = (key: string): string => {
    const [y, q] = key.split('Q');
    return `${y}年第${q}季度`;
  };

  const quarterlyReport = useMemo(() => {
    const quarters: Record<string, {
      key: string;
      received: number;
      sent: number;
      awards: number;
      byType: Record<ThanksType, number>;
    }> = {};

    const initQuarter = (key: string) => {
      if (!quarters[key]) {
        quarters[key] = {
          key,
          received: 0,
          sent: 0,
          awards: 0,
          byType: { '协作互助': 0, '解决难题': 0, '超越期待': 0, '导师指导': 0, '创新贡献': 0 },
        };
      }
    };

    cardsReceived.forEach(c => {
      const k = getQuarterKey(c.createdAt);
      initQuarter(k);
      quarters[k].received++;
      quarters[k].byType[c.type]++;
    });
    displayedSentCards.forEach(c => {
      const k = getQuarterKey(c.createdAt);
      initQuarter(k);
      quarters[k].sent++;
    });
    awards.forEach(a => {
      const k = getQuarterKey(a.createdAt);
      initQuarter(k);
      quarters[k].awards++;
    });

    return Object.values(quarters)
      .sort((a, b) => b.key.localeCompare(a.key))
      .map(q => ({
        ...q,
        label: getQuarterLabel(q.key),
        topType: (Object.entries(q.byType) as [ThanksType, number][])
          .sort((a, b) => b[1] - a[1])[0],
      }));
  }, [cardsReceived, displayedSentCards, awards]);

  const interactionPartners = useMemo(() => {
    const receivedFrom: Record<string, number> = {};
    const sentTo: Record<string, number> = {};

    cardsReceived.forEach(c => {
      receivedFrom[c.senderId] = (receivedFrom[c.senderId] || 0) + 1;
    });
    displayedSentCards.forEach(c => {
      sentTo[c.receiverId] = (sentTo[c.receiverId] || 0) + 1;
    });

    const topReceived = Object.entries(receivedFrom)
      .map(([id, count]) => ({ user: userMap[id], count }))
      .filter(x => x.user)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topSent = Object.entries(sentTo)
      .map(([id, count]) => ({ user: userMap[id], count }))
      .filter(x => x.user)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { topReceived, topSent };
  }, [cardsReceived, displayedSentCards, userMap]);

  const achievements = useMemo(() => {
    const list: { icon: typeof Award; name: string; desc: string; level: string }[] = [];
    if (cardsReceived.length >= 10) {
      list.push({ icon: Heart, name: '人气王', desc: '收到10+感谢卡', level: 'bg-pink-100 text-pink-600' });
    } else if (cardsReceived.length >= 5) {
      list.push({ icon: Heart, name: '温暖之星', desc: '收到5+感谢卡', level: 'bg-pink-50 text-pink-500' });
    }
    if (cardsSent.length >= 5) {
      list.push({ icon: Send, name: '感恩使者', desc: '发出5+感谢卡', level: 'bg-champagne-100 text-champagne-600' });
    }
    if (stats.stars) {
      list.push({ icon: Star, name: `月度之星 #${stats.stars.rank}`, desc: '月度Top3', level: 'bg-yellow-100 text-yellow-700' });
    }
    awards.forEach(a => {
      list.push({
        icon: Trophy,
        name: a.title,
        desc: RECOGNITION_LEVEL[a.level].label + '表彰',
        level: a.level === 'gold' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800'
          : a.level === 'silver' ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
            : 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800',
      });
    });
    if (cardsSent.length === 0 && cardsReceived.length > 0) {
      list.push({ icon: BookOpen, name: '默默耕耘者', desc: '不善表达但贡献突出', level: 'bg-jade-100 text-jade-700' });
    }
    return list;
  }, [cardsReceived, cardsSent, awards, stats.stars]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-56 bg-warmGray rounded-3xl animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 h-96 bg-warmGray rounded-3xl animate-pulse" />
          <div className="h-96 bg-warmGray rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-20 text-gray-500">用户不存在</div>;
  }

  const isSelf = currentUser?.id === user.id;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl shadow-xl border border-champagne-100">
        <div className="h-32 bg-gradient-to-r from-champagne-300 via-champagne-200 to-pink-200 relative">
          <div className="absolute inset-0 bg-hero-gold" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="bg-white px-8 pb-8 pt-0">
          <div className="flex flex-col md:flex-row gap-6 -mt-14 md:items-end">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-champagne-300 to-yellow-400 blur-md opacity-60 scale-105" />
              <img
                src={user.avatar}
                alt=""
                className="relative w-28 h-28 rounded-full border-4 border-white shadow-xl"
              />
              {stats.stars && (
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gold-gradient shadow-gold flex items-center justify-center text-xl animate-bounce-soft">
                  {stats.stars.rank === 1 ? '👑' : stats.stars.rank === 2 ? '🥈' : '🥉'}
                </div>
              )}
            </div>

            <div className="flex-1 md:pb-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="heading-serif text-3xl text-gray-800">{user.name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-champagne-100 text-champagne-700 text-xs font-semibold border border-champagne-200">
                      {ROLE_LABEL[user.role]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-champagne-500" />
                      {user.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-champagne-500" />
                      {user.position}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-champagne-500" />
                      入职于 {formatDate(user.joinDate)}
                    </span>
                  </div>
                  {user.bio && (
                    <p className="mt-3 text-sm text-gray-600 italic">"{user.bio}"</p>
                  )}
                </div>
                {!isSelf && currentUser && (
                  <button
                    onClick={() => {
                      localStorage.setItem('thanksTargetId', user.id);
                      window.location.href = '/send-thanks';
                    }}
                    className="btn-gold flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    发送感谢卡
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="rounded-2xl p-5 bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-100">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-pink-500" />
                <p className="text-xs text-pink-600 font-medium">收到感谢卡</p>
              </div>
              <p className="heading-serif text-3xl text-pink-600">{cardsReceived.length}</p>
            </div>
            <div className="rounded-2xl p-5 bg-gradient-to-br from-champagne-50 to-champagne-100/50 border border-champagne-100">
              <div className="flex items-center gap-2 mb-1">
                <Send className="w-4 h-4 text-champagne-600" />
                <p className="text-xs text-champagne-700 font-medium">发出感谢卡</p>
              </div>
              <p className="heading-serif text-3xl text-champagne-700">
                {isOwnProfile ? cardsSent.length : cardsSent.filter(c => !c.isAnonymous).length}
              </p>
            </div>
            <div className="rounded-2xl p-5 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-100">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <p className="text-xs text-yellow-700 font-medium">正式表彰</p>
              </div>
              <p className="heading-serif text-3xl text-yellow-700">{awards.length}</p>
            </div>
            <div className="rounded-2xl p-5 bg-gradient-to-br from-jade-50 to-jade-100/50 border border-jade-100">
              <div className="flex items-center gap-2 mb-1">
                <Medal className="w-4 h-4 text-jade-600" />
                <p className="text-xs text-jade-700 font-medium">成就徽章</p>
              </div>
              <p className="heading-serif text-3xl text-jade-700">{achievements.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-champagne-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between pr-4 border-b border-champagne-50">
              <div className="flex flex-1">
                {[
                  { k: 'received' as TabType, label: `收到的感谢卡 (${cardsReceived.length})`, icon: Heart },
                  { k: 'sent' as TabType, label: `发出的感谢卡 (${displayedSentCards.length})`, icon: Send },
                  { k: 'awards' as TabType, label: `表彰记录 (${awards.length})`, icon: Trophy },
                ].map(t => (
                  <button
                    key={t.k}
                    onClick={() => handleTabChange(t.k)}
                    className={`flex-1 px-4 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 border-b-3
                      ${tab === t.k
                        ? 'text-champagne-600 border-champagne-500 bg-champagne-50/50'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-warmGray'
                      }`}
                    style={{ borderBottomWidth: 3 }}
                  >
                    <t.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.k === 'received' ? '收到' : t.k === 'sent' ? '发出' : '表彰'}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleExport}
                className={`ml-2 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5
                  ${copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-champagne-50 text-champagne-700 hover:bg-champagne-100'
                  }`}
                title="导出个人荣誉摘要"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? '已复制' : '导出'}</span>
              </button>
            </div>

            <div className="p-6">
              {tab === 'received' && (
                receivedByMonth.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>还没有收到任何感谢卡</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {receivedByMonth.map((group, gIdx) => (
                      <div key={group.monthKey} className="animate-fade-in-up" style={{ animationDelay: `${gIdx * 80}ms` }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100 text-pink-700">
                            <Archive className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">{group.monthLabel}</span>
                            <span className="text-xs opacity-80">· {group.items.length}张</span>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent" />
                        </div>
                        <div className="masonry">
                          {group.items.map(c => (
                            <div key={c.id} className="masonry-item">
                              <ThanksCardComp
                                card={c}
                                sender={userMap[c.senderId]}
                                receiver={user}
                                showDetails={false}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {tab === 'sent' && (
                sentByMonth.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>还没有发出过感谢卡</p>
                    {isOwnProfile && <p className="text-xs mt-1">（已发送的匿名感谢卡只有你自己能看到）</p>}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {sentByMonth.map((group, gIdx) => (
                      <div key={group.monthKey} className="animate-fade-in-up" style={{ animationDelay: `${gIdx * 80}ms` }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-champagne-100 text-champagne-700">
                            <Archive className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">{group.monthLabel}</span>
                            <span className="text-xs opacity-80">· {group.items.length}张</span>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-champagne-200 to-transparent" />
                        </div>
                        <div className="masonry">
                          {group.items.map(c => (
                            <div key={c.id} className="masonry-item">
                              <ThanksCardComp
                                card={c}
                                sender={user}
                                receiver={userMap[c.receiverId]}
                                showDetails={false}
                                isOwnAnonymous={isOwnProfile && c.isAnonymous}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {tab === 'awards' && (
                awardsByMonth.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>暂无正式表彰记录</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {awardsByMonth.map((group, gIdx) => (
                      <div key={group.monthKey} className="animate-fade-in-up" style={{ animationDelay: `${gIdx * 80}ms` }}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800">
                            <Trophy className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">{group.monthLabel}</span>
                            <span className="text-xs opacity-80">· {group.items.length}项</span>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-yellow-200 to-transparent" />
                        </div>
                        <div className="relative pl-4 space-y-5">
                          <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-gradient-to-b from-yellow-300 via-champagne-300 to-transparent" />
                          {group.items.map((a, idx) => {
                            const cfg = RECOGNITION_LEVEL[a.level];
                            const issuer = userMap[a.issuerId];
                            return (
                              <div key={a.id} className="relative">
                                <div className={`absolute -left-[14px] top-4 w-7 h-7 rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center shadow-md`}>
                                  <span className="text-sm">{cfg.emoji}</span>
                                </div>
                                <div className={`rounded-2xl p-5 ${cfg.border} border-2 bg-white/70 hover:shadow-md transition-all ml-5`}>
                                  <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="heading-serif text-xl text-gray-800">{a.title}</h4>
                                        <span className={`px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} text-[10px] font-bold`}>
                                          {cfg.label}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500 mb-3">
                                        {issuer && (
                                          <span className="inline-flex items-center gap-1.5 mr-3">
                                            <img src={issuer.avatar} alt="" className="w-4 h-4 rounded-full" />
                                            {issuer.name} 授予
                                          </span>
                                        )}
                                        · {formatDate(a.createdAt)}
                                      </p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cfg.bg}/30 border ${cfg.border}`}>
                                      {a.rewardType === 'bonus' && <Coins className="w-4 h-4 text-yellow-600" />}
                                      {a.rewardType === 'gift' && <Gift className="w-4 h-4 text-pink-600" />}
                                      {a.rewardType === 'both' && <Star className="w-4 h-4 text-champagne-500" />}
                                      <span className={`text-xs font-bold ${cfg.text}`}>{a.rewardDetail}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 leading-relaxed">{a.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {cardsReceived.length > 0 && tab === 'received' && (
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
              <h3 className="heading-serif text-lg text-gray-800 mb-4">📊 感谢类型分布</h3>
              <div className="space-y-3">
                {(Object.keys(THANKS_TYPE_CONFIG) as ThanksType[]).map(t => {
                  const cfg = THANKS_TYPE_CONFIG[t];
                  const count = stats.byType[t];
                  const pct = cardsReceived.length > 0 ? (count / cardsReceived.length) * 100 : 0;
                  return (
                    <div key={t}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                          {cfg.label}
                        </span>
                        <span className="text-sm font-bold text-gray-600">{count} 次</span>
                      </div>
                      <div className="h-2.5 bg-warmGray rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cfg.bg} rounded-full transition-all duration-1000`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
            <h3 className="heading-serif text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-champagne-500" />
              成就徽章
            </h3>
            {achievements.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">获得更多感谢来解锁徽章</p>
            ) : (
              <div className="space-y-3 animate-stagger">
                {achievements.map((ach, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${ach.level} transition-all hover:scale-[1.02]`}>
                    <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center shadow-sm">
                      <ach.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{ach.name}</p>
                      <p className="text-[11px] opacity-80">{ach.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {quarterlyReport.length > 0 && (
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
              <h3 className="heading-serif text-lg text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                季度成长报告
              </h3>
              <div className="space-y-3">
                {quarterlyReport.slice(0, 4).map((q, idx) => (
                  <div key={q.key} className="p-3 rounded-xl bg-gradient-to-r from-blue-50/60 to-champagne-50/60 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">{q.label}</span>
                      {q.topType && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${THANKS_TYPE_CONFIG[q.topType[0]].bg} ${THANKS_TYPE_CONFIG[q.topType[0]].color} font-medium`}>
                          {THANKS_TYPE_CONFIG[q.topType[0]].label}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-pink-600 heading-serif">{q.received}</p>
                        <p className="text-[10px] text-gray-500">收到</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-champagne-600 heading-serif">{q.sent}</p>
                        <p className="text-[10px] text-gray-500">发出</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-yellow-600 heading-serif">{q.awards}</p>
                        <p className="text-[10px] text-gray-500">表彰</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topKeywords.length > 0 && tab === 'received' && (
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
              <h3 className="heading-serif text-lg text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                高频关键词
              </h3>
              <div className="flex flex-wrap gap-2">
                {topKeywords.map((kw, idx) => {
                  const sizes = ['text-base', 'text-sm', 'text-sm', 'text-xs', 'text-xs'];
                  const sizeClass = sizes[Math.min(idx, sizes.length - 1)];
                  const colors = [
                    'bg-pink-100 text-pink-700',
                    'bg-purple-100 text-purple-700',
                    'bg-blue-100 text-blue-700',
                    'bg-champagne-100 text-champagne-700',
                    'bg-jade-100 text-jade-700',
                  ];
                  const colorClass = colors[idx % colors.length];
                  return (
                    <span
                      key={kw.word}
                      className={`px-3 py-1 rounded-full font-medium ${sizeClass} ${colorClass} transition-transform hover:scale-105 cursor-default`}
                      title={`出现 ${kw.count} 次`}
                    >
                      {kw.word}
                      <span className="ml-1 opacity-60 text-[10px]">{kw.count}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {interactionPartners.topReceived.length > 0 && tab === 'received' && (
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
              <h3 className="heading-serif text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-500" />
                互动最多的同事
                <span className="ml-auto text-xs text-gray-400 font-normal">收到感谢</span>
              </h3>
              <div className="space-y-2">
                {interactionPartners.topReceived.slice(0, 5).map((p, idx) => (
                  <button
                    key={p.user.id}
                    onClick={() => navigate(`/profile/${p.user.id}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-pink-50 transition-all group text-left"
                  >
                    <span className="w-5 text-center text-sm font-bold text-pink-400">{idx + 1}</span>
                    <img src={p.user.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{p.user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{p.user.department}</p>
                    </div>
                    <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
                      {p.count}次
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {interactionPartners.topSent.length > 0 && tab === 'sent' && isOwnProfile && (
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
              <h3 className="heading-serif text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-champagne-500" />
                互动最多的同事
                <span className="ml-auto text-xs text-gray-400 font-normal">发出感谢</span>
              </h3>
              <div className="space-y-2">
                {interactionPartners.topSent.slice(0, 5).map((p, idx) => (
                  <button
                    key={p.user.id}
                    onClick={() => navigate(`/profile/${p.user.id}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-champagne-50 transition-all group text-left"
                  >
                    <span className="w-5 text-center text-sm font-bold text-champagne-400">{idx + 1}</span>
                    <img src={p.user.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{p.user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{p.user.department}</p>
                    </div>
                    <span className="text-xs font-bold text-champagne-600 bg-champagne-50 px-2 py-0.5 rounded-full">
                      {p.count}次
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-gradient-to-br from-jade-50 to-champagne-50 p-6 border border-jade-100 shadow-sm">
            <h3 className="heading-serif text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-jade-600" />
              部门同事
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {allUsers.filter(u => u.department === user.department && u.id !== user.id).slice(0, 8).map(u => (
                <button
                  key={u.id}
                  onClick={() => window.location.href = `/profile/${u.id}`}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all group text-left"
                >
                  <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{u.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{u.position}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
