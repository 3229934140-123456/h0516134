export type UserRole = 'employee' | 'manager' | 'hr';

export type Department = '技术部' | '产品部' | '设计部' | '市场部' | '运营部' | '人力资源部';

export type ThanksType = '协作互助' | '解决难题' | '超越期待' | '导师指导' | '创新贡献';

export type RecognitionLevel = 'gold' | 'silver' | 'bronze';

export type RewardType = 'bonus' | 'gift' | 'both';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  department: Department;
  position: string;
  joinDate: string;
  bio?: string;
}

export interface ThanksCard {
  id: string;
  senderId: string;
  receiverId: string;
  type: ThanksType;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface Recognition {
  id: string;
  issuerId: string;
  receiverId: string;
  title: string;
  description: string;
  level: RecognitionLevel;
  rewardType: RewardType;
  rewardDetail: string;
  createdAt: string;
}

export interface MonthlyStar {
  id: string;
  userId: string;
  rank: 1 | 2 | 3;
  thanksCount: number;
  month: string;
  quote: string;
}

export type NotificationType = 'thanks_received' | 'thanks_sent' | 'recognition_received' | 'recognition_broadcast' | 'monthly_star';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendThanksCardRequest {
  receiverId: string;
  type: ThanksType;
  content: string;
  isAnonymous: boolean;
}

export interface CreateRecognitionRequest {
  receiverId: string;
  title: string;
  description: string;
  level: RecognitionLevel;
  rewardType: RewardType;
  rewardDetail: string;
}

export interface HRStatsResponse {
  totalThanksCards: number;
  totalRecognitions: number;
  thanksByType: Record<ThanksType, number>;
  thanksByDepartment: Record<Department, number>;
  topContributors: Array<{ userId: string; received: number; sent: number }>;
  quietContributors: string[];
}
