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

import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Ensure that a user exists with the given ID for history operations
  async ensureUserExists(userId: number): Promise<boolean> {
    // Check if the user exists
    const user = await this.getUser(userId);
    
    if (user) return true;
    
    try {
      // Create a placeholder user if it doesn't exist
      const username = `user_${userId}`;
      const email = `user_${userId}@example.com`;
      
      await this.createUser({
        username,
        password: 'placeholder', 
        email
      });
      
      return true;
    } catch (e) {
      console.error('Failed to create placeholder user:', e);
      return false;
    }
  }
  
  async createHistoryItem(insertItem: InsertHistoryItem): Promise<HistoryItem> {
    const [historyItem] = await db
      .insert(historyItems)
      .values(insertItem)
      .returning();
    return historyItem;
  }
  
  async getHistoryByUserId(userId: number): Promise<HistoryItem[]> {
    return await db
      .select()
      .from(historyItems)
      .where(eq(historyItems.userId, userId))
      .orderBy(desc(historyItems.savedAt));
  }
  
  async deleteHistoryItem(id: number): Promise<void> {
    await db
      .delete(historyItems)
      .where(eq(historyItems.id, id));
  }
}

export const storage = new DatabaseStorage();
