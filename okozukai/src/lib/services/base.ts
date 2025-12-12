import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  DocumentData,
  WhereFilterOp,
} from 'firebase/firestore';

// Convert Firestore Timestamp to Date
export function timestampToDate(timestamp: Timestamp | Date | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

// Convert Date to Firestore Timestamp
export function dateToTimestamp(date: Date | Timestamp | undefined): Timestamp {
  if (!date) return Timestamp.now();
  if (date instanceof Timestamp) return date;
  return Timestamp.fromDate(date);
}

// Convert document data with timestamps to dates
export function convertTimestamps<T extends DocumentData>(data: T): T {
  const result = { ...data } as T;
  for (const key in result) {
    const value = (result as DocumentData)[key];
    if (value instanceof Timestamp) {
      (result as DocumentData)[key] = value.toDate();
    }
  }
  return result;
}

export interface BaseDocument {
  id: string;
  createdAt: Date;
}

export type QueryFilter = {
  field: string;
  operator: WhereFilterOp;
  value: unknown;
};

export type QueryOptions = {
  filters?: QueryFilter[];
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
};

export class BaseService<T extends BaseDocument> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collectionRef() {
    if (!db) throw new Error('Firestore is not configured');
    return collection(db, this.collectionName);
  }

  protected docRef(id: string) {
    if (!db) throw new Error('Firestore is not configured');
    return doc(db, this.collectionName, id);
  }

  protected buildQuery(options: QueryOptions): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    if (options.filters) {
      for (const filter of options.filters) {
        constraints.push(where(filter.field, filter.operator, filter.value));
      }
    }

    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || 'desc'));
    }

    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    return constraints;
  }

  async getById(id: string): Promise<T | null> {
    if (!db) return null;

    const docSnap = await getDoc(this.docRef(id));
    if (!docSnap.exists()) return null;

    return convertTimestamps({
      id: docSnap.id,
      ...docSnap.data(),
    }) as T;
  }

  async getAll(options: QueryOptions = {}): Promise<T[]> {
    if (!db) return [];

    const constraints = this.buildQuery(options);
    const q = query(this.collectionRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc =>
      convertTimestamps({
        id: doc.id,
        ...doc.data(),
      }) as T
    );
  }

  async getByField(field: string, value: unknown): Promise<T[]> {
    return this.getAll({
      filters: [{ field, operator: '==', value }],
    });
  }

  async create(data: Omit<T, 'id'>): Promise<string> {
    if (!db) throw new Error('Firestore is not configured');

    const docData = {
      ...data,
      createdAt: dateToTimestamp(data.createdAt as Date),
    };

    const docRef = await addDoc(this.collectionRef, docData);
    return docRef.id;
  }

  async createWithId(id: string, data: Omit<T, 'id'>): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');

    const docData = {
      ...data,
      createdAt: dateToTimestamp(data.createdAt as Date),
    };

    await setDoc(this.docRef(id), docData);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');

    const updateData = { ...data } as DocumentData;

    // Convert any Date fields to Timestamps
    for (const key in updateData) {
      if (updateData[key] instanceof Date) {
        updateData[key] = dateToTimestamp(updateData[key] as Date);
      }
    }

    await updateDoc(this.docRef(id), updateData);
  }

  async delete(id: string): Promise<void> {
    if (!db) throw new Error('Firestore is not configured');
    await deleteDoc(this.docRef(id));
  }

  subscribe(
    options: QueryOptions,
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const constraints = this.buildQuery(options);
    const q = query(this.collectionRef, ...constraints);

    return onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc =>
          convertTimestamps({
            id: doc.id,
            ...doc.data(),
          }) as T
        );
        callback(data);
      },
      (error) => {
        console.error(`Error subscribing to ${this.collectionName}:`, error);
        errorCallback?.(error);
      }
    );
  }

  subscribeToDoc(
    id: string,
    callback: (data: T | null) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    if (!db) {
      callback(null);
      return () => {};
    }

    return onSnapshot(
      this.docRef(id),
      (docSnap) => {
        if (!docSnap.exists()) {
          callback(null);
          return;
        }
        callback(
          convertTimestamps({
            id: docSnap.id,
            ...docSnap.data(),
          }) as T
        );
      },
      (error) => {
        console.error(`Error subscribing to ${this.collectionName}/${id}:`, error);
        errorCallback?.(error);
      }
    );
  }
}

// Check if Firestore is available
export function isFirestoreAvailable(): boolean {
  return db !== null;
}
