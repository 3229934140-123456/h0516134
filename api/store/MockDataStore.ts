import type { User, ThanksCard, Recognition, MonthlyStar, Notification, ThanksType, Department } from '@shared/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function daysAgo(days: number, hours: number = 0, minutes: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

class MockDataStore {
  users: User[] = [];
  thanksCards: ThanksCard[] = [];
  recognitions: Recognition[] = [];
  monthlyStars: MonthlyStar[] = [];
  notifications: Notification[] = [];

  constructor() {
    this.seedData();
  }

  seedData() {
    this.users = [
      { id: 'u1', name: '林思远', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LinSiYuan&backgroundColor=F3E1B3', role: 'employee', department: '技术部', position: '高级前端工程师', joinDate: '2021-03-15', bio: '热爱代码，追求卓越' },
      { id: 'u2', name: '陈雨桐', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenYuTong&backgroundColor=FAF1D9', role: 'employee', department: '设计部', position: 'UI设计师', joinDate: '2022-06-20', bio: '用设计传递温度' },
      { id: 'u3', name: '王浩然', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangHaoRan&backgroundColor=D8E5DF', role: 'employee', department: '技术部', position: '后端工程师', joinDate: '2020-09-01', bio: '稳定可靠的后端守护者' },
      { id: 'u4', name: '苏婉清', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuWanQing&backgroundColor=FAE6F1', role: 'employee', department: '产品部', position: '产品经理', joinDate: '2022-01-10', bio: '洞察用户需求的产品思考者' },
      { id: 'u5', name: '周明轩', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhouMingXuan&backgroundColor=E0E9FF', role: 'employee', department: '运营部', position: '内容运营', joinDate: '2023-04-01' },
      { id: 'u6', name: '赵雪琪', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoXueQi&backgroundColor=FFE0E0', role: 'employee', department: '市场部', position: '市场专员', joinDate: '2023-02-14' },
      { id: 'u7', name: '孙博文', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunBoWen&backgroundColor=D8EEDF', role: 'employee', department: '技术部', position: '全栈工程师', joinDate: '2021-11-08' },
      { id: 'u8', name: '黄梓萱', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HuangZiXuan&backgroundColor=E8DDFF', role: 'employee', department: '设计部', position: 'UX研究员', joinDate: '2022-08-18' },
      { id: 'u9', name: '吴嘉豪', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WuJiaHao&backgroundColor=FFF8E7', role: 'employee', department: '产品部', position: '产品助理', joinDate: '2024-01-02' },
      { id: 'u10', name: '郑雅文', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhengYaWen&backgroundColor=FDF0D1', role: 'employee', department: '运营部', position: '用户运营', joinDate: '2021-07-12' },
      { id: 'u11', name: '潘志远', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PanZhiYuan&backgroundColor=B2CBBF', role: 'manager', department: '技术部', position: '技术总监', joinDate: '2018-05-20', bio: '技术团队掌舵人，创新推动者' },
      { id: 'u12', name: '孟美琳', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MengMeiLin&backgroundColor=F3E1B3', role: 'manager', department: '产品部', position: '产品总监', joinDate: '2019-03-08' },
      { id: 'u13', name: '沈鹏飞', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShenPengFei&backgroundColor=FAF1D9', role: 'manager', department: '市场部', position: '市场总监', joinDate: '2019-11-15' },
      { id: 'u14', name: '董若涵', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DongRuoHan&backgroundColor=D8E5DF', role: 'hr', department: '人力资源部', position: 'HRBP', joinDate: '2020-06-22', bio: '员工的知心伙伴，组织的赋能者' },
      { id: 'u15', name: '冯伟东', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FengWeiDong&backgroundColor=FAE6F1', role: 'hr', department: '人力资源部', position: 'HR总监', joinDate: '2017-08-30' },
    ];

    const thanksTypes: ThanksType[] = ['协作互助', '解决难题', '超越期待', '导师指导', '创新贡献'];
    const thanksContents = [
      '项目上线前最后一周，主动留下来帮我排查线上Bug，直到凌晨两点问题才解决。你的专业和耐心让我非常感动，团队有你真好！',
      '这次设计评审会上，你的反馈特别有建设性。按照你建议的方案改完后，用户测试满意度提升了30%，太厉害了！',
      '帮我review了三百多行的PR，逐行标注问题，还写了详细的重构建议。认真的态度值得每个人学习。',
      '跨部门协作中，你总是能站在对方的角度思考问题，帮我们解决了很多沟通上的障碍。真正的团队合作者！',
      '产品需求模糊不清的时候，你主动和用户做了10多轮访谈，输出了非常清晰的需求文档。这份较真让产品少走了很多弯路。',
      '新来的同事遇到困难，你主动当起了mentor，每周固定1v1辅导，新人进步非常快。谢谢你在团队传递知识！',
      '线上紧急故障，你5分钟内定位到根因，10分钟恢复服务。技术功底深厚，关键时刻值得信赖！',
      '你提出的优化方案让页面加载速度从3s降到了800ms，用户体验大幅提升。创新真的不只是说说而已！',
      '年会活动筹备期间，你主动承担了最累的物资准备工作，每个细节都考虑得很周到。辛苦了！',
      '默默帮大家整理了团队知识库，把所有项目文档、技术方案都分类归档好。看似小事，但造福了所有人！',
      '你用业余时间开发的效率工具，现在整个团队都在用，每天节省1小时的重复工作时间。太赞了！',
      '在我最焦虑、怀疑自己的时候，你主动找我谈心，分享了很多你的经历。谢谢你的真诚和温暖！',
    ];

    const pairings: Array<[string, string, number, ThanksType, string, boolean]> = [
      ['u3', 'u1', 0, '协作互助', thanksContents[0], false],
      ['u1', 'u2', 0, '解决难题', thanksContents[1], false],
      ['u4', 'u1', 1, '导师指导', thanksContents[2], false],
      ['u2', 'u4', 1, '协作互助', thanksContents[3], false],
      ['u7', 'u3', 1, '超越期待', thanksContents[4], true],
      ['u10', 'u5', 2, '协作互助', thanksContents[5], false],
      ['u3', 'u7', 2, '解决难题', thanksContents[6], false],
      ['u1', 'u7', 2, '创新贡献', thanksContents[7], false],
      ['u8', 'u2', 2, '导师指导', thanksContents[5], false],
      ['u5', 'u4', 3, '超越期待', thanksContents[8], true],
      ['u6', 'u10', 3, '协作互助', thanksContents[9], false],
      ['u4', 'u3', 3, '解决难题', thanksContents[6], false],
      ['u1', 'u3', 3, '协作互助', thanksContents[0], false],
      ['u7', 'u1', 4, '创新贡献', thanksContents[10], false],
      ['u2', 'u8', 4, '导师指导', thanksContents[5], false],
      ['u9', 'u4', 4, '协作互助', thanksContents[3], false],
      ['u5', 'u10', 4, '超越期待', thanksContents[8], true],
      ['u3', 'u2', 5, '解决难题', thanksContents[1], false],
      ['u10', 'u6', 5, '协作互助', thanksContents[9], false],
      ['u1', 'u4', 5, '协作互助', thanksContents[3], false],
      ['u7', 'u2', 5, '超越期待', thanksContents[4], false],
      ['u4', 'u8', 6, '导师指导', thanksContents[5], false],
      ['u2', 'u1', 6, '创新贡献', thanksContents[10], false],
      ['u6', 'u5', 6, '协作互助', thanksContents[0], true],
      ['u9', 'u3', 7, '解决难题', thanksContents[6], false],
      ['u3', 'u4', 7, '协作互助', thanksContents[3], false],
      ['u8', 'u4', 7, '协作互助', thanksContents[3], false],
      ['u5', 'u6', 8, '超越期待', thanksContents[4], false],
      ['u10', 'u4', 8, '协作互助', thanksContents[11], true],
      ['u7', 'u3', 9, '解决难题', thanksContents[6], false],
      ['u1', 'u8', 9, '协作互助', thanksContents[1], false],
      ['u2', 'u7', 10, '创新贡献', thanksContents[10], false],
      ['u4', 'u5', 10, '协作互助', thanksContents[0], false],
      ['u3', 'u10', 12, '协作互助', thanksContents[11], false],
      ['u9', 'u1', 15, '导师指导', thanksContents[2], false],
    ];

    this.thanksCards = pairings.map(([senderId, receiverId, days, type, content, isAnonymous]) => ({
      id: generateId(),
      senderId,
      receiverId,
      type,
      content,
      isAnonymous,
      createdAt: daysAgo(days, Math.floor(Math.random() * 12), Math.floor(Math.random() * 60)),
    }));

    this.recognitions = [
      {
        id: generateId(),
        issuerId: 'u11',
        receiverId: 'u3',
        title: 'Q2 系统稳定性守护者',
        description: '在Q2季度的大促活动中，王浩然同学带领后端团队提前完成了全链路压测和系统扩容。活动期间零故障，核心系统稳定性达到99.99%，完美支撑了三倍平时的流量峰值。',
        level: 'gold',
        rewardType: 'both',
        rewardDetail: '奖金 ¥8,000 + iPhone 16 Pro Max',
        createdAt: daysAgo(5, 10),
      },
      {
        id: generateId(),
        issuerId: 'u12',
        receiverId: 'u4',
        title: '产品创新先锋',
        description: '苏婉清主导的「智能推荐」功能从0到1落地，上线后用户人均停留时长提升40%，付费转化率提升22%，直接贡献了显著的业务增长。',
        level: 'silver',
        rewardType: 'bonus',
        rewardDetail: '奖金 ¥5,000',
        createdAt: daysAgo(8, 15),
      },
      {
        id: generateId(),
        issuerId: 'u11',
        receiverId: 'u1',
        title: '前端性能优化突出贡献',
        description: '林思远同学独立完成了全站前端性能优化项目，首屏加载时间从3.2s降低至0.8s，LCP指标提升75%。项目获得用户一致好评。',
        level: 'silver',
        rewardType: 'gift',
        rewardDetail: 'Apple Watch Ultra 3',
        createdAt: daysAgo(12, 9),
      },
      {
        id: generateId(),
        issuerId: 'u13',
        receiverId: 'u6',
        title: '市场拓展明星奖',
        description: '赵雪琪同学在Q2季度开拓了5家重要企业客户，签约合同金额超过200万，超额完成季度目标150%。',
        level: 'bronze',
        rewardType: 'bonus',
        rewardDetail: '奖金 ¥3,000',
        createdAt: daysAgo(15, 14),
      },
      {
        id: generateId(),
        issuerId: 'u12',
        receiverId: 'u2',
        title: '品牌视觉升级奖',
        description: '陈雨桐同学主导的品牌视觉升级项目，全新的设计语言在上线后获得了行业内的高度认可，社交媒体曝光量超过500万。',
        level: 'bronze',
        rewardType: 'gift',
        rewardDetail: 'iPad Pro 12.9英寸 + Apple Pencil',
        createdAt: daysAgo(20, 11),
      },
    ];

    this.recalculateMonthlyStars();

    this.seedNotifications();
  }

  recalculateMonthlyStars() {
    const userThanksCount: Record<string, number> = {};
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const card of this.thanksCards) {
      const cardDate = new Date(card.createdAt);
      if (cardDate >= monthStart) {
        userThanksCount[card.receiverId] = (userThanksCount[card.receiverId] || 0) + 1;
      }
    }

    const ranked = Object.entries(userThanksCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const quotes = [
      '他/她用行动诠释了什么是卓越团队成员',
      '持续发光发热，温暖身边每一个人',
      '默默付出的努力，值得被所有人看见',
    ];

    this.monthlyStars = ranked.map(([userId, count], i) => ({
      id: generateId(),
      userId,
      rank: (i + 1) as 1 | 2 | 3,
      thanksCount: count,
      month: currentMonth(),
      quote: quotes[i],
    }));
  }

  seedNotifications() {
    this.notifications = [];
    const notifData: Array<{ userId: string; type: Notification['type']; title: string; content: string; relatedId?: string; days?: number }> = [];

    for (const card of this.thanksCards.slice(0, 25)) {
      notifData.push({
        userId: card.receiverId,
        type: 'thanks_received',
        title: '你收到了一张感谢卡 💝',
        content: card.isAnonymous
          ? `一位热心同事给你发送了「${card.type}」感谢卡`
          : `${this.users.find(u => u.id === card.senderId)?.name || '同事'}给你发送了「${card.type}」感谢卡`,
        relatedId: card.id,
        days: Math.floor(Math.random() * 15),
      });

      if (!card.isAnonymous) {
        notifData.push({
          userId: card.senderId,
          type: 'thanks_sent',
          title: '感谢卡已送达 ✨',
          content: `你给${this.users.find(u => u.id === card.receiverId)?.name}的感谢卡已成功送达`,
          relatedId: card.id,
          days: Math.floor(Math.random() * 15),
        });
      }
    }

    for (const rec of this.recognitions) {
      for (const user of this.users) {
        if (user.id === rec.receiverId) {
          notifData.push({
            userId: user.id,
            type: 'recognition_received',
            title: '🎉 恭喜你获得正式表彰！',
            content: `${this.users.find(u => u.id === rec.issuerId)?.name}授予你「${rec.title}」，详情请查看个人主页`,
            relatedId: rec.id,
            days: 5,
          });
        } else {
          notifData.push({
            userId: user.id,
            type: 'recognition_broadcast',
            title: '🏆 新的表彰揭晓',
            content: `${this.users.find(u => u.id === rec.receiverId)?.name}获得了「${rec.title}」表彰，让我们一起祝贺！`,
            relatedId: rec.id,
            days: 6,
          });
        }
      }
    }

    if (this.monthlyStars.length > 0) {
      for (const user of this.users) {
        notifData.push({
          userId: user.id,
          type: 'monthly_star',
          title: '⭐ 本月月度之星已揭晓',
          content: `本月Top3月度之星新鲜出炉！快来看看都是谁吧`,
          days: 2,
        });
      }
    }

    this.notifications = notifData.map((n, idx) => ({
      id: generateId(),
      userId: n.userId,
      type: n.type,
      title: n.title,
      content: n.content,
      relatedId: n.relatedId,
      isRead: idx % 3 === 0,
      createdAt: daysAgo(n.days || Math.floor(Math.random() * 10), Math.floor(Math.random() * 20), Math.floor(Math.random() * 60)),
    }));
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUsers(department?: Department, role?: string): User[] {
    return this.users.filter(u => {
      if (department && u.department !== department) return false;
      if (role && u.role !== role) return false;
      return true;
    });
  }

  addThanksCard(card: Omit<ThanksCard, 'id' | 'createdAt'>): ThanksCard {
    const newCard: ThanksCard = {
      ...card,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.thanksCards.unshift(newCard);
    this.recalculateMonthlyStars();
    return newCard;
  }

  getThanksCards(filters?: { senderId?: string; receiverId?: string; type?: ThanksType; isAnonymous?: boolean }): ThanksCard[] {
    let cards = [...this.thanksCards];
    if (filters) {
      if (filters.senderId) cards = cards.filter(c => c.senderId === filters.senderId);
      if (filters.receiverId) cards = cards.filter(c => c.receiverId === filters.receiverId);
      if (filters.type) cards = cards.filter(c => c.type === filters.type);
    }
    return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addRecognition(rec: Omit<Recognition, 'id' | 'createdAt'>): Recognition {
    const newRec: Recognition = {
      ...rec,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.recognitions.unshift(newRec);
    return newRec;
  }

  getRecognitions(receiverId?: string): Recognition[] {
    let recs = [...this.recognitions];
    if (receiverId) recs = recs.filter(r => r.receiverId === receiverId);
    return recs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getNotifications(userId: string): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationRead(id: string): boolean {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId: string): number {
    let count = 0;
    for (const n of this.notifications) {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    }
    return count;
  }

  addNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const newNotif: Notification = {
      ...notif,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  getHRStats() {
    const thanksByType: Record<ThanksType, number> = {
      '协作互助': 0, '解决难题': 0, '超越期待': 0, '导师指导': 0, '创新贡献': 0,
    };
    const thanksByDepartment: Record<Department, number> = {
      '技术部': 0, '产品部': 0, '设计部': 0, '市场部': 0, '运营部': 0, '人力资源部': 0,
    };
    const userReceived: Record<string, number> = {};
    const userSent: Record<string, number> = {};

    for (const card of this.thanksCards) {
      thanksByType[card.type]++;
      const receiver = this.getUserById(card.receiverId);
      if (receiver) thanksByDepartment[receiver.department]++;
      userReceived[card.receiverId] = (userReceived[card.receiverId] || 0) + 1;
      userSent[card.senderId] = (userSent[card.senderId] || 0) + 1;
    }

    const topContributors = this.users
      .map(u => ({
        userId: u.id,
        received: userReceived[u.id] || 0,
        sent: userSent[u.id] || 0,
      }))
      .sort((a, b) => b.received - a.received)
      .slice(0, 10);

    const quietContributors = this.users
      .filter(u => {
        const received = userReceived[u.id] || 0;
        const sent = userSent[u.id] || 0;
        return received >= 3 && sent === 0;
      })
      .map(u => u.id);

    return {
      totalThanksCards: this.thanksCards.length,
      totalRecognitions: this.recognitions.length,
      thanksByType,
      thanksByDepartment,
      topContributors,
      quietContributors,
    };
  }
}

export const mockStore = new MockDataStore();
export default mockStore;
