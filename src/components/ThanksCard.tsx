import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import type { ThanksCard, User } from '@shared/types';
import { THANKS_TYPE_CONFIG, formatTime } from '@/lib/constants';

interface Props {
  card: ThanksCard;
  sender?: User;
  receiver?: User;
  showDetails?: boolean;
}

export function ThanksCard({ card, sender, receiver, showDetails = true }: Props) {
  const config = THANKS_TYPE_CONFIG[card.type];
  const Icon = config.icon;
  const cardBg = card.isAnonymous ? 'bg-anonymous border-purple-100' : `${config.card} border-champagne-50`;

  return (
    <div className={`rounded-2xl p-5 shadow-card hover:shadow-gold transition-all duration-300 hover:-translate-y-1 border ${cardBg} animate-fade-in-up`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`tag-thanks ${config.bg} ${config.color}`}>
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </span>
        <span className="text-xs text-gray-400">{formatTime(card.createdAt)}</span>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed mb-5 whitespace-pre-wrap">
        {card.content}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-current/5">
        {sender && (
          <Link to={`/profile/${sender.id}`} className="flex items-center gap-2 group">
            <div className="relative">
              {card.isAnonymous ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  ?
                </div>
              ) : (
                <img src={sender.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
              )}
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400">来自</p>
              <p className={`text-sm font-semibold ${card.isAnonymous ? 'text-purple-600' : 'text-gray-700 group-hover:text-champagne-600'} transition-colors`}>
                {card.isAnonymous ? '热心同事' : sender.name}
              </p>
            </div>
          </Link>
        )}
        {receiver && (
          <Link to={`/profile/${receiver.id}`} className="flex items-center gap-2 group text-right">
            <div className="text-right">
              <p className="text-xs text-gray-400">致</p>
              <p className="text-sm font-semibold text-gray-700 group-hover:text-champagne-600 transition-colors">
                {receiver.name}
              </p>
            </div>
            <img src={receiver.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
          </Link>
        )}
      </div>

      {showDetails && (
        <Link to={`/profile/${card.receiverId}`}>
          <button className="w-full mt-4 py-2 rounded-xl bg-white/70 hover:bg-white text-sm font-medium text-gray-600 hover:text-champagne-600 flex items-center justify-center gap-1.5 transition-all group">
            查看详情
            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </Link>
      )}
    </div>
  );
}
