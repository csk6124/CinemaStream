import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recommendationEngine } from "./recommendation";
import { tmdbService } from "./services/tmdb";
import { insertUserSchema, insertMovieSchema } from "@shared/schema";

// Replit 인증 미들웨어 개선
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const userId = req.headers['x-replit-user-id'];
    const userName = req.headers['x-replit-user-name'];

    // 개발 환경 또는 테스트용 임시 허용
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    if (!userId) {
      console.log('Authentication failed: No user ID provided');
      return res.status(401).json({ error: "Not authenticated" });
    }

    // 사용자 정보를 요청 객체에 추가
    req.user = {
      id: userId,
      name: userName
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: "Authentication failed" });
  }
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
  // Get current user endpoint
  app.get("/api/users/me", requireAuth, async (req, res) => {
    try {
      const userId = req.headers['x-replit-user-id'];
      const userName = req.headers['x-replit-user-name'];

      console.log('User authentication:', { userId, userName });

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
    } catch (error) {
      console.error("Error in /api/users/me:", error);
      res.status(500).json({ error: "Internal server error" });
    }
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

      const formattedMovie = {
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        year: new Date(movie.release_date).getFullYear(),
        rating: movie.vote_average / 2,
        genres: movie.genre_ids?.map(g => g.toString()) || []
      };

      res.json(formattedMovie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });

  // Get personalized movie recommendations
  app.get("/api/recommendations", async (_req, res) => {
    try {
      console.log('Fetching recommendations...', {
        environment: process.env.NODE_ENV,
        tmdbKeyExists: !!process.env.TMDB_API_KEY
      });

      // 여러 카테고리의 영화 데이터 가져오기
      const [popular, nowPlaying, topRated, upcoming, action, drama] = await Promise.all([
        tmdbService.getPopularMovies(),
        tmdbService.getNowPlayingMovies(),
        tmdbService.getTopRatedMovies(),
        tmdbService.getUpcomingMovies(),
        tmdbService.getMoviesByGenre(28), // 액션 장르 ID
        tmdbService.getMoviesByGenre(18)  // 드라마 장르 ID
      ]);

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
        popular: popular.slice(0, 10).map(formatMovie),
        nowPlaying: nowPlaying.slice(0, 10).map(formatMovie),
        topRated: topRated.slice(0, 10).map(formatMovie),
        upcoming: upcoming.slice(0, 10).map(formatMovie),
        action: action.slice(0, 10).map(formatMovie),
        drama: drama.slice(0, 10).map(formatMovie)
      };

      console.log('Recommendations response:', {
        popularCount: recommendations.popular.length,
        nowPlayingCount: recommendations.nowPlaying.length,
        topRatedCount: recommendations.topRated.length,
        upcomingCount: recommendations.upcoming.length,
        actionCount: recommendations.action.length,
        dramaCount: recommendations.drama.length
      });

      if (Object.values(recommendations).every(arr => arr.length === 0)) {
        console.error('No recommendations available from any category');
        return res.status(500).json({ error: "Failed to fetch recommendations" });
      }

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

  // TMDB API 테스트 엔드포인트
  app.get("/api/test/recommendations", async (_req, res) => {
    try {
      console.log('Testing recommendations API...');

      // 1. 인기 영화 가져오기
      const popularMovies = await tmdbService.getPopularMovies();
      console.log('Popular movies fetched:', popularMovies.length);

      if (!popularMovies.length) {
        return res.status(500).json({ error: "Failed to fetch popular movies" });
      }

      // 2. 비슷한 영화 가져오기
      const similarMovies = await tmdbService.getSimilarMovies(popularMovies[0].id);
      console.log('Similar movies fetched:', similarMovies.length);

      // 영화 정보 포맷팅 함수
      const formatMovie = (movie: any) => ({
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        year: new Date(movie.release_date).getFullYear(),
        rating: movie.vote_average / 2
      });

      // 3. 추천 응답 구성
      const recommendations = {
        popular: popularMovies.slice(0, 10).map(formatMovie),
        similar: similarMovies.slice(0, 10).map(formatMovie)
      };

      // 4. 상세 로깅
      console.log('Test response:', {
        popularCount: recommendations.popular.length,
        similarCount: recommendations.similar.length,
        samplePopular: recommendations.popular[0],
        sampleSimilar: recommendations.similar[0]
      });

      res.json(recommendations);
    } catch (error) {
      console.error("Error testing recommendations:", error);
      res.status(500).json({ error: "Failed to test recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}