import { db } from '@/lib/firebase';
import { doc, runTransaction, Timestamp, setDoc } from 'firebase/firestore';
import { BaseService, dateToTimestamp } from './base';
import { StarBalance, StarTransaction } from '@/types';

// Star Balance Service
class StarBalanceService extends BaseService<StarBalance> {
  constructor() {
    super('starBalances');
  }

  async getByChild(childId: string): Promise<StarBalance | null> {
    return this.getById(childId);
  }

  async initializeBalance(childId: string, familyId: string): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');

    const balanceRef = doc(db, 'starBalances', childId);
    await setDoc(balanceRef, {
      childId,
      familyId,
      totalStars: 0,
      lifetimeStars: 0,
      lastUpdated: Timestamp.now(),
    });
  }

  async addStars(
    childId: string,
    familyId: string,
    stars: number,
    description: string,
    taskSubmissionId?: string
  ): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');

    const balanceRef = doc(db, 'starBalances', childId);

    await runTransaction(db, async (transaction) => {
      const balanceDoc = await transaction.get(balanceRef);
      const currentBalance = balanceDoc.exists()
        ? balanceDoc.data()
        : { totalStars: 0, lifetimeStars: 0 };

      // Update balance
      transaction.set(balanceRef, {
        childId,
        familyId,
        totalStars: currentBalance.totalStars + stars,
        lifetimeStars: currentBalance.lifetimeStars + stars,
        lastUpdated: Timestamp.now(),
      }, { merge: true });

      // Create transaction record
      const transactionRef = doc(db!, 'starTransactions', `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      transaction.set(transactionRef, {
        childId,
        familyId,
        type: 'earn',
        stars,
        description,
        taskSubmissionId,
        createdAt: Timestamp.now(),
      });
    });
  }

  async redeemStars(
    childId: string,
    familyId: string,
    stars: number,
    description: string,
    rewardId?: string,
    shopItemId?: string
  ): Promise<boolean> {
    if (!db) throw new Error('Firestore is not configured');

    const balanceRef = doc(db, 'starBalances', childId);

    try {
      await runTransaction(db, async (transaction) => {
        const balanceDoc = await transaction.get(balanceRef);

        if (!balanceDoc.exists()) {
          throw new Error('Balance not found');
        }

        const currentBalance = balanceDoc.data();
        if (currentBalance.totalStars < stars) {
          throw new Error('Insufficient stars');
        }

        // Update balance
        transaction.update(balanceRef, {
          totalStars: currentBalance.totalStars - stars,
          lastUpdated: Timestamp.now(),
        });

        // Create transaction record
        const transactionRef = doc(db!, 'starTransactions', `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        transaction.set(transactionRef, {
          childId,
          familyId,
          type: 'redeem',
          stars,
          description,
          rewardId,
          shopItemId,
          createdAt: Timestamp.now(),
        });
      });
      return true;
    } catch (error) {
      console.error('Failed to redeem stars:', error);
      return false;
    }
  }

  subscribeToBalance(
    childId: string,
    callback: (balance: StarBalance | null) => void
  ): () => void {
    return this.subscribeToDoc(childId, callback);
  }
}

// Star Transaction Service
class StarTransactionService extends BaseService<StarTransaction> {
  constructor() {
    super('starTransactions');
  }

  async getByChild(childId: string, limit = 50): Promise<StarTransaction[]> {
    return this.getAll({
      filters: [{ field: 'childId', operator: '==', value: childId }],
      orderByField: 'createdAt',
      orderDirection: 'desc',
      limitCount: limit,
    });
  }

  async getByFamily(familyId: string, limit = 100): Promise<StarTransaction[]> {
    return this.getAll({
      filters: [{ field: 'familyId', operator: '==', value: familyId }],
      orderByField: 'createdAt',
      orderDirection: 'desc',
      limitCount: limit,
    });
  }

  async getRecentByChild(childId: string, days = 7): Promise<StarTransaction[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.getAll({
      filters: [
        { field: 'childId', operator: '==', value: childId },
        { field: 'createdAt', operator: '>=', value: dateToTimestamp(cutoffDate) },
      ],
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  }

  async getByChildInRange(
    childId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StarTransaction[]> {
    return this.getAll({
      filters: [
        { field: 'childId', operator: '==', value: childId },
        { field: 'createdAt', operator: '>=', value: dateToTimestamp(startDate) },
        { field: 'createdAt', operator: '<=', value: dateToTimestamp(endDate) },
      ],
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  }

  subscribeToChild(
    childId: string,
    callback: (transactions: StarTransaction[]) => void,
    limit = 50
  ): () => void {
    return this.subscribe(
      {
        filters: [{ field: 'childId', operator: '==', value: childId }],
        orderByField: 'createdAt',
        orderDirection: 'desc',
        limitCount: limit,
      },
      callback
    );
  }
}

export const starBalanceService = new StarBalanceService();
export const starTransactionService = new StarTransactionService();
