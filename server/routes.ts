import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recommendationEngine } from "./recommendation";
import { tmdbService } from "./services/tmdb";
import { insertUserSchema, insertMovieSchema } from "@shared/schema";

// Middleware to check if user is authenticated using Replit
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const userId = req.headers['x-replit-user-id'] as string;
    const userName = req.headers['x-replit-user-name'] as string;

    // Allow development environment
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    if (!userId) {
      console.log('Authentication failed: No user ID provided');
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Add user info to request
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user endpoint
  app.get("/api/users/me", requireAuth, async (req, res) => {
    try {
      const userId = req.headers['x-replit-user-id'] as string;
      const userName = req.headers['x-replit-user-name'] as string;

      console.log('User authentication:', { userId, userName });

      // Try to get existing user
      let user = await storage.getUser(parseInt(userId));

      if (!user) {
        // Create new user if doesn't exist
        try {
          user = await storage.createUser({
            id: parseInt(userId),
            name: userName || '',
            email: `${userName || ''}@repl.it`, // Placeholder email
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
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
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

  // User Journey endpoints
  app.get("/api/users/me/progress", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.headers['x-replit-user-id'] as string);
      const progress = await storage.getUserJourneyProgress(userId);

      if (!progress) {
        // Initialize progress if it doesn't exist
        const newProgress = await storage.updateUserJourneyProgress(userId, {
          totalWatched: 0,
          totalRated: 0,
          watchTime: 0,
          favoriteGenres: {},
          achievements: []
        });
        return res.json(newProgress);
      }

      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ error: "Failed to fetch user progress" });
    }
  });

  app.get("/api/users/me/achievements", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.headers['x-replit-user-id'] as string);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });

  // Record movie watch progress
  app.post("/api/movies/:id/watch", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.headers['x-replit-user-id'] as string);
      const movieId = parseInt(req.params.id);
      const { duration, completed } = req.body;

      // Update watch history
      const progress = await storage.getUserJourneyProgress(userId);
      await storage.updateUserJourneyProgress(userId, {
        totalWatched: (progress?.totalWatched ?? 0) + (completed ? 1 : 0),
        watchTime: (progress?.watchTime ?? 0) + duration
      });

      // Check for achievements
      if (completed) {
        const totalWatched = (progress?.totalWatched ?? 0) + 1;

        // Movie Watcher achievements
        if (totalWatched === 1) {
          await storage.unlockAchievement(userId, 'first-movie');
        }
        if (totalWatched === 10) {
          await storage.unlockAchievement(userId, 'movie-buff');
        }
        if (totalWatched === 50) {
          await storage.unlockAchievement(userId, 'movie-expert');
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error recording watch history:", error);
      res.status(500).json({ error: "Failed to record watch history" });
    }
  });

  // Update movie rating
  app.post("/api/movies/:id/rate", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.headers['x-replit-user-id'] as string);
      const movieId = parseInt(req.params.id);
      const rating = parseFloat(req.body.rating);

      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Invalid rating. Must be between 1 and 5" });
      }

      // Update user journey progress
      const progress = await storage.getUserJourneyProgress(userId);
      await storage.updateUserJourneyProgress(userId, {
        totalRated: (progress?.totalRated ?? 0) + 1
      });

      // Check for rating achievements
      const totalRated = (progress?.totalRated ?? 0) + 1;
      if (totalRated === 1) {
        await storage.unlockAchievement(userId, 'first-rating');
      }
      if (totalRated === 10) {
        await storage.unlockAchievement(userId, 'rating-enthusiast');
      }
      if (totalRated === 50) {
        await storage.unlockAchievement(userId, 'rating-expert');
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error adding rating:", error);
      res.status(500).json({ error: "Failed to add rating" });
    }
  });

  // TMDB API Test endpoints
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

const requireAdmin = async (req: any, res: any, next: any) => {
  const userId = req.headers['x-replit-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await storage.getUser(parseInt(userId));
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Not authorized" });
  }

  next();
};