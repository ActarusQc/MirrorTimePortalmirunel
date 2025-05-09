import { 
  users, type User, type InsertUser,
  historyItems, type HistoryItem, type InsertHistoryItem 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createHistoryItem(item: InsertHistoryItem): Promise<HistoryItem>;
  getHistoryByUserId(userId: number): Promise<HistoryItem[]>;
  deleteHistoryItem(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private historyItems: Map<number, HistoryItem>;
  private userId: number;
  private historyId: number;

  constructor() {
    this.users = new Map();
    this.historyItems = new Map();
    this.userId = 1;
    this.historyId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async createHistoryItem(insertItem: InsertHistoryItem): Promise<HistoryItem> {
    const id = this.historyId++;
    const savedAt = new Date();
    const historyItem: HistoryItem = { ...insertItem, id, savedAt };
    this.historyItems.set(id, historyItem);
    return historyItem;
  }
  
  async getHistoryByUserId(userId: number): Promise<HistoryItem[]> {
    return Array.from(this.historyItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  }
  
  async deleteHistoryItem(id: number): Promise<void> {
    this.historyItems.delete(id);
  }
}

export const storage = new MemStorage();
