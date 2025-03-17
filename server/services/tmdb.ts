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

      // 포스터 URL을 완전한 URL로 변환
      const movies = response.data.results.map((movie: TMDBMovie) => {
        const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
        console.log('Movie poster URL:', posterUrl);
        return {
          ...movie,
          poster_path: posterUrl
        };
      });

      // 응답 데이터 로깅
      console.log('TMDB API Response:', {
        totalResults: response.data.total_results,
        totalPages: response.data.total_pages,
        sampleMovie: movies[0]
      });

      return movies;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
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

      // 응답 데이터 로깅
      console.log('Movie details:', {
        id: response.data.id,
        title: response.data.title,
        posterPath: response.data.poster_path
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

  // 테스트 목적의 메서드
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