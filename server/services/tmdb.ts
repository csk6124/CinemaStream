import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

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
  private constructor() {}

  static getInstance(): TMDBService {
    if (!this.instance) {
      this.instance = new TMDBService();
    }
    return this.instance;
  }

  async getPopularMovies(page: number = 1): Promise<TMDBMovie[]> {
    try {
      console.log('Fetching popular movies from TMDB...');
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

  async getNowPlayingMovies(page: number = 1): Promise<TMDBMovie[]> {
    try {
      console.log('Fetching now playing movies...');
      const response = await axios.get(`${BASE_URL}/movie/now_playing`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR',
          page
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      return [];
    }
  }

  async getTopRatedMovies(page: number = 1): Promise<TMDBMovie[]> {
    try {
      console.log('Fetching top rated movies...');
      const response = await axios.get(`${BASE_URL}/movie/top_rated`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR',
          page
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      return [];
    }
  }

  async getUpcomingMovies(page: number = 1): Promise<TMDBMovie[]> {
    try {
      console.log('Fetching upcoming movies...');
      const response = await axios.get(`${BASE_URL}/movie/upcoming`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR',
          page
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      return [];
    }
  }

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBMovie[]> {
    try {
      console.log(`Fetching movies for genre ${genreId}...`);
      const response = await axios.get(`${BASE_URL}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'ko-KR',
          with_genres: genreId,
          page
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      return [];
    }
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
    try {
      console.log(`Fetching details for movie ID ${movieId}...`);
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

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${BASE_URL}/configuration`, {
        params: {
          api_key: TMDB_API_KEY
        }
      });
      console.log('TMDB Configuration:', response.data);
      return true;
    } catch (error) {
      console.error('TMDB connection test failed:', error);
      return false;
    }
  }
}

export const tmdbService = TMDBService.getInstance();