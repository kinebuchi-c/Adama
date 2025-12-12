import { db } from '@/lib/firebase';
import { doc, runTransaction, Timestamp, setDoc } from 'firebase/firestore';
import { BaseService, dateToTimestamp } from './base';
import { PlayerData, ShopItem, OwnedItem, AvatarAppearance } from '@/types';
import { starBalanceService } from './star.service';

// Player Data Service
class PlayerDataService extends BaseService<PlayerData> {
  constructor() {
    super('players');
  }

  async getByChild(childId: string): Promise<PlayerData | null> {
    return this.getById(childId);
  }

  async initializePlayer(
    childId: string,
    familyId: string,
    avatar: AvatarAppearance
  ): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');

    const playerRef = doc(db, 'players', childId);
    await setDoc(playerRef, {
      childId,
      familyId,
      avatar,
      equippedItems: {},
      ownedItemIds: [],
      roomItems: [],
      totalStars: 0,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  }

  async updateAvatar(
    childId: string,
    appearance: Partial<AvatarAppearance>
  ): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');

    const playerRef = doc(db, 'players', childId);

    await runTransaction(db, async (transaction) => {
      const playerDoc = await transaction.get(playerRef);

      if (!playerDoc.exists()) {
        throw new Error('Player not found');
      }

      const currentData = playerDoc.data();
      const updatedAvatar = { ...currentData.avatar, ...appearance };

      transaction.update(playerRef, {
        avatar: updatedAvatar,
        updatedAt: Timestamp.now(),
      });
    });
  }

  async equipItem(
    childId: string,
    itemId: string,
    slot: keyof PlayerData['equippedItems']
  ): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');

    const playerRef = doc(db, 'players', childId);

    await runTransaction(db, async (transaction) => {
      const playerDoc = await transaction.get(playerRef);

      if (!playerDoc.exists()) {
        throw new Error('Player not found');
      }

      const currentData = playerDoc.data();

      // Check if player owns the item
      if (!currentData.ownedItemIds.includes(itemId)) {
        throw new Error('Item not owned');
      }

      transaction.update(playerRef, {
        [`equippedItems.${slot}`]: itemId,
        updatedAt: Timestamp.now(),
      });
    });
  }

  async unequipItem(
    childId: string,
    slot: keyof PlayerData['equippedItems']
  ): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');

    const playerRef = doc(db, 'players', childId);

    await this.update(childId, {
      [`equippedItems.${slot}`]: null,
      updatedAt: new Date(),
    } as Partial<PlayerData>);
  }

  async purchaseItem(
    childId: string,
    familyId: string,
    item: ShopItem
  ): Promise<boolean> {
    if (!db) throw new Error('Firestore is not configured');

    const playerRef = doc(db, 'players', childId);
    const balanceRef = doc(db, 'starBalances', childId);

    try {
      await runTransaction(db, async (transaction) => {
        const [playerDoc, balanceDoc] = await Promise.all([
          transaction.get(playerRef),
          transaction.get(balanceRef),
        ]);

        // Check balance
        if (!balanceDoc.exists()) {
          throw new Error('Balance not found');
        }
        const balance = balanceDoc.data();
        if (balance.totalStars < item.price) {
          throw new Error('Insufficient stars');
        }

        // Check if already owned
        const playerData = playerDoc.exists() ? playerDoc.data() : { ownedItemIds: [] };
        if (playerData.ownedItemIds.includes(item.id)) {
          throw new Error('Item already owned');
        }

        // Deduct stars
        transaction.update(balanceRef, {
          totalStars: balance.totalStars - item.price,
          lastUpdated: Timestamp.now(),
        });

        // Add item to owned
        transaction.set(playerRef, {
          ...playerData,
          childId,
          familyId,
          ownedItemIds: [...playerData.ownedItemIds, item.id],
          totalStars: balance.totalStars - item.price,
          updatedAt: Timestamp.now(),
        }, { merge: true });

        // Create transaction record
        const txRef = doc(db!, 'starTransactions', `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        transaction.set(txRef, {
          childId,
          familyId,
          type: 'redeem',
          stars: item.price,
          description: `${item.name}を購入`,
          shopItemId: item.id,
          createdAt: Timestamp.now(),
        });

        // Create owned item record
        const ownedRef = doc(db!, 'ownedItems', `${childId}_${item.id}`);
        transaction.set(ownedRef, {
          childId,
          itemId: item.id,
          purchasedAt: Timestamp.now(),
        });
      });

      return true;
    } catch (error) {
      console.error('Failed to purchase item:', error);
      return false;
    }
  }

  subscribeToPlayer(
    childId: string,
    callback: (player: PlayerData | null) => void
  ): () => void {
    return this.subscribeToDoc(childId, callback);
  }
}

// Shop Item Service (global items)
class ShopItemService extends BaseService<ShopItem> {
  constructor() {
    super('shopItems');
  }

  async getAllActive(): Promise<ShopItem[]> {
    return this.getAll({
      orderByField: 'price',
      orderDirection: 'asc',
    });
  }

  async getByCategory(category: string): Promise<ShopItem[]> {
    return this.getAll({
      filters: [{ field: 'category', operator: '==', value: category }],
      orderByField: 'price',
      orderDirection: 'asc',
    });
  }

  subscribeToAll(callback: (items: ShopItem[]) => void): () => void {
    return this.subscribe(
      {
        orderByField: 'price',
        orderDirection: 'asc',
      },
      callback
    );
  }
}

// Owned Item Service
class OwnedItemService extends BaseService<OwnedItem> {
  constructor() {
    super('ownedItems');
  }

  async getByChild(childId: string): Promise<OwnedItem[]> {
    return this.getByField('childId', childId);
  }

  subscribeToChild(
    childId: string,
    callback: (items: OwnedItem[]) => void
  ): () => void {
    return this.subscribe(
      {
        filters: [{ field: 'childId', operator: '==', value: childId }],
      },
      callback
    );
  }
}

export const playerDataService = new PlayerDataService();
export const shopItemService = new ShopItemService();
export const ownedItemService = new OwnedItemService();
