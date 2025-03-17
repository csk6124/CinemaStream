import { 
  users, type User, type InsertUser,
  courses, type Course, type InsertCourse,
  questions, type Question, type InsertQuestion,
  userJourneyProgress, type UserJourneyProgress, type InsertJourneyProgress,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  achievements, type Achievement, type InsertAchievement
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // User Journey methods
  getUserJourneyProgress(userId: number): Promise<UserJourneyProgress | undefined>;
  updateUserJourneyProgress(userId: number, progress: Partial<InsertJourneyProgress>): Promise<UserJourneyProgress>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  unlockAchievement(userId: number, achievementId: string): Promise<UserAchievement>;
  updateAchievementProgress(userId: number, achievementId: string, progress: number): Promise<UserAchievement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private journeyProgress: Map<number, UserJourneyProgress>;
  private userAchievements: Map<number, UserAchievement[]>;
  private courses: Map<number, Course>;
  private questions: Map<number, Question>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.journeyProgress = new Map();
    this.userAchievements = new Map();
    this.courses = new Map();
    this.questions = new Map();
    this.currentId = 1;
  }

  // Existing user methods...
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now,
      isAdmin: insertUser.isAdmin ?? false,
      photoUrl: insertUser.photoUrl ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...existingUser,
      ...updateData,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // New User Journey methods
  async getUserJourneyProgress(userId: number): Promise<UserJourneyProgress | undefined> {
    return this.journeyProgress.get(userId);
  }

  async updateUserJourneyProgress(userId: number, progress: Partial<InsertJourneyProgress>): Promise<UserJourneyProgress> {
    const existingProgress = await this.getUserJourneyProgress(userId);
    const now = new Date();

    const updatedProgress: UserJourneyProgress = {
      id: existingProgress?.id ?? this.currentId++,
      userId,
      totalWatched: progress.totalWatched ?? existingProgress?.totalWatched ?? 0,
      totalRated: progress.totalRated ?? existingProgress?.totalRated ?? 0,
      lastActive: now,
      watchTime: progress.watchTime ?? existingProgress?.watchTime ?? 0,
      favoriteGenres: progress.favoriteGenres ?? existingProgress?.favoriteGenres ?? {},
      achievements: progress.achievements ?? existingProgress?.achievements ?? [],
      createdAt: existingProgress?.createdAt ?? now,
      updatedAt: now
    };

    this.journeyProgress.set(userId, updatedProgress);
    return updatedProgress;
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return this.userAchievements.get(userId) ?? [];
  }

  async unlockAchievement(userId: number, achievementId: string): Promise<UserAchievement> {
    const userAchievements = this.userAchievements.get(userId) ?? [];
    const now = new Date();

    const achievement: UserAchievement = {
      id: this.currentId++,
      userId,
      achievementId,
      unlockedAt: now,
      progress: 100,
      completed: true
    };

    userAchievements.push(achievement);
    this.userAchievements.set(userId, userAchievements);
    return achievement;
  }

  async updateAchievementProgress(userId: number, achievementId: string, progress: number): Promise<UserAchievement> {
    const userAchievements = this.userAchievements.get(userId) ?? [];
    const existingAchievement = userAchievements.find(a => a.achievementId === achievementId);

    if (existingAchievement) {
      existingAchievement.progress = progress;
      existingAchievement.completed = progress >= 100;
      if (existingAchievement.completed && !existingAchievement.unlockedAt) {
        existingAchievement.unlockedAt = new Date();
      }
    } else {
      const newAchievement: UserAchievement = {
        id: this.currentId++,
        userId,
        achievementId,
        unlockedAt: progress >= 100 ? new Date() : null,
        progress,
        completed: progress >= 100
      };
      userAchievements.push(newAchievement);
    }

    this.userAchievements.set(userId, userAchievements);
    return existingAchievement ?? userAchievements[userAchievements.length - 1];
  }

  // Course methods
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentId++;
    const now = new Date();
    const course: Course = {
      ...insertCourse,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, updateData: Partial<InsertCourse>): Promise<Course> {
    const existingCourse = await this.getCourse(id);
    if (!existingCourse) {
      throw new Error("Course not found");
    }

    const updatedCourse: Course = {
      ...existingCourse,
      ...updateData,
      updatedAt: new Date()
    };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  // Question methods
  async getAllQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentId++;
    const now = new Date();
    const question: Question = {
      ...insertQuestion,
      id,
      createdAt: now
    };
    this.questions.set(id, question);
    return question;
  }

  async updateQuestion(id: number, updateData: Partial<InsertQuestion>): Promise<Question> {
    const existingQuestion = await this.getQuestion(id);
    if (!existingQuestion) {
      throw new Error("Question not found");
    }

    const updatedQuestion: Question = {
      ...existingQuestion,
      ...updateData
    };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }
}

export const storage = new MemStorage();