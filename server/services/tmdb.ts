import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.error('Critical Error: TMDB_API_KEY is not set in environment variables');
  throw new Error('TMDB_API_KEY is required');
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export class TMDBService {
  private static instance: TMDBService;

  private constructor() {
    console.log('TMDB Service initialized. Environment:', {
      nodeEnv: process.env.NODE_ENV,
      apiKeyExists: !!TMDB_API_KEY,
      baseUrl: BASE_URL
    });
  }

  static getInstance(): TMDBService {
    if (!this.instance) {
      this.instance = new TMDBService();
    }
    return this.instance;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T | null> {
    try {
      if (!TMDB_API_KEY) {
        throw new Error('TMDB_API_KEY is not set');
      }

      console.log(`Making TMDB API request to ${endpoint}`, {
        params: { ...params, api_key: '***' }
      });

      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR',
          ...params
        }
      });

      console.log(`TMDB API response from ${endpoint}:`, {
        status: response.status,
        hasData: !!response.data,
        dataType: response.data ? typeof response.data : null
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`TMDB API Error (${endpoint}):`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
      } else {
        console.error(`TMDB API Error (${endpoint}):`, error);
      }
      return null;
    }
  }

  async getPopularMovies(page: number = 1): Promise<TMDBMovie[]> {
    const data = await this.makeRequest<{results: TMDBMovie[]}>('/movie/popular', { page });
    return data?.results || [];
  }

  async getNowPlayingMovies(page: number = 1): Promise<TMDBMovie[]> {
    const data = await this.makeRequest<{results: TMDBMovie[]}>('/movie/now_playing', { page });
    return data?.results || [];
  }

  async getTopRatedMovies(page: number = 1): Promise<TMDBMovie[]> {
    const data = await this.makeRequest<{results: TMDBMovie[]}>('/movie/top_rated', { page });
    return data?.results || [];
  }

  async getUpcomingMovies(page: number = 1): Promise<TMDBMovie[]> {
    const data = await this.makeRequest<{results: TMDBMovie[]}>('/movie/upcoming', { page });
    return data?.results || [];
  }

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBMovie[]> {
    const data = await this.makeRequest<{results: TMDBMovie[]}>('/discover/movie', { 
      with_genres: genreId,
      page 
    });
    return data?.results || [];
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
    return this.makeRequest<TMDBMovie>(`/movie/${movieId}`);
  }

  async getSimilarMovies(movieId: number): Promise<TMDBMovie[]> {
    const data = await this.makeRequest<{results: TMDBMovie[]}>(`/movie/${movieId}/similar`);
    return data?.results || [];
  }

  async searchMovies(query: string): Promise<TMDBMovie[]> {
    const data = await this.makeRequest<{results: TMDBMovie[]}>('/search/movie', { query });
    return data?.results || [];
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing TMDB API connection...');
      const config = await this.makeRequest('/configuration');
      console.log('TMDB Configuration:', config);
      return !!config;
    } catch (error) {
      console.error('TMDB connection test failed:', error);
      return false;
    }
  }
}

export const tmdbService = TMDBService.getInstance();