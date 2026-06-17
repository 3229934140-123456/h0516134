import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Coins, Gift, Search, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { RECOGNITION_LEVEL } from '@/lib/constants';
import { useAppStore } from '@/store/useAppStore';
import type { RecognitionLevel, RewardType, User } from '@shared/types';

export default function RecognitionPage() {
  const navigate = useNavigate();
  const { currentUser, actions } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<RecognitionLevel>('silver');
  const [rewardType, setRewardType] = useState<RewardType>('bonus');
  const [rewardDetail, setRewardDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.users.list().then(list => {
      setUsers(list.filter(u => u.id !== currentUser?.id));
    });
  }, [currentUser]);

  const filtered = users.filter(u =>
    !search || u.name.includes(search) || u.position.includes(search)
  );

  const canSubmit = selected && selected.id !== currentUser?.id && title.trim() && description.trim().length >= 30 && rewardDetail.trim();

  const handleSubmit = async () => {
    if (!canSubmit || !selected || selected.id === currentUser?.id) return;
    setSubmitting(true);
    try {
      await api.recognitions.create({
        receiverId: selected.id,
        title: title.trim(),
        description: description.trim(),
        level,
        rewardType,
        rewardDetail: rewardDetail.trim(),
      });
      actions.bumpDataVersion();
      const { count } = await api.notifications.unreadCount().catch(() => ({ count: 0 }));
      actions.setUnreadCount(count);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (e: any) {
      alert(e.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-24 h-24 mx-auto rounded-full bg-gold-soft flex items-center justify-center mb-6 shadow-gold animate-bounce-soft">
            <Trophy className="w-14 h-14 text-champagne-500" />
          </div>
          <h2 className="heading-serif text-3xl text-gray-800 mb-2">表彰已颁发!</h2>
          <p className="text-gray-500 mb-8">全员已收到通知，{selected?.name} 的贡献将被铭记 🏆</p>
          <Sparkles className="w-8 h-8 mx-auto text-champagne-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-jade-50 via-cream to-champagne-50 p-8 border border-jade-100 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-champagne-200/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        
        <div className="relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-jade-gradient text-white mb-4 shadow-md">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">管理层专属通道</span>
            </div>
            <h1 className="heading-serif text-3xl text-gray-800 mb-2">授予正式表彰 🏆</h1>
            <p className="text-gray-500">对卓越贡献给予正式的、全公司范围的认可</p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="label-form flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-champagne-500" />
                  表彰等级
                </label>
                <div className="space-y-2">
                  {(Object.keys(RECOGNITION_LEVEL) as RecognitionLevel[]).map(lv => {
                    const cfg = RECOGNITION_LEVEL[lv];
                    const isSel = level === lv;
                    return (
                      <button
                        key={lv}
                        onClick={() => setLevel(lv)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2
                          ${isSel
                            ? `${cfg.bg} ${cfg.border} shadow-md scale-[1.02]`
                            : 'bg-white border-gray-100 hover:border-champagne-200'
                          }`}
                      >
                        <span className="text-3xl">{cfg.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className={`font-bold ${cfg.text}`}>{cfg.label}表彰</p>
                          <p className="text-xs text-gray-500">
                            {lv === 'gold' && '最高等级，授予卓越贡献者'}
                            {lv === 'silver' && '重要等级，授予突出贡献者'}
                            {lv === 'bronze' && '基础等级，授予优秀贡献者'}
                          </p>
                        </div>
                        {isSel && <CheckCircle2 className="w-5 h-5 text-champagne-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label-form flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-500" />
                  奖励类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: 'bonus', label: '奖金', icon: Coins, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { k: 'gift', label: '实物', icon: Gift, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { k: 'both', label: '双重', icon: Sparkles, color: 'text-champagne-600', bg: 'bg-champagne-50' },
                  ].map(it => {
                    const isSel = rewardType === it.k;
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.k}
                        onClick={() => setRewardType(it.k as RewardType)}
                        className={`p-3 rounded-xl transition-all border-2
                          ${isSel
                            ? `${it.bg} border-champagne-400 shadow-sm`
                            : 'bg-white border-gray-100 hover:border-champagne-200'
                          }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${it.color}`} />
                        <p className={`text-xs font-semibold ${it.color}`}>{it.label}奖励</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="md:col-span-3 space-y-5">
              <div>
                <label className="label-form">选择表彰对象</label>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="搜索员工姓名..."
                      className="input-gold pl-11"
                    />
                  </div>
                  <div className="bg-white rounded-2xl border border-champagne-100 p-2 max-h-[180px] overflow-y-auto space-y-1">
                    {filtered.map(u => {
                      const isSel = selected?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => setSelected(u)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left
                            ${isSel
                              ? 'bg-gold-soft border-2 border-champagne-400'
                              : 'hover:bg-warmGray border-2 border-transparent'
                            }`}
                        >
                          <img src={u.avatar} alt="" className="w-9 h-9 rounded-full border-2 border-white shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${isSel ? 'text-champagne-700' : 'text-gray-800'}`}>
                              {u.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{u.department} · {u.position}</p>
                          </div>
                          {isSel && <CheckCircle2 className="w-5 h-5 text-champagne-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="label-form">表彰标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例如：Q2系统稳定性守护者、产品创新先锋..."
                  maxLength={30}
                  className="input-gold"
                />
              </div>

              <div>
                <label className="label-form">表彰详情说明</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="详细描述TA的突出贡献和具体事迹（至少30字）"
                  rows={5}
                  maxLength={800}
                  className="input-gold resize-none"
                />
                <div className="flex justify-between mt-2 text-xs">
                  <span className={description.length < 30 ? 'text-red-400' : 'text-green-500'}>
                    {description.length >= 30 ? '✓ 描述完整' : `还需要至少 ${30 - description.length} 字`}
                  </span>
                  <span className="text-gray-400">{description.length}/800</span>
                </div>
              </div>

              <div>
                <label className="label-form flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-champagne-500" />
                  奖励详情说明
                </label>
                <input
                  type="text"
                  value={rewardDetail}
                  placeholder="例如：奖金 ¥10,000、iPhone 16 Pro Max、iPad Pro..."
                  maxLength={100}
                  className="input-gold"
                />
              </div>

              {selected && (
                <div className={`rounded-2xl p-5 bg-white/70 border border-champagne-100 ${RECOGNITION_LEVEL[level].border} border-2`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">📋 表彰预览（全员可见）</span>
                    <span className={`text-2xl`}>{RECOGNITION_LEVEL[level].emoji}</span>
                  </div>
                  <h4 className="heading-serif text-xl text-gray-800 mb-2">
                    {title || '（表彰标题）'}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {description || '（表彰详情描述...）'}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-champagne-100">
                    <div className="flex items-center gap-2">
                      <img src={selected.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                      <span className="font-semibold text-gray-700">{selected.name}</span>
                      <span className="text-xs text-gray-500">{selected.department}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${RECOGNITION_LEVEL[level].bg} ${RECOGNITION_LEVEL[level].text} text-xs font-bold`}>
                      {rewardType === 'bonus' && '奖金 '}
                      {rewardType === 'gift' && '实物 '}
                      {rewardType === 'both' && '双重奖 '}
                      · {rewardDetail || '待填写'}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="btn-jade w-full py-4 text-base flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                {submitting ? '颁发中...' : '正式颁发表彰（全员通知）'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
