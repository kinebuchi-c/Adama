import { db } from '@/lib/firebase';
import { runTransaction, doc, Timestamp } from 'firebase/firestore';
import { BaseService, dateToTimestamp } from './base';
import { Reward, RewardRedemption } from '@/types';

class RewardService extends BaseService<Reward> {
  constructor() {
    super('rewards');
  }

  async getByFamily(familyId: string): Promise<Reward[]> {
    return this.getAll({
      filters: [{ field: 'familyId', operator: '==', value: familyId }],
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  }

  async getActiveByFamily(familyId: string): Promise<Reward[]> {
    return this.getAll({
      filters: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderByField: 'starsRequired',
      orderDirection: 'asc',
    });
  }

  async createReward(
    familyId: string,
    name: string,
    starsRequired: number,
    icon: string,
    description?: string
  ): Promise<string> {
    const reward: Omit<Reward, 'id'> = {
      familyId,
      name,
      description,
      starsRequired,
      icon,
      isActive: true,
      createdAt: new Date(),
    };
    return this.create(reward);
  }

  async toggleActive(rewardId: string, isActive: boolean): Promise<void> {
    await this.update(rewardId, { isActive });
  }

  subscribeToFamily(
    familyId: string,
    callback: (rewards: Reward[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [{ field: 'familyId', operator: '==', value: familyId }],
        orderByField: 'starsRequired',
        orderDirection: 'asc',
      },
      callback
    );
  }

  subscribeToActive(
    familyId: string,
    callback: (rewards: Reward[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [
          { field: 'familyId', operator: '==', value: familyId },
          { field: 'isActive', operator: '==', value: true },
        ],
        orderByField: 'starsRequired',
        orderDirection: 'asc',
      },
      callback
    );
  }
}

class RewardRedemptionService extends BaseService<RewardRedemption> {
  constructor() {
    super('rewardRedemptions');
  }

  async getByChild(childId: string): Promise<RewardRedemption[]> {
    return this.getAll({
      filters: [{ field: 'childId', operator: '==', value: childId }],
      orderByField: 'redeemedAt',
      orderDirection: 'desc',
    });
  }

  async getByFamily(familyId: string): Promise<RewardRedemption[]> {
    return this.getAll({
      filters: [{ field: 'familyId', operator: '==', value: familyId }],
      orderByField: 'redeemedAt',
      orderDirection: 'desc',
    });
  }

  async getPendingByFamily(familyId: string): Promise<RewardRedemption[]> {
    return this.getAll({
      filters: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'status', operator: '==', value: 'pending' },
      ],
      orderByField: 'redeemedAt',
      orderDirection: 'desc',
    });
  }

  /**
   * Redeem a reward - deducts stars and creates redemption record atomically
   */
  async redeemReward(
    childId: string,
    familyId: string,
    reward: Reward
  ): Promise<string> {
    if (!db) throw new Error('Firestore is not configured');

    const redemptionId = await runTransaction(db, async (transaction) => {
      // Check current balance
      const balanceRef = doc(db!, 'starBalances', childId);
      const balanceSnap = await transaction.get(balanceRef);

      if (!balanceSnap.exists()) {
        throw new Error('Star balance not found');
      }

      const currentBalance = balanceSnap.data().totalStars;
      if (currentBalance < reward.starsRequired) {
        throw new Error('Not enough stars');
      }

      // Deduct stars
      transaction.update(balanceRef, {
        totalStars: currentBalance - reward.starsRequired,
        lastUpdated: Timestamp.now(),
      });

      // Create redemption record
      const now = new Date();
      const redemptionRef = doc(db!, 'rewardRedemptions', `${childId}_${Date.now()}`);
      const redemption: Omit<RewardRedemption, 'id'> = {
        rewardId: reward.id,
        childId,
        familyId,
        starsSpent: reward.starsRequired,
        status: 'pending',
        redeemedAt: now,
        createdAt: now,
      };
      transaction.set(redemptionRef, {
        ...redemption,
        redeemedAt: dateToTimestamp(redemption.redeemedAt),
        createdAt: dateToTimestamp(redemption.createdAt),
      });

      // Create transaction record
      const txRef = doc(db!, 'starTransactions', `${childId}_${Date.now()}`);
      transaction.set(txRef, {
        childId,
        familyId,
        type: 'redeem',
        stars: reward.starsRequired,
        description: `${reward.name}と交換`,
        rewardId: reward.id,
        createdAt: Timestamp.now(),
      });

      return redemptionRef.id;
    });

    return redemptionId;
  }

  async fulfillRedemption(redemptionId: string): Promise<void> {
    await this.update(redemptionId, {
      status: 'fulfilled',
      fulfilledAt: new Date(),
    } as Partial<RewardRedemption>);
  }

  subscribeToChild(
    childId: string,
    callback: (redemptions: RewardRedemption[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [{ field: 'childId', operator: '==', value: childId }],
        orderByField: 'redeemedAt',
        orderDirection: 'desc',
      },
      callback
    );
  }

  subscribeToPending(
    familyId: string,
    callback: (redemptions: RewardRedemption[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [
          { field: 'familyId', operator: '==', value: familyId },
          { field: 'status', operator: '==', value: 'pending' },
        ],
        orderByField: 'redeemedAt',
        orderDirection: 'desc',
      },
      callback
    );
  }
}

export const rewardService = new RewardService();
export const rewardRedemptionService = new RewardRedemptionService();
