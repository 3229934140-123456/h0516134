import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Search, Users, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { THANKS_TYPE_CONFIG } from '@/lib/constants';
import { useAppStore } from '@/store/useAppStore';
import type { ThanksType, User, Department } from '@shared/types';

export default function SendThanksPage() {
  const navigate = useNavigate();
  const { currentUser, actions } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<Department | '全部'>('全部');
  const [selected, setSelected] = useState<User | null>(null);
  const [type, setType] = useState<ThanksType>('协作互助');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.users.list().then(list => {
      const others = list.filter(u => u.id !== currentUser?.id);
      setUsers(others);
      const preselectId = localStorage.getItem('thanksTargetId');
      if (preselectId) {
        const target = others.find(u => u.id === preselectId);
        if (target) setSelected(target);
        localStorage.removeItem('thanksTargetId');
      }
    });
  }, [currentUser]);

  const filtered = users.filter(u => {
    if (deptFilter !== '全部' && u.department !== deptFilter) return false;
    if (search && !u.name.includes(search) && !u.position.includes(search)) return false;
    return true;
  });

  const departments: (Department | '全部')[] = ['全部', '技术部', '产品部', '设计部', '市场部', '运营部', '人力资源部'];

  const canSubmit = selected && selected.id !== currentUser?.id && content.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit || !selected || selected.id === currentUser?.id) return;
    setSubmitting(true);
    try {
      await api.thanksCards.create({
        receiverId: selected.id,
        type,
        content: content.trim(),
        isAnonymous,
      });
      actions.bumpDataVersion();
      const { count } = await api.notifications.unreadCount().catch(() => ({ count: 0 }));
      actions.setUnreadCount(count);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1800);
    } catch (e: any) {
      alert(e.message || '发送失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce-soft">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="heading-serif text-3xl text-gray-800 mb-2">感谢卡已送达!</h2>
          <p className="text-gray-500 mb-8">{selected?.name} 会收到你的心意 💝</p>
          <Sparkles className="w-8 h-8 mx-auto text-champagne-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-champagne-50 via-cream to-pink-50 p-8 border border-champagne-100 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="heading-serif text-3xl text-gray-800 mb-2">发送一张感谢卡 💌</h1>
          <p className="text-gray-500">把那些想开口却没说出口的感谢，悄悄告诉TA</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <label className="label-form flex items-center gap-2">
              <Users className="w-4 h-4 text-champagne-500" />
              选择你想感谢的人
            </label>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索姓名或职位..."
                  className="input-gold pl-11"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {departments.map(d => (
                  <button
                    key={d}
                    onClick={() => setDeptFilter(d)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                      ${deptFilter === d
                        ? 'bg-champagne-500 text-white'
                        : 'bg-white text-gray-500 hover:bg-champagne-50 border border-champagne-100'
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-champagne-100 overflow-hidden max-h-[380px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">未找到匹配的同事</div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filtered.map(u => {
                      const isSel = selected?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => setSelected(u)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                            ${isSel
                              ? 'bg-gold-soft border-2 border-champagne-400 shadow-sm'
                              : 'hover:bg-warmGray border-2 border-transparent'
                            }`}
                        >
                          <img src={u.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
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
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-5">
            <div>
              <label className="label-form">选择感谢类型</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.keys(THANKS_TYPE_CONFIG) as ThanksType[]).map(t => {
                  const cfg = THANKS_TYPE_CONFIG[t];
                  const isSel = type === t;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`p-4 rounded-2xl text-left transition-all border-2
                        ${isSel
                          ? `${cfg.card} border-champagne-400 shadow-gold`
                          : 'bg-white border-champagne-50 hover:border-champagne-200 hover:shadow-sm'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center mb-2`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <p className={`font-semibold text-sm ${isSel ? cfg.color : 'text-gray-700'}`}>{cfg.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label-form">写下你的感谢</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="具体说说TA做了什么让你感动？描述越具体，感谢越有温度~（至少10字）"
                rows={5}
                maxLength={500}
                className="input-gold resize-none"
              />
              <div className="flex justify-between mt-2 text-xs">
                <span className={content.length < 10 ? 'text-red-400' : 'text-green-500'}>
                  {content.length >= 10 ? '✓ 字数达标' : `还需要至少 ${10 - content.length} 字`}
                </span>
                <span className="text-gray-400">{content.length}/500</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 border border-champagne-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-12 h-7 rounded-full transition-all relative
                    ${isAnonymous ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all
                    ${isAnonymous ? 'left-[22px]' : 'left-0.5'}`}
                  />
                </button>
                <div>
                  <p className="font-medium text-sm text-gray-800 flex items-center gap-1.5">
                    {isAnonymous ? <EyeOff className="w-4 h-4 text-purple-500" /> : <Eye className="w-4 h-4 text-champagne-500" />}
                    匿名发送
                  </p>
                  <p className="text-xs text-gray-400">
                    {isAnonymous ? '收件人不会看到你的名字' : '收件人会看到你的姓名'}
                  </p>
                </div>
              </div>
            </div>

            {selected && (
              <div className={`rounded-2xl p-5 ${isAnonymous ? 'bg-anonymous border border-purple-200' : THANKS_TYPE_CONFIG[type].card + ' border border-champagne-100'}`}>
                <p className="text-xs text-gray-500 mb-2">🎨 预览效果</p>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`tag-thanks ${THANKS_TYPE_CONFIG[type].bg} ${THANKS_TYPE_CONFIG[type].color}`}>
                    {type}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {content || '（感谢内容预览会显示在这里）'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-black/5">
                  <div className="flex items-center gap-2">
                    {isAnonymous ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center text-white text-xs font-bold">?</div>
                    ) : (
                      <span className="text-xs text-gray-500">来自：你</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">致：</span>
                    <img src={selected.avatar} alt="" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" />
                    <span className="font-semibold text-sm text-gray-700">{selected.name}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {submitting ? '正在发送...' : '送出这份感谢'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
