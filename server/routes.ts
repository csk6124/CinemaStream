import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCourseSchema, insertQuestionSchema } from "@shared/schema";

// Middleware to check if user is authenticated using Replit
const requireAuth = (req: any, res: any, next: any) => {
  const userId = req.headers['x-replit-user-id'];
  const userName = req.headers['x-replit-user-name'];

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Add user info to request
  req.user = {
    id: userId,
    name: userName
  };

  next();
};

// Middleware to check if user is admin
const requireAdmin = async (req: any, res: any, next: any) => {
  const userId = req.headers['x-replit-user-id'];
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await storage.getUser(parseInt(userId));
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Not authorized" });
  }

  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user
  app.get("/api/users/me", requireAuth, async (req, res) => {
    const userId = req.headers['x-replit-user-id'];
    const userName = req.headers['x-replit-user-name'];

    // Try to get existing user
    let user = await storage.getUser(parseInt(userId));

    if (!user) {
      // Create new user if doesn't exist
      try {
        user = await storage.createUser({
          id: parseInt(userId),
          name: userName,
          email: `${userName}@repl.it`, // Placeholder email
          isAdmin: false
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: "Failed to create user" });
      }
    }

    res.json(user);
  });

  // Create user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      //req.session.userId = user.id;  // Removed session setting
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Get all users (admin only)
  app.get("/api/users", requireAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Get all courses (admin only)
  app.get("/api/courses", requireAdmin, async (_req, res) => {
    const courses = await storage.getAllCourses();
    res.json(courses);
  });

  // Create course (admin only)
  app.post("/api/courses", requireAdmin, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: "Invalid course data" });
    }
  });

  // Get all questions (admin only)
  app.get("/api/questions", requireAdmin, async (_req, res) => {
    const questions = await storage.getAllQuestions();
    res.json(questions);
  });

  // Create question (admin only)
  app.post("/api/questions", requireAdmin, async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      res.status(400).json({ error: "Invalid question data" });
    }
  });

  // Movie routes
  app.get("/api/movies/:id", async (req, res) => {
    const movieId = req.params.id;
    // 임시 데이터
    const movie = {
      id: movieId,
      title: "인터스텔라",
      description: "인류의 미래를 위해 새로운 거주지를 찾아 우주로 떠나는 탐험대의 이야기",
      posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0",
      year: 2014,
      director: "크리스토퍼 놀란",
      cast: ["매튜 맥커너히", "앤 해서웨이"],
      rating: 4.8
    };
    res.json(movie);
  });

  const httpServer = createServer(app);
  return httpServer;
}