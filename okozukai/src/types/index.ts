// User types
export type UserRole = 'parent' | 'child';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  familyId: string;
  avatarCharacter?: CharacterType;
  createdAt: Date;
}

export interface Family {
  id: string;
  name: string;
  parentIds: string[];
  childIds: string[];
  createdAt: Date;
}

// Family Settings (親が設定する変換レート等)
export interface FamilySettings {
  id: string;
  familyId: string;
  starsPerReward: number; // 何ほしで1ごほうび（例: 10ほし = 100円相当）
  rewardAmount: number; // 1ごほうびの金額（親だけ見える）
  rewardName: string; // ごほうびの呼び方（例: 「おこづかい」「ごほうび」）
}

// Task/Chore types
export type TaskDifficulty = 'easy' | 'normal' | 'hard';
export type TaskCategory = 'chore' | 'study' | 'kindness' | 'other';

export interface TaskTemplate {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  stars: number; // ほしの数（子ども向け表示）
  icon?: string;
  createdBy: string;
  proposedBy?: string;
  isApproved: boolean;
  valueLesson?: string;
  createdAt: Date;
}

export type TaskStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface TaskSubmission {
  id: string;
  taskTemplateId: string;
  familyId: string;
  childId: string;
  status: TaskStatus;
  stars: number;
  note?: string;
  reflection?: string;
  parentMessage?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
}

// Task Proposal (child suggests new tasks)
export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'discussion';

export interface TaskProposal {
  id: string;
  familyId: string;
  childId: string;
  name: string;
  description?: string;
  category: TaskCategory;
  suggestedStars: number;
  reason: string;
  status: ProposalStatus;
  parentComment?: string;
  agreedStars?: number;
  createdAt: Date;
  discussedAt?: Date;
}

// Stars & Rewards (ほしとごほうび)
export interface StarBalance {
  id: string;
  childId: string;
  familyId: string;
  totalStars: number;
  lifetimeStars: number; // これまでに集めた合計
  lastUpdated: Date;
  createdAt: Date;
}

export interface StarTransaction {
  id: string;
  childId: string;
  familyId: string;
  type: 'earn' | 'redeem'; // 獲得 or ごほうび交換
  stars: number;
  description: string;
  taskSubmissionId?: string;
  rewardId?: string;
  createdAt: Date;
}

// Reward (ごほうび - 親が設定)
export interface Reward {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  starsRequired: number;
  icon: string;
  isActive: boolean;
  createdAt: Date;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  childId: string;
  familyId: string;
  starsSpent: number;
  status: 'pending' | 'fulfilled';
  redeemedAt: Date;
  fulfilledAt?: Date;
  createdAt: Date;
}

// Gratitude / Thank you messages
export interface GratitudeMessage {
  id: string;
  familyId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  taskSubmissionId?: string;
  createdAt: Date;
}

// Family Meeting / Discussion
export interface FamilyMeeting {
  id: string;
  familyId: string;
  title: string;
  topics: string[];
  decisions: string[];
  nextMeetingDate?: Date;
  createdAt: Date;
}

// Avatar types (人間アバター - 詳細カスタマイズ対応)
export type HairStyle = 'short' | 'medium' | 'long' | 'ponytail' | 'twintail' | 'curly' | 'spiky' | 'bob';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'blue' | 'pink' | 'green' | 'purple' | 'orange';
export type SkinTone = 'light' | 'medium' | 'tan' | 'dark';
export type FaceShape = 'round' | 'oval' | 'square' | 'heart';
export type EyeShape = 'round' | 'almond' | 'droopy' | 'upturned' | 'big' | 'small';
export type EyeColor = 'black' | 'brown' | 'blue' | 'green' | 'hazel' | 'gray';
export type EyebrowShape = 'natural' | 'arched' | 'straight' | 'thick' | 'thin';
export type NoseShape = 'small' | 'medium' | 'round' | 'pointed';
export type MouthShape = 'small' | 'medium' | 'wide' | 'heart';
export type EarSize = 'small' | 'medium' | 'large';
export type Blush = 'none' | 'light' | 'medium' | 'strong';
export type FaceFeature = 'none' | 'freckles' | 'mole' | 'dimples' | 'beauty_mark';
export type Expression = 'happy' | 'neutral' | 'excited' | 'proud' | 'thinking';

// 旧型式（互換性のため）
export type EyeStyle = 'normal' | 'big' | 'sleepy' | 'sparkle';

export interface AvatarAppearance {
  // 髪
  hairStyle: HairStyle;
  hairColor: HairColor;
  // 顔
  skinTone: SkinTone;
  faceShape: FaceShape;
  // 目
  eyeShape: EyeShape;
  eyeColor: EyeColor;
  // 眉
  eyebrowShape: EyebrowShape;
  eyebrowColor?: HairColor; // 指定なしの場合は髪色
  // 鼻
  noseShape: NoseShape;
  // 口
  mouthShape: MouthShape;
  // 耳
  earSize: EarSize;
  // 頬
  blush: Blush;
  // 顔の特徴
  faceFeature: FaceFeature;
  // 旧形式互換
  eyeStyle?: EyeStyle;
}

export interface AvatarState {
  appearance: AvatarAppearance;
  expression: Expression;
  equippedItems: {
    top?: string;      // 上着
    bottom?: string;   // ズボン/スカート
    hat?: string;      // 帽子
    accessory?: string; // アクセサリー
    effect?: string;   // エフェクト（キラキラなど）
  };
}

// 旧Character types（互換性のため残す）
export type CharacterType = 'default';

export interface CharacterState {
  character: CharacterType;
  expression: Expression;
  message?: string;
}

// Weekly report
export interface WeeklyReport {
  id: string;
  childId: string;
  familyId: string;
  weekStart: Date;
  weekEnd: Date;
  totalTasksCompleted: number;
  totalStarsEarned: number;
  taskBreakdown: {
    category: TaskCategory;
    count: number;
    stars: number;
  }[];
  reflectionSummary?: string;
  parentFeedback?: string;
  createdAt: Date;
}

// Educational messages / Value lessons
export interface ValueLesson {
  id: string;
  category: TaskCategory;
  title: string;
  message: string;
  forChild: string;
  forParent: string;
}

// Shop & Customization (カスタマイズ機能)
export type ShopItemCategory = 'top' | 'bottom' | 'hat' | 'accessory' | 'effect' | 'room' | 'hair';

export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  category: ShopItemCategory;
  price: number; // 星の数
  icon: string; // プレビュー用絵文字
  color?: string; // アイテムの色
  rarity: 'common' | 'rare' | 'legendary';
  isLimited?: boolean;
  createdAt: Date;
}

export interface OwnedItem {
  id: string;
  childId: string;
  itemId: string;
  purchasedAt: Date;
  createdAt: Date;
}

export interface PlayerData {
  id: string;
  childId: string;
  avatar: AvatarAppearance;
  equippedItems: {
    top?: string;
    bottom?: string;
    hat?: string;
    accessory?: string;
    effect?: string;
  };
  ownedItemIds: string[];
  roomItems: string[];
  totalStars: number;
  createdAt: Date;
  updatedAt: Date;
}
