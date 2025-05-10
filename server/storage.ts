import { 
  users, type User, type InsertUser,
  historyItems, type HistoryItem, type InsertHistoryItem 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  ensureUserExists(userId: number): Promise<{ success: boolean; mappedId?: number }>;
  
  createHistoryItem(item: InsertHistoryItem): Promise<HistoryItem>;
  getHistoryByUserId(userId: number): Promise<HistoryItem[]>;
  deleteHistoryItem(id: number): Promise<void>;
  findRecentDuplicateItem(userId: number, time: string, type: string): Promise<HistoryItem | undefined>;
}

import { db } from "./db";
import { eq, desc, and, gt } from "drizzle-orm";

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
  async ensureUserExists(userId: number): Promise<{ success: boolean; mappedId?: number }> {
    try {
      // First, check if the user exists by ID
      const user = await this.getUser(userId);
      if (user) {
        console.log(`User with ID ${userId} already exists`);
        return { success: true, mappedId: userId };
      }
      
      // If not found by ID, check if the placeholder username already exists
      const username = `user_${userId}`;
      const existingUserByName = await this.getUserByUsername(username);
      if (existingUserByName) {
        console.log(`User with username ${username} already exists with ID ${existingUserByName.id}`);
        // Return success and the existing user's ID for the client to use
        return { success: true, mappedId: existingUserByName.id };
      }
      
      // Create a placeholder user if it doesn't exist by ID or username
      const email = `user_${userId}@example.com`;
      const newUser = await this.createUser({
        username,
        password: 'placeholder', 
        email
      });
      
      console.log(`Created placeholder user with ID ${newUser.id}`);
      return { success: true, mappedId: newUser.id };
    } catch (e) {
      console.error('Failed during user existence check/creation:', e);
      
      // Special case: if this is a duplicate key error, the user likely exists already
      // This could happen in a race condition where the user was created between our check and insert
      if (e instanceof Error && e.message && 
          (e.message.includes('duplicate key') || e.message.includes('already exists'))) {
        console.log('User appears to already exist (from error message)');
        // In this case, try to look up the user by username again
        try {
          const username = `user_${userId}`;
          const user = await this.getUserByUsername(username);
          if (user) {
            return { success: true, mappedId: user.id };
          }
        } catch (lookupError) {
          console.error('Failed to look up user after duplicate key error:', lookupError);
        }
        
        // If we can't get the mapped ID, return generic success
        return { success: true };
      }
      
      return { success: false };
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
  
  async findRecentDuplicateItem(userId: number, time: string, type: string): Promise<HistoryItem | undefined> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 1 minute ago
    
    // Find items with same time and type for the user in the last minute
    const [item] = await db
      .select()
      .from(historyItems)
      .where(
        sql`${historyItems.userId} = ${userId} AND 
            ${historyItems.time} = ${time} AND 
            ${historyItems.type} = ${type} AND
            ${historyItems.savedAt} > ${oneMinuteAgo.toISOString()}`
      )
      .orderBy(desc(historyItems.savedAt))
      .limit(1);
      
    return item;
  }
}

export const storage = new DatabaseStorage();
