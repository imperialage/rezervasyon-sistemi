import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
  pendingOperations: {
    key: string;
    value: {
      id: string;
      operation: 'create' | 'update' | 'delete';
      collection: string;
      data: any;
      timestamp: number;
    };
  };
  offlineData: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'offlineStore';
const DB_VERSION = 1;

export class OfflineStore {
  private db: IDBPDatabase<OfflineDB> | null = null;

  async init() {
    this.db = await openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('pendingOperations', { keyPath: 'id' });
        db.createObjectStore('offlineData', { keyPath: 'id' });
      },
    });
  }

  async addPendingOperation(operation: {
    operation: 'create' | 'update' | 'delete';
    collection: string;
    data: any;
  }) {
    if (!this.db) await this.init();
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.db!.add('pendingOperations', {
      id,
      ...operation,
      timestamp: Date.now(),
    });
  }

  async getPendingOperations() {
    if (!this.db) await this.init();
    return this.db!.getAll('pendingOperations');
  }

  async clearPendingOperation(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('pendingOperations', id);
  }

  async storeOfflineData(collection: string, data: any) {
    if (!this.db) await this.init();
    await this.db!.put('offlineData', {
      id: `${collection}_${data.id}`,
      ...data,
    });
  }

  async getOfflineData(collection: string, id: string) {
    if (!this.db) await this.init();
    return this.db!.get('offlineData', `${collection}_${id}`);
  }

  async getAllOfflineData(collection: string) {
    if (!this.db) await this.init();
    const all = await this.db!.getAll('offlineData');
    return all.filter(item => item.id.startsWith(collection));
  }
}

export const offlineStore = new OfflineStore();