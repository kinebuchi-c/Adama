import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { BaseService, dateToTimestamp } from './base';
import { TaskProposal, ProposalStatus, TaskCategory } from '@/types';

class TaskProposalService extends BaseService<TaskProposal> {
  constructor() {
    super('taskProposals');
  }

  async getByChild(childId: string): Promise<TaskProposal[]> {
    return this.getAll({
      filters: [{ field: 'childId', operator: '==', value: childId }],
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  }

  async getByFamily(familyId: string): Promise<TaskProposal[]> {
    return this.getAll({
      filters: [{ field: 'familyId', operator: '==', value: familyId }],
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  }

  async getPendingByFamily(familyId: string): Promise<TaskProposal[]> {
    return this.getAll({
      filters: [
        { field: 'familyId', operator: '==', value: familyId },
        { field: 'status', operator: '==', value: 'pending' },
      ],
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  }

  async createProposal(
    childId: string,
    familyId: string,
    name: string,
    category: TaskCategory,
    suggestedStars: number,
    reason: string,
    description?: string
  ): Promise<string> {
    const proposal: Omit<TaskProposal, 'id'> = {
      childId,
      familyId,
      name,
      description,
      category,
      suggestedStars,
      reason,
      status: 'pending',
      createdAt: new Date(),
    };
    return this.create(proposal as Omit<TaskProposal, 'id'>);
  }

  async addComment(
    proposalId: string,
    comment: string,
    agreedStars?: number
  ): Promise<void> {
    const updates: Partial<TaskProposal> = {
      parentComment: comment,
      status: 'discussion' as ProposalStatus,
      discussedAt: new Date(),
    };

    if (agreedStars !== undefined) {
      updates.agreedStars = agreedStars;
    }

    await this.update(proposalId, updates);
  }

  async approve(
    proposalId: string,
    agreedStars: number,
    comment?: string
  ): Promise<void> {
    await this.update(proposalId, {
      status: 'approved' as ProposalStatus,
      agreedStars,
      parentComment: comment,
      discussedAt: new Date(),
    } as Partial<TaskProposal>);
  }

  async reject(proposalId: string, reason: string): Promise<void> {
    await this.update(proposalId, {
      status: 'rejected' as ProposalStatus,
      parentComment: reason,
      discussedAt: new Date(),
    } as Partial<TaskProposal>);
  }

  subscribeToFamily(
    familyId: string,
    callback: (proposals: TaskProposal[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [{ field: 'familyId', operator: '==', value: familyId }],
        orderByField: 'createdAt',
        orderDirection: 'desc',
      },
      callback
    );
  }

  subscribeToPending(
    familyId: string,
    callback: (proposals: TaskProposal[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [
          { field: 'familyId', operator: '==', value: familyId },
          { field: 'status', operator: 'in', value: ['pending', 'discussion'] },
        ],
        orderByField: 'createdAt',
        orderDirection: 'desc',
      },
      callback
    );
  }

  subscribeToChild(
    childId: string,
    callback: (proposals: TaskProposal[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [{ field: 'childId', operator: '==', value: childId }],
        orderByField: 'createdAt',
        orderDirection: 'desc',
      },
      callback
    );
  }
}

export const taskProposalService = new TaskProposalService();
