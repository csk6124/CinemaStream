import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recommendationEngine } from "./recommendation";
import { tmdbService } from "./services/tmdb";
import { insertUserSchema, insertMovieSchema, insertCourseSchema, insertQuestionSchema } from "@shared/schema";

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
    try {
      const movieId = parseInt(req.params.id);
      const movie = await tmdbService.getMovieDetails(movieId);

      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }

      // TMDB 데이터를 우리 앱의 형식으로 변환
      const formattedMovie = {
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        year: new Date(movie.release_date).getFullYear(),
        rating: movie.vote_average / 2, // TMDB는 10점 만점, 우리는 5점 만점
        genres: movie.genre_ids?.map(g => g.toString()) || [],
        cast: [], // 임시로 빈 배열 전달
        director: 'Unknown' // 임시 디렉터 정보
      };

      res.json(formattedMovie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });

  // Get personalized movie recommendations
  app.get("/api/recommendations", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.headers['x-replit-user-id'] as string);
      const limit = parseInt(req.query.limit as string) || 10;

      // 인기 영화 리스트 가져오기
      const popularMovies = await tmdbService.getPopularMovies();
      
      // 비슷한 영화 리스트 가져오기 (첫 번째 영화 기준)
      const similarMovies = popularMovies.length > 0 
        ? await tmdbService.getSimilarMovies(popularMovies[0].id)
        : [];

      // 영화 정보 포맷팅 함수
      const formatMovie = (movie: any) => ({
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        year: new Date(movie.release_date).getFullYear(),
        rating: movie.vote_average / 2
      });

      // 각 카테고리별 영화 리스트 구성
      const recommendations = {
        popular: popularMovies.slice(0, limit).map(formatMovie),
        similar: similarMovies.slice(0, limit).map(formatMovie)
      };

      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // Add rating for a movie
  app.post("/api/movies/:id/rate", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.headers['x-replit-user-id'] as string);
      const movieId = parseInt(req.params.id);
      const rating = parseFloat(req.body.rating);

      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Invalid rating. Must be between 1 and 5" });
      }

      await storage.addMovieRating(userId, movieId, rating);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding rating:", error);
      res.status(500).json({ error: "Failed to add rating" });
    }
  });

  // Record watch history
  app.post("/api/movies/:id/watch", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.headers['x-replit-user-id'] as string);
      const movieId = parseInt(req.params.id);
      const { duration, completed } = req.body;

      await storage.recordWatchHistory(userId, movieId, duration, completed);
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording watch history:", error);
      res.status(500).json({ error: "Failed to record watch history" });
    }
  });

  // TMDB API 테스트 엔드포인트
  app.get("/api/test/tmdb", async (_req, res) => {
    try {
      // API 연결 테스트
      const isConnected = await tmdbService.testConnection();
      if (!isConnected) {
        return res.status(500).json({ error: "TMDB API connection failed" });
      }

      // 인기 영화 가져오기 테스트
      const movies = await tmdbService.getPopularMovies(1);
      if (!movies.length) {
        return res.status(500).json({ error: "Failed to fetch popular movies" });
      }

      // 첫 번째 영화의 상세 정보 가져오기 테스트
      const movieDetails = await tmdbService.getMovieDetails(movies[0].id);
      if (!movieDetails) {
        return res.status(500).json({ error: "Failed to fetch movie details" });
      }

      res.json({
        success: true,
        connection: isConnected,
        sampleMovie: {
          ...movieDetails,
          fullPosterUrl: movieDetails.poster_path
            ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
            : null
        }
      });
    } catch (error) {
      console.error("TMDB API test failed:", error);
      res.status(500).json({ error: "TMDB API test failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}