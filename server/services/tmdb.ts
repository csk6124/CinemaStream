import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export class TMDBService {
  private static instance: TMDBService;
  private constructor() {}

  static getInstance(): TMDBService {
    if (!this.instance) {
      this.instance = new TMDBService();
    }
    return this.instance;
  }

  async getPopularMovies(page: number = 1): Promise<TMDBMovie[]> {
    try {
      const response = await axios.get(`${BASE_URL}/movie/popular`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR',
          page
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
    try {
      const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }

  async getSimilarMovies(movieId: number): Promise<TMDBMovie[]> {
    try {
      const response = await axios.get(`${BASE_URL}/movie/${movieId}/similar`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR'
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching similar movies:', error);
      return [];
    }
  }

  async searchMovies(query: string): Promise<TMDBMovie[]> {
    try {
      const response = await axios.get(`${BASE_URL}/search/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR',
          query
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  }
}

export const tmdbService = TMDBService.getInstance();
