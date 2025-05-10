import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHistoryItemSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const user = await storage.createUser(userData);
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Login failed" });
    }
  });

  // History routes
  app.post("/api/history", async (req, res) => {
    let savedItem: any;
    try {
      console.log("Received request to save history item");
      
      // Extract data from the request body
      let { userId, time, type, thoughts, details } = req.body;
      
      // Ensure userId is a safe integer
      const maxSafeInteger = 2147483647; // PostgreSQL integer limit
      if (typeof userId === 'number' && userId > maxSafeInteger) {
        console.log("User ID too large, using modulo operation to get a smaller ID");
        userId = userId % maxSafeInteger;
      }
      
      console.log("Request data:", { 
        userId, time, type, 
        hasThoughts: thoughts ? "yes" : "no", 
        hasDetails: details ? "yes" : "no" 
      });
      
      // First, ensure that the user exists in the database
      const userResult = await storage.ensureUserExists(userId);
      if (!userResult.success) {
        console.error("Failed to ensure user exists");
        return res.status(400).json({ message: "Failed to validate user" });
      }
      
      // If the user ID was remapped to a different database ID, use that
      if (userResult.mappedId && userResult.mappedId !== userId) {
        console.log(`Remapping user ID from ${userId} to ${userResult.mappedId}`);
        userId = userResult.mappedId;
      }
      
      // Prepare the data for database insertion
      let historyData: any = {
        userId,
        time,
        type
      };
      
      // Add thoughts if provided
      if (thoughts && thoughts.trim()) {
        historyData.thoughts = thoughts;
      }
      
      // Convert details to string if provided (limit size to avoid DB issues)
      if (details) {
        try {
          const detailsStr = typeof details === 'string' 
            ? details 
            : JSON.stringify(details);
            
          historyData.details = detailsStr.substring(0, 5000);
        } catch (e) {
          console.error("Error stringifying details:", e);
        }
      }
      
      console.log("Prepared history data");
      
      console.log("Raw history data before validation:", JSON.stringify(historyData, null, 2));
      
      // Validate the data against the schema
      try {
        const validatedData = insertHistoryItemSchema.parse(historyData);
        console.log("Validation successful, validated data:", JSON.stringify(validatedData, null, 2));
        
        // Save to database
        savedItem = await storage.createHistoryItem(validatedData);
        console.log("Item saved to database:", JSON.stringify(savedItem, null, 2));
      } catch (validationError) {
        console.error("Schema validation error:", validationError);
        throw validationError;
      }
      
      return res.status(201).json(savedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.message);
        return res.status(400).json({ message: error.message });
      }
      console.error("Error saving history:", error);
      return res.status(500).json({ message: "Failed to save history item" });
    }
  });

  app.get("/api/history/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const historyItems = await storage.getHistoryByUserId(userId);
      return res.json(historyItems);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await storage.deleteHistoryItem(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete history item" });
    }
  });

  // OpenAI Analysis route
  app.post("/api/analyze", async (req, res) => {
    try {
      const { time, message, language } = req.body;
      
      if (!time) {
        return res.status(400).json({ message: "Time is required" });
      }
      
      // Initialize OpenAI with API key
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Determine language for the prompt (default to English)
      const promptLanguage = language === 'fr' ? 'French' : 'English';
      
      // Create prompt based on language
      const prompt = `Analyze the following mirror hour and message. Return a short spiritual interpretation in ${promptLanguage}:

Time: ${time}
Message: ${message || "No message provided"}

Response:`;
      
      console.log("Sending request to OpenAI with prompt:", prompt);
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a spiritual guide specializing in interpreting mirror hours and numerical synchronicities. Your analysis should be mystical, thoughtful, and personal." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.8,
      });
      
      // Extract response
      const response = completion.choices[0].message.content?.trim();
      
      // Return the analysis
      return res.json({ analysis: response });
    } catch (error) {
      console.error("Error analyzing with OpenAI:", error);
      return res.status(500).json({ message: "Failed to analyze with OpenAI" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
