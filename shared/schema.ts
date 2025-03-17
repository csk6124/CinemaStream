import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
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

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  posterUrl: text("poster_url").notNull(),
  releaseYear: integer("release_year").notNull(),
  director: text("director").notNull(),
  cast: text("cast").array(),
  genres: text("genres").array(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const userWatchHistory = pgTable("user_watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  movieId: integer("movie_id").references(() => movies.id).notNull(),
  watchedAt: timestamp("watched_at").notNull().defaultNow(),
  watchDuration: integer("watch_duration").notNull(), // in seconds
  completed: boolean("completed").notNull().default(false)
});

export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  movieId: integer("movie_id").references(() => movies.id).notNull(),
  rating: real("rating").notNull(), // 1-5 scale
  ratedAt: timestamp("rated_at").notNull().defaultNow()
});

export const movieSimilarity = pgTable("movie_similarity", {
  id: serial("id").primaryKey(),
  movieId1: integer("movie_id_1").references(() => movies.id).notNull(),
  movieId2: integer("movie_id_2").references(() => movies.id).notNull(),
  similarityScore: real("similarity_score").notNull(), // 0-1 scale
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  photoUrl: true,
  googleId: true,
  isAdmin: true
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  imageUrl: true,
  videoUrl: true,
  authorId: true
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  courseId: true,
  content: true,
  type: true,
  options: true,
  correctAnswer: true
});

export const insertMovieSchema = createInsertSchema(movies);
export const insertWatchHistorySchema = createInsertSchema(userWatchHistory);
export const insertRatingSchema = createInsertSchema(userRatings);
export const insertSimilaritySchema = createInsertSchema(movieSimilarity);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type WatchHistory = typeof userWatchHistory.$inferSelect;
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type UserRating = typeof userRatings.$inferSelect;
export type InsertUserRating = z.infer<typeof insertRatingSchema>;
export type MovieSimilarity = typeof movieSimilarity.$inferSelect;
export type InsertMovieSimilarity = z.infer<typeof insertSimilaritySchema>;