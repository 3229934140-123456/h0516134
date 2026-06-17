import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { THANKS_TYPE_CONFIG } from '@/lib/constants';
import { MonthlyStarsBanner } from '@/components/MonthlyStarsBanner';
import { RecognitionCarousel } from '@/components/RecognitionCarousel';
import { ThanksCard } from '@/components/ThanksCard';
import { Send, Filter, Heart } from 'lucide-react';
import type { User, ThanksCard as TC, MonthlyStar, Recognition, ThanksType } from '@shared/types';

export default function HomePage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [cards, setCards] = useState<TC[]>([]);
  const [stars, setStars] = useState<MonthlyStar[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const { filterType, actions } = useAppStore();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [u, c, s, r] = await Promise.all([
          api.users.list(),
          api.thanksCards.list(filterType === '全部' ? undefined : { type: filterType as ThanksType }),
          api.monthlyStars.list(),
          api.recognitions.list(),
        ]);
        setUsers(u);
        setCards(c);
        setStars(s);
        setRecognitions(r);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [filterType]);

  const userMap: Record<string, User> = {};
  users.forEach(u => userMap[u.id] = u);

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
                    {cards.length} 张感谢卡
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">每一份感谢都值得被看见</p>
              </div>
              <button
                onClick={() => navigate('/send-thanks')}
                className="btn-gold flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                发送感谢卡
              </button>
            </div>

            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400 mr-1" />
              {allTypes.map(type => {
                const active = filterType === type;
                const cfg = type !== '全部' ? THANKS_TYPE_CONFIG[type] : null;
                return (
                  <button
                    key={type}
                    onClick={() => actions.setFilterType(type)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5
                      ${active
                        ? 'bg-gold-gradient text-white shadow-gold'
                        : 'bg-warmGray text-gray-600 hover:bg-champagne-50 hover:text-champagne-600'
                      }`}
                  >
                    {cfg && <cfg.icon className="w-3.5 h-3.5" />}
                    {type}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="masonry">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="masonry-item">
                    <div className="h-40 bg-warmGray rounded-2xl animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="masonry animate-stagger">
                {cards.map(card => (
                  <div key={card.id} className="masonry-item">
                    <ThanksCard
                      card={card}
                      sender={userMap[card.senderId]}
                      receiver={userMap[card.receiverId]}
                    />
                  </div>
                ))}
              </div>
            )}

            {!loading && cards.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无该类型的感谢卡</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <RecognitionCarousel items={recognitions} userMap={userMap} />

          <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 border border-champagne-100 shadow-sm">
            <h3 className="heading-serif text-lg text-gray-800 mb-4">🏢 团队成员</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {users.slice(0, 12).map(user => {
                const received = cards.filter(c => c.receiverId === user.id).length;
                return (
                  <button
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-champagne-50 transition-all group text-left"
                  >
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.department}</p>
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
