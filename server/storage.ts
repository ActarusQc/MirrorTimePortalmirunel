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
    try {
      // First, check if the user exists by ID
      const user = await this.getUser(userId);
      if (user) {
        console.log(`User with ID ${userId} already exists`);
        return true;
      }
      
      // If not found by ID, check if the placeholder username already exists
      const username = `user_${userId}`;
      const existingUserByName = await this.getUserByUsername(username);
      if (existingUserByName) {
        console.log(`User with username ${username} already exists, but with a different ID`);
        // If the user exists but with a different ID, this is a special case
        // We could either update the user's ID or return true to allow using the existing user
        // For simplicity, we'll just return true
        return true;
      }
      
      // Create a placeholder user if it doesn't exist by ID or username
      const email = `user_${userId}@example.com`;
      await this.createUser({
        username,
        password: 'placeholder', 
        email
      });
      
      console.log(`Created placeholder user with ID ${userId}`);
      return true;
    } catch (e) {
      console.error('Failed during user existence check/creation:', e);
      
      // Special case: if this is a duplicate key error, the user likely exists already
      // This could happen in a race condition where the user was created between our check and insert
      if (e instanceof Error && e.message && 
          (e.message.includes('duplicate key') || e.message.includes('already exists'))) {
        console.log('User appears to already exist (from error message)');
        return true;
      }
      
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
