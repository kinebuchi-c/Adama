import { db } from '@/lib/firebase';
import { doc, runTransaction, Timestamp } from 'firebase/firestore';
import { BaseService, dateToTimestamp } from './base';
import { TaskTemplate, TaskSubmission } from '@/types';

// Task Template Service
class TaskTemplateService extends BaseService<TaskTemplate> {
  constructor() {
    super('taskTemplates');
  }

  async getByFamily(familyId: string): Promise<TaskTemplate[]> {
    return this.getAll({
      filters: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'isApproved', operator: '==', value: true },
      ],
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  }

  async getByCategory(familyId: string, category: string): Promise<TaskTemplate[]> {
    return this.getAll({
      filters: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'category', operator: '==', value: category },
        { field: 'isApproved', operator: '==', value: true },
      ],
    });
  }

  subscribeToFamily(
    familyId: string,
    callback: (tasks: TaskTemplate[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [
          { field: 'familyId', operator: '==', value: familyId },
          { field: 'isApproved', operator: '==', value: true },
        ],
        orderByField: 'createdAt',
        orderDirection: 'desc',
      },
      callback
    );
  }
}

// Task Submission Service
class TaskSubmissionService extends BaseService<TaskSubmission> {
  constructor() {
    super('taskSubmissions');
  }

  async getByChild(childId: string): Promise<TaskSubmission[]> {
    return this.getAll({
      filters: [{ field: 'childId', operator: '==', value: childId }],
      orderByField: 'submittedAt',
      orderDirection: 'desc',
    });
  }

  async getPendingByFamily(familyId: string): Promise<TaskSubmission[]> {
    return this.getAll({
      filters: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'status', operator: '==', value: 'submitted' },
      ],
      orderByField: 'submittedAt',
      orderDirection: 'desc',
    });
  }

  async createSubmission(
    taskTemplateId: string,
    childId: string,
    familyId: string,
    stars: number,
    reflection?: string
  ): Promise<string> {
    const now = new Date();
    const submission: Omit<TaskSubmission, 'id'> = {
      taskTemplateId,
      childId,
      familyId,
      status: 'submitted',
      stars,
      reflection,
      submittedAt: now,
      createdAt: now,
    };
    return this.create(submission as Omit<TaskSubmission, 'id'>);
  }

  async approve(
    submissionId: string,
    parentMessage?: string,
    reviewerId?: string
  ): Promise<void> {
    await this.update(submissionId, {
      status: 'approved',
      parentMessage,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    } as Partial<TaskSubmission>);
  }

  async reject(
    submissionId: string,
    reason: string,
    reviewerId?: string
  ): Promise<void> {
    await this.update(submissionId, {
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    } as Partial<TaskSubmission>);
  }

  // Approve and add stars in a transaction
  async approveWithStars(
    submissionId: string,
    childId: string,
    familyId: string,
    stars: number,
    taskName: string,
    parentMessage?: string,
    reviewerId?: string
  ): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');

    const submissionRef = doc(db, 'taskSubmissions', submissionId);
    const balanceRef = doc(db, 'starBalances', childId);

    await runTransaction(db, async (transaction) => {
      // Update submission
      transaction.update(submissionRef, {
        status: 'approved',
        parentMessage,
        reviewedAt: dateToTimestamp(new Date()),
        reviewedBy: reviewerId,
      });

      // Get current balance
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
      const transactionRef = doc(db!, 'starTransactions', `tx_${Date.now()}`);
      transaction.set(transactionRef, {
        childId,
        familyId,
        type: 'earn',
        stars,
        description: `${taskName}を完了`,
        taskSubmissionId: submissionId,
        createdAt: Timestamp.now(),
      });
    });
  }

  async getApprovedByChildInRange(
    childId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TaskSubmission[]> {
    return this.getAll({
      filters: [
        { field: 'childId', operator: '==', value: childId },
        { field: 'status', operator: '==', value: 'approved' },
        { field: 'submittedAt', operator: '>=', value: dateToTimestamp(startDate) },
        { field: 'submittedAt', operator: '<=', value: dateToTimestamp(endDate) },
      ],
      orderByField: 'submittedAt',
      orderDirection: 'desc',
    });
  }

  subscribeToPending(
    familyId: string,
    callback: (submissions: TaskSubmission[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [
          { field: 'familyId', operator: '==', value: familyId },
          { field: 'status', operator: '==', value: 'submitted' },
        ],
        orderByField: 'submittedAt',
        orderDirection: 'desc',
      },
      callback
    );
  }

  subscribeToChild(
    childId: string,
    callback: (submissions: TaskSubmission[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [{ field: 'childId', operator: '==', value: childId }],
        orderByField: 'submittedAt',
        orderDirection: 'desc',
      },
      callback
    );
  }
}

export const taskTemplateService = new TaskTemplateService();
export const taskSubmissionService = new TaskSubmissionService();
