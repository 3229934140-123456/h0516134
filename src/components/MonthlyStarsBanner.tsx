import { Crown, Medal, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MonthlyStar, User } from '@shared/types';

const RANK_CONFIG = {
  1: { icon: Crown, medal: '🥇', gradient: 'from-yellow-300 via-yellow-400 to-yellow-600', shadow: 'shadow-[0_20px_60px_-15px_rgba(234,179,8,0.5)]', scale: 'scale-110', order: 'order-2' },
  2: { icon: Medal, medal: '🥈', gradient: 'from-gray-200 via-gray-300 to-gray-500', shadow: 'shadow-[0_15px_40px_-10px_rgba(156,163,175,0.5)]', scale: 'scale-100', order: 'order-1' },
  3: { icon: Medal, medal: '🥉', gradient: 'from-orange-200 via-orange-300 to-orange-500', shadow: 'shadow-[0_15px_40px_-10px_rgba(249,115,22,0.5)]', scale: 'scale-100', order: 'order-3' },
};

export function MonthlyStarsBanner({ stars, userMap }: { stars: MonthlyStar[]; userMap: Record<string, User> }) {
  if (stars.length === 0) {
    return (
      <div className="rounded-3xl bg-gradient-to-r from-champagne-50 to-cream border border-champagne-100 p-8 text-center">
        <p className="text-gray-500">本月月度之星正在评选中...</p>
      </div>
    );
  }

  const monthLabel = stars[0].month.replace('-', '年') + '月';

  return (
    <div className="rounded-3xl bg-hero-gold overflow-hidden border border-champagne-100 shadow-xl">
      <div className="p-8 pb-0 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-champagne-200 shadow-sm mb-4">
          <Crown className="w-5 h-5 text-champagne-500" />
          <span className="heading-serif text-lg text-champagne-700">{monthLabel} 月度之星</span>
        </div>
        <p className="text-sm text-gray-500">感谢你们让团队变得更温暖、更强大</p>
      </div>

      <div className="p-8 flex items-end justify-center gap-6 md:gap-12 flex-wrap">
        {[3, 2, 1].map(rank => {
          const star = stars.find(s => s.rank === rank as 1 | 2 | 3);
          if (!star) return null;
          const cfg = RANK_CONFIG[rank as keyof typeof RANK_CONFIG];
          const user = userMap[star.userId];
          if (!user) return null;

          return (
            <Link
              key={star.id}
              to={`/profile/${user.id}`}
              className={`flex flex-col items-center ${cfg.order} group`}
            >
              <div className={`relative mb-4 ${cfg.scale} transition-transform duration-300 group-hover:scale-105`}>
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${cfg.gradient} blur-xl opacity-40 animate-pulse`} />
                <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full p-1.5 bg-gradient-to-br ${cfg.gradient} ${cfg.shadow}`}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                  />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl animate-bounce-soft">
                    {cfg.medal}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="heading-serif text-xl text-gray-800 mb-1">{user.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{user.department} · {user.position}</p>
                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r ${cfg.gradient} text-white font-bold text-sm shadow-md`}>
                  <Quote className="w-3.5 h-3.5" />
                  {star.thanksCount} 次感谢
                </div>
              </div>

              <div className="mt-4 max-w-[200px] text-center px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-champagne-100">
                <p className="text-xs text-gray-500 italic leading-relaxed">
                  <Quote className="w-3 h-3 inline -mt-1 text-champagne-400" />
                  {' '}{star.quote}{' '}
                  <Quote className="w-3 h-3 inline -mt-1 text-champagne-400 rotate-180" />
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="h-2 bg-gradient-to-r from-yellow-400 via-champagne-400 to-yellow-500" />
    </div>
  );
}
