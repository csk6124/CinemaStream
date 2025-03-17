import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  googleId: text("google_id").notNull().unique(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  authorId: integer("author_id").references(() => users.id).notNull()
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'multiple_choice', 'short_answer', etc.
  options: text("options").array(), // For multiple choice questions
  correctAnswer: text("correct_answer").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// User Insert Schema
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  photoUrl: true,
  googleId: true,
  isAdmin: true
});

// Course Insert Schema
export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  imageUrl: true,
  videoUrl: true,
  authorId: true
});

// Question Insert Schema
export const insertQuestionSchema = createInsertSchema(questions).pick({
  courseId: true,
  content: true,
  type: true,
  options: true,
  correctAnswer: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;