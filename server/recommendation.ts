import { storage } from "./storage";
import type { Movie, UserRating, MovieSimilarity } from "@shared/schema";

interface RecommendationScore {
  movieId: number;
  score: number;
}

export class RecommendationEngine {
  // 사용자 기반 협업 필터링을 사용한 영화 추천
  async getPersonalizedRecommendations(userId: number, limit: number = 10): Promise<Movie[]> {
    try {
      // 1. 사용자의 평점 데이터 가져오기
      const userRatings = await storage.getUserRatings(userId);
      if (!userRatings.length) {
        return this.getPopularMovies(limit);
      }

      // 2. 유사한 영화 찾기
      const recommendations: RecommendationScore[] = [];
      for (const rating of userRatings) {
        const similarMovies = await storage.getSimilarMovies(rating.movieId);
        for (const similar of similarMovies) {
          // 이미 본 영화는 제외
          if (userRatings.some(r => r.movieId === similar.movieId2)) {
            continue;
          }
          
          // 추천 점수 계산
          const score = rating.rating * similar.similarityScore;
          const existing = recommendations.find(r => r.movieId === similar.movieId2);
          if (existing) {
            existing.score = Math.max(existing.score, score);
          } else {
            recommendations.push({ movieId: similar.movieId2, score });
          }
        }
      }

      // 3. 점수순으로 정렬하고 상위 N개 추천
      recommendations.sort((a, b) => b.score - a.score);
      const topRecommendations = recommendations.slice(0, limit);
      
      // 4. 영화 정보 가져오기
      const movies = await Promise.all(
        topRecommendations.map(rec => storage.getMovie(rec.movieId))
      );

      return movies.filter((movie): movie is Movie => movie !== null);
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      return this.getPopularMovies(limit);
    }
  }

  // 인기 영화 추천 (폴백 메서드)
  private async getPopularMovies(limit: number): Promise<Movie[]> {
    try {
      return await storage.getPopularMovies(limit);
    } catch (error) {
      console.error("Error getting popular movies:", error);
      return [];
    }
  }

  // 유사도 점수 업데이트 (배치 작업으로 실행)
  async updateSimilarityScores(): Promise<void> {
    try {
      const movies = await storage.getAllMovies();
      const ratings = await storage.getAllRatings();

      for (let i = 0; i < movies.length; i++) {
        for (let j = i + 1; j < movies.length; j++) {
          const movie1 = movies[i];
          const movie2 = movies[j];

          // 피어슨 상관계수를 사용한 유사도 계산
          const similarity = this.calculateMovieSimilarity(
            ratings.filter(r => r.movieId === movie1.id),
            ratings.filter(r => r.movieId === movie2.id)
          );

          await storage.updateMovieSimilarity({
            movieId1: movie1.id,
            movieId2: movie2.id,
            similarityScore: similarity
          });
        }
      }
    } catch (error) {
      console.error("Error updating similarity scores:", error);
    }
  }

  // 피어슨 상관계수를 사용한 영화 유사도 계산
  private calculateMovieSimilarity(ratings1: UserRating[], ratings2: UserRating[]): number {
    const commonUsers = ratings1.filter(r1 => 
      ratings2.some(r2 => r2.userId === r1.userId)
    );

    if (commonUsers.length < 5) {
      return 0;
    }

    const avg1 = commonUsers.reduce((sum, r) => sum + r.rating, 0) / commonUsers.length;
    const avg2 = ratings2
      .filter(r2 => commonUsers.some(r1 => r1.userId === r2.userId))
      .reduce((sum, r) => sum + r.rating, 0) / commonUsers.length;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    commonUsers.forEach(r1 => {
      const r2 = ratings2.find(r => r.userId === r1.userId)!;
      const diff1 = r1.rating - avg1;
      const diff2 = r2.rating - avg2;
      
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    });

    if (denominator1 === 0 || denominator2 === 0) {
      return 0;
    }

    return numerator / Math.sqrt(denominator1 * denominator2);
  }
}

export const recommendationEngine = new RecommendationEngine();
