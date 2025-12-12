'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  TaskTemplate,
  TaskSubmission,
  TaskProposal,
  StarBalance,
  StarTransaction,
  ShopItem,
  PlayerData,
  Reward,
  AvatarAppearance,
} from '@/types';

// Default avatar appearance
const defaultAvatar: AvatarAppearance = {
  hairStyle: 'short',
  hairColor: 'black',
  skinTone: 'light',
  faceShape: 'round',
  eyeShape: 'round',
  eyeColor: 'brown',
  eyebrowShape: 'natural',
  noseShape: 'small',
  mouthShape: 'small',
  earSize: 'medium',
  blush: 'light',
  faceFeature: 'none',
};

// Sample tasks
const sampleTasks: TaskTemplate[] = [
  {
    id: '1',
    familyId: 'demo',
    name: '食器を運ぶ',
    category: 'chore',
    difficulty: 'easy',
    stars: 1,
    icon: '🍽️',
    createdBy: 'parent',
    isApproved: true,
    valueLesson: 'みんなのために動くと、家族が喜ぶよ',
    createdAt: new Date(),
  },
  {
    id: '2',
    familyId: 'demo',
    name: '食器洗い',
    category: 'chore',
    difficulty: 'normal',
    stars: 2,
    icon: '🧽',
    createdBy: 'parent',
    isApproved: true,
    valueLesson: '最後までやり遂げるって、すごいことだよ',
    createdAt: new Date(),
  },
  {
    id: '3',
    familyId: 'demo',
    name: 'お風呂掃除',
    category: 'chore',
    difficulty: 'hard',
    stars: 3,
    icon: '🛁',
    createdBy: 'parent',
    isApproved: true,
    valueLesson: '難しいことにチャレンジする君は、かっこいい！',
    createdAt: new Date(),
  },
  {
    id: '4',
    familyId: 'demo',
    name: '洗濯物をたたむ',
    category: 'chore',
    difficulty: 'normal',
    stars: 2,
    icon: '👕',
    createdBy: 'parent',
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '5',
    familyId: 'demo',
    name: '宿題を自分でやった',
    category: 'study',
    difficulty: 'easy',
    stars: 1,
    icon: '📝',
    createdBy: 'parent',
    isApproved: true,
    valueLesson: '自分からやるって、えらいことだね',
    createdAt: new Date(),
  },
  {
    id: '6',
    familyId: 'demo',
    name: '本を1冊読んだ',
    category: 'study',
    difficulty: 'normal',
    stars: 2,
    icon: '📚',
    createdBy: 'parent',
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '7',
    familyId: 'demo',
    name: '妹・弟に優しくした',
    category: 'kindness',
    difficulty: 'easy',
    stars: 1,
    icon: '💕',
    createdBy: 'parent',
    isApproved: true,
    valueLesson: '優しい気持ちは、みんなを幸せにするよ',
    createdAt: new Date(),
  },
  {
    id: '8',
    familyId: 'demo',
    name: '友達を助けた',
    category: 'kindness',
    difficulty: 'normal',
    stars: 2,
    icon: '🤝',
    createdBy: 'parent',
    isApproved: true,
    valueLesson: '困っている人を助けるって、素敵だね',
    createdAt: new Date(),
  },
];

// Sample submissions (pending approval)
const sampleSubmissions: TaskSubmission[] = [
  {
    id: 'sub1',
    taskTemplateId: '1',
    familyId: 'demo',
    childId: 'child1',
    status: 'submitted',
    stars: 1,
    reflection: 'お母さんが助かるって言ってくれた！',
    submittedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'sub2',
    taskTemplateId: '5',
    familyId: 'demo',
    childId: 'child1',
    status: 'submitted',
    stars: 1,
    reflection: '算数が少しわかるようになった',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

// Sample shop items
const sampleShopItems: ShopItem[] = [
  {
    id: 'item1',
    name: 'キラキラメガネ',
    description: 'おしゃれなメガネだよ',
    category: 'accessory',
    price: 5,
    icon: '👓',
    rarity: 'common',
    createdAt: new Date(),
  },
  {
    id: 'item2',
    name: 'しましまシャツ',
    description: 'かわいいボーダー柄',
    category: 'top',
    price: 8,
    icon: '👕',
    color: 'blue',
    rarity: 'common',
    createdAt: new Date(),
  },
  {
    id: 'item3',
    name: 'キャップ',
    description: 'かっこいい帽子',
    category: 'hat',
    price: 6,
    icon: '🧢',
    rarity: 'common',
    createdAt: new Date(),
  },
  {
    id: 'item4',
    name: 'キラキラエフェクト',
    description: 'まわりがキラキラ光る！',
    category: 'effect',
    price: 15,
    icon: '✨',
    rarity: 'rare',
    createdAt: new Date(),
  },
  {
    id: 'item5',
    name: 'ハートエフェクト',
    description: 'ハートがふわふわ',
    category: 'effect',
    price: 15,
    icon: '💕',
    rarity: 'rare',
    createdAt: new Date(),
  },
  {
    id: 'item6',
    name: '王冠',
    description: 'キングやクイーンになれる！',
    category: 'hat',
    price: 30,
    icon: '👑',
    rarity: 'legendary',
    createdAt: new Date(),
  },
  {
    id: 'item7',
    name: 'リボン',
    description: 'かわいいリボン',
    category: 'hat',
    price: 10,
    icon: '🎀',
    rarity: 'rare',
    createdAt: new Date(),
  },
  {
    id: 'item8',
    name: '星エフェクト',
    description: '星がキラキラ',
    category: 'effect',
    price: 20,
    icon: '⭐',
    rarity: 'rare',
    createdAt: new Date(),
  },
];

// Sample rewards
const sampleRewards: Reward[] = [
  {
    id: 'reward1',
    familyId: 'demo',
    name: 'おこづかい100円',
    description: '100円もらえるよ！',
    starsRequired: 10,
    icon: '💰',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'reward2',
    familyId: 'demo',
    name: 'ゲーム30分',
    description: 'ゲームで遊べる時間がもらえる！',
    starsRequired: 5,
    icon: '🎮',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'reward3',
    familyId: 'demo',
    name: 'お菓子タイム',
    description: '好きなお菓子を選べる！',
    starsRequired: 8,
    icon: '🍭',
    isActive: true,
    createdAt: new Date(),
  },
];

// Initial star balance
const initialStarBalance: StarBalance = {
  id: 'balance1',
  childId: 'child1',
  familyId: 'demo',
  totalStars: 15,
  lifetimeStars: 45,
  lastUpdated: new Date(),
  createdAt: new Date(),
};

// Sample transactions
const sampleTransactions: StarTransaction[] = [
  {
    id: 'tx1',
    childId: 'child1',
    familyId: 'demo',
    type: 'earn',
    stars: 2,
    description: '食器洗いを完了',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
  },
  {
    id: 'tx2',
    childId: 'child1',
    familyId: 'demo',
    type: 'earn',
    stars: 1,
    description: '宿題を自分でやった',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
  {
    id: 'tx3',
    childId: 'child1',
    familyId: 'demo',
    type: 'redeem',
    stars: 5,
    description: 'ゲーム30分と交換',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
  },
];

// Initial player data
const initialPlayerData: PlayerData = {
  id: 'player1',
  childId: 'child1',
  avatar: defaultAvatar,
  equippedItems: {
    accessory: 'item1', // glasses
  },
  ownedItemIds: ['item1', 'item2', 'item3', 'item4'],
  roomItems: [],
  totalStars: 15,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Sample proposals
const sampleProposals: TaskProposal[] = [
  {
    id: 'prop1',
    familyId: 'demo',
    childId: 'child1',
    name: 'ペットの世話',
    description: '犬のごはんと散歩',
    category: 'chore',
    suggestedStars: 3,
    reason: '毎日やるのは大変だから',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

interface DemoData {
  tasks: TaskTemplate[];
  submissions: TaskSubmission[];
  shopItems: ShopItem[];
  rewards: Reward[];
  starBalance: StarBalance;
  transactions: StarTransaction[];
  playerData: PlayerData;
  proposals: TaskProposal[];
}

interface DemoContextType {
  isDemo: boolean;
  data: DemoData;
  // Task actions
  addTask: (task: Omit<TaskTemplate, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<TaskTemplate>) => void;
  deleteTask: (id: string) => void;
  // Submission actions
  createSubmission: (taskId: string, reflection?: string) => string;
  approveSubmission: (id: string, parentMessage?: string) => void;
  rejectSubmission: (id: string, reason: string) => void;
  // Star actions
  addStars: (stars: number, description: string) => void;
  redeemStars: (stars: number, description: string) => boolean;
  // Player actions
  updateAvatar: (appearance: Partial<AvatarAppearance>) => void;
  purchaseItem: (itemId: string) => boolean;
  equipItem: (itemId: string, slot: keyof PlayerData['equippedItems']) => void;
  unequipItem: (slot: keyof PlayerData['equippedItems']) => void;
  // Proposal actions
  createProposal: (proposal: Omit<TaskProposal, 'id' | 'createdAt' | 'status'>) => string;
  updateProposal: (id: string, updates: Partial<TaskProposal>) => void;
  // Reward actions
  redeemReward: (rewardId: string) => boolean;
  // Reset
  resetDemoData: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>({
    tasks: sampleTasks,
    submissions: sampleSubmissions,
    shopItems: sampleShopItems,
    rewards: sampleRewards,
    starBalance: initialStarBalance,
    transactions: sampleTransactions,
    playerData: initialPlayerData,
    proposals: sampleProposals,
  });

  // Task actions
  const addTask = useCallback((task: Omit<TaskTemplate, 'id' | 'createdAt'>) => {
    const id = `task_${Date.now()}`;
    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id, createdAt: new Date() }],
    }));
    return id;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<TaskTemplate>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, []);

  // Submission actions
  const createSubmission = useCallback((taskId: string, reflection?: string) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return '';

    const id = `sub_${Date.now()}`;
    const now = new Date();
    const submission: TaskSubmission = {
      id,
      taskTemplateId: taskId,
      familyId: 'demo',
      childId: 'child1',
      status: 'submitted',
      stars: task.stars,
      reflection,
      submittedAt: now,
      createdAt: now,
    };

    setData(prev => ({
      ...prev,
      submissions: [...prev.submissions, submission],
    }));
    return id;
  }, [data.tasks]);

  const approveSubmission = useCallback((id: string, parentMessage?: string) => {
    setData(prev => {
      const submission = prev.submissions.find(s => s.id === id);
      if (!submission) return prev;

      const newTransaction: StarTransaction = {
        id: `tx_${Date.now()}`,
        childId: 'child1',
        familyId: 'demo',
        type: 'earn',
        stars: submission.stars,
        description: prev.tasks.find(t => t.id === submission.taskTemplateId)?.name || 'タスク完了',
        taskSubmissionId: id,
        createdAt: new Date(),
      };

      return {
        ...prev,
        submissions: prev.submissions.map(s =>
          s.id === id
            ? { ...s, status: 'approved' as const, parentMessage, reviewedAt: new Date() }
            : s
        ),
        starBalance: {
          ...prev.starBalance,
          totalStars: prev.starBalance.totalStars + submission.stars,
          lifetimeStars: prev.starBalance.lifetimeStars + submission.stars,
          lastUpdated: new Date(),
        },
        transactions: [newTransaction, ...prev.transactions],
        playerData: {
          ...prev.playerData,
          totalStars: prev.playerData.totalStars + submission.stars,
        },
      };
    });
  }, []);

  const rejectSubmission = useCallback((id: string, reason: string) => {
    setData(prev => ({
      ...prev,
      submissions: prev.submissions.map(s =>
        s.id === id
          ? { ...s, status: 'rejected' as const, rejectionReason: reason, reviewedAt: new Date() }
          : s
      ),
    }));
  }, []);

  // Star actions
  const addStars = useCallback((stars: number, description: string) => {
    const newTransaction: StarTransaction = {
      id: `tx_${Date.now()}`,
      childId: 'child1',
      familyId: 'demo',
      type: 'earn',
      stars,
      description,
      createdAt: new Date(),
    };

    setData(prev => ({
      ...prev,
      starBalance: {
        ...prev.starBalance,
        totalStars: prev.starBalance.totalStars + stars,
        lifetimeStars: prev.starBalance.lifetimeStars + stars,
        lastUpdated: new Date(),
      },
      transactions: [newTransaction, ...prev.transactions],
      playerData: {
        ...prev.playerData,
        totalStars: prev.playerData.totalStars + stars,
      },
    }));
  }, []);

  const redeemStars = useCallback((stars: number, description: string) => {
    if (data.starBalance.totalStars < stars) return false;

    const newTransaction: StarTransaction = {
      id: `tx_${Date.now()}`,
      childId: 'child1',
      familyId: 'demo',
      type: 'redeem',
      stars,
      description,
      createdAt: new Date(),
    };

    setData(prev => ({
      ...prev,
      starBalance: {
        ...prev.starBalance,
        totalStars: prev.starBalance.totalStars - stars,
        lastUpdated: new Date(),
      },
      transactions: [newTransaction, ...prev.transactions],
      playerData: {
        ...prev.playerData,
        totalStars: prev.playerData.totalStars - stars,
      },
    }));
    return true;
  }, [data.starBalance.totalStars]);

  // Player actions
  const updateAvatar = useCallback((appearance: Partial<AvatarAppearance>) => {
    setData(prev => ({
      ...prev,
      playerData: {
        ...prev.playerData,
        avatar: { ...prev.playerData.avatar, ...appearance },
        updatedAt: new Date(),
      },
    }));
  }, []);

  const purchaseItem = useCallback((itemId: string) => {
    const item = data.shopItems.find(i => i.id === itemId);
    if (!item) return false;
    if (data.playerData.ownedItemIds.includes(itemId)) return false;
    if (data.starBalance.totalStars < item.price) return false;

    const newTransaction: StarTransaction = {
      id: `tx_${Date.now()}`,
      childId: 'child1',
      familyId: 'demo',
      type: 'redeem',
      stars: item.price,
      description: `${item.name}を購入`,
      createdAt: new Date(),
    };

    setData(prev => ({
      ...prev,
      starBalance: {
        ...prev.starBalance,
        totalStars: prev.starBalance.totalStars - item.price,
        lastUpdated: new Date(),
      },
      transactions: [newTransaction, ...prev.transactions],
      playerData: {
        ...prev.playerData,
        ownedItemIds: [...prev.playerData.ownedItemIds, itemId],
        totalStars: prev.playerData.totalStars - item.price,
        updatedAt: new Date(),
      },
    }));
    return true;
  }, [data.shopItems, data.playerData.ownedItemIds, data.starBalance.totalStars]);

  const equipItem = useCallback((itemId: string, slot: keyof PlayerData['equippedItems']) => {
    if (!data.playerData.ownedItemIds.includes(itemId)) return;

    setData(prev => ({
      ...prev,
      playerData: {
        ...prev.playerData,
        equippedItems: {
          ...prev.playerData.equippedItems,
          [slot]: itemId,
        },
        updatedAt: new Date(),
      },
    }));
  }, [data.playerData.ownedItemIds]);

  const unequipItem = useCallback((slot: keyof PlayerData['equippedItems']) => {
    setData(prev => ({
      ...prev,
      playerData: {
        ...prev.playerData,
        equippedItems: {
          ...prev.playerData.equippedItems,
          [slot]: undefined,
        },
        updatedAt: new Date(),
      },
    }));
  }, []);

  // Proposal actions
  const createProposal = useCallback((proposal: Omit<TaskProposal, 'id' | 'createdAt' | 'status'>) => {
    const id = `prop_${Date.now()}`;
    setData(prev => ({
      ...prev,
      proposals: [...prev.proposals, {
        ...proposal,
        id,
        status: 'pending' as const,
        createdAt: new Date(),
      }],
    }));
    return id;
  }, []);

  const updateProposal = useCallback((id: string, updates: Partial<TaskProposal>) => {
    setData(prev => ({
      ...prev,
      proposals: prev.proposals.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  // Reward actions
  const redeemReward = useCallback((rewardId: string) => {
    const reward = data.rewards.find(r => r.id === rewardId);
    if (!reward) return false;
    if (data.starBalance.totalStars < reward.starsRequired) return false;

    const newTransaction: StarTransaction = {
      id: `tx_${Date.now()}`,
      childId: 'child1',
      familyId: 'demo',
      type: 'redeem',
      stars: reward.starsRequired,
      description: `${reward.name}と交換`,
      rewardId,
      createdAt: new Date(),
    };

    setData(prev => ({
      ...prev,
      starBalance: {
        ...prev.starBalance,
        totalStars: prev.starBalance.totalStars - reward.starsRequired,
        lastUpdated: new Date(),
      },
      transactions: [newTransaction, ...prev.transactions],
      playerData: {
        ...prev.playerData,
        totalStars: prev.playerData.totalStars - reward.starsRequired,
      },
    }));
    return true;
  }, [data.rewards, data.starBalance.totalStars]);

  // Reset demo data
  const resetDemoData = useCallback(() => {
    setData({
      tasks: sampleTasks,
      submissions: sampleSubmissions,
      shopItems: sampleShopItems,
      rewards: sampleRewards,
      starBalance: initialStarBalance,
      transactions: sampleTransactions,
      playerData: initialPlayerData,
      proposals: sampleProposals,
    });
  }, []);

  return (
    <DemoContext.Provider
      value={{
        isDemo: true,
        data,
        addTask,
        updateTask,
        deleteTask,
        createSubmission,
        approveSubmission,
        rejectSubmission,
        addStars,
        redeemStars,
        updateAvatar,
        purchaseItem,
        equipItem,
        unequipItem,
        createProposal,
        updateProposal,
        redeemReward,
        resetDemoData,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

// Helper to check if in demo mode (for components that might not have provider)
export function useDemoSafe() {
  const context = useContext(DemoContext);
  return context;
}
