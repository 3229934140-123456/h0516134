import type { ThanksType } from '@shared/types';
import { HandHeart, Lightbulb, Rocket, GraduationCap, Sparkles } from 'lucide-react';

export const THANKS_TYPE_CONFIG: Record<ThanksType, { icon: typeof HandHeart; label: ThanksType; color: string; bg: string; card: string }> = {
  '协作互助': { icon: HandHeart, label: '协作互助', color: 'text-champagne-600', bg: 'bg-champagne-100', card: 'bg-card-1' },
  '解决难题': { icon: Lightbulb, label: '解决难题', color: 'text-jade-600', bg: 'bg-jade-100', card: 'bg-card-2' },
  '超越期待': { icon: Rocket, label: '超越期待', color: 'text-pink-600', bg: 'bg-pink-100', card: 'bg-card-3' },
  '导师指导': { icon: GraduationCap, label: '导师指导', color: 'text-blue-600', bg: 'bg-blue-100', card: 'bg-card-4' },
  '创新贡献': { icon: Sparkles, label: '创新贡献', color: 'text-red-500', bg: 'bg-red-100', card: 'bg-card-5' },
};

export const ROLE_LABEL: Record<string, string> = {
  employee: '普通员工',
  manager: '管理层',
  hr: 'HR',
};

export const RECOGNITION_LEVEL = {
  gold: { label: '金奖', text: 'text-yellow-700', bg: 'bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-500', border: 'border-yellow-400', emoji: '🏆' },
  silver: { label: '银奖', text: 'text-gray-600', bg: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-400', border: 'border-gray-300', emoji: '🥈' },
  bronze: { label: '铜奖', text: 'text-orange-700', bg: 'bg-gradient-to-br from-orange-200 via-orange-300 to-orange-500', border: 'border-orange-400', emoji: '🥉' },
};

export function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}
