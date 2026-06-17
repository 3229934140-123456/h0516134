import { Gift, Coins, Sparkles, ChevronRight, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Recognition, User } from '@shared/types';
import { RECOGNITION_LEVEL, formatDate } from '@/lib/constants';

export function RecognitionCarousel({ items, userMap }: { items: Recognition[]; userMap: Record<string, User> }) {
  if (items.length === 0) return null;

  const latest = items.slice(0, 3);

  return (
    <div className="rounded-3xl overflow-hidden shadow-xl border border-jade-600/20">
      <div className="bg-jade-gradient px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="heading-serif text-lg">官方荣誉表彰</h3>
            <p className="text-xs text-white/60">管理层授予的正式荣誉</p>
          </div>
        </div>
        <Link to="/hr-analytics" className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
          查看全部 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-0">
        {latest.map((rec, idx) => {
          const cfg = RECOGNITION_LEVEL[rec.level];
          const receiver = userMap[rec.receiverId];
          const issuer = userMap[rec.issuerId];
          if (!receiver || !issuer) return null;

          return (
            <Link
              key={rec.id}
              to={`/profile/${receiver.id}`}
              className={`flex items-center gap-5 p-5 bg-white hover:bg-champagne-50/40 transition-all group
                ${idx !== latest.length - 1 ? 'border-b border-warmGray' : ''}`}
            >
              <div className={`w-14 h-14 rounded-2xl ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform`}>
                {cfg.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="heading-serif text-gray-800 text-base truncate">{rec.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{rec.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <img src={receiver.avatar} alt="" className="w-4 h-4 rounded-full" />
                    授予 {receiver.name}
                  </span>
                  <span>by {issuer.name}</span>
                  <span>· {formatDate(rec.createdAt)}</span>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-champagne-50 border border-champagne-100">
                {rec.rewardType === 'bonus' || rec.rewardType === 'both' ? (
                  <div className="flex items-center gap-1 text-yellow-700">
                    <Coins className="w-4 h-4" />
                    <span className="text-xs font-semibold">奖金</span>
                  </div>
                ) : null}
                {rec.rewardType === 'gift' || rec.rewardType === 'both' ? (
                  <div className="flex items-center gap-1 text-pink-600">
                    <Gift className="w-4 h-4" />
                    <span className="text-xs font-semibold">实物</span>
                  </div>
                ) : null}
                {rec.rewardType === 'both' && <Sparkles className="w-4 h-4 text-champagne-500" />}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
