import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "./progress";
import { Card } from "./card";
import { Badge } from "./badge";
import {
  Trophy,
  Clock,
  Star,
  Film,
  Medal,
  Award
} from "lucide-react";

interface Achievement {
  id: number;
  achievementId: string;
  progress: number;
  completed: boolean;
  unlockedAt: string | null;
}

interface UserProgress {
  totalWatched: number;
  totalRated: number;
  watchTime: number;
  achievements: Achievement[];
}

const ACHIEVEMENT_DETAILS: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  'first-movie': {
    title: '첫 영화 시청',
    description: '처음으로 영화를 시청했습니다!',
    icon: <Film className="h-6 w-6" />
  },
  'movie-buff': {
    title: '영화 애호가',
    description: '10편의 영화를 시청했습니다',
    icon: <Trophy className="h-6 w-6" />
  },
  'movie-expert': {
    title: '영화 전문가',
    description: '50편의 영화를 시청했습니다',
    icon: <Award className="h-6 w-6" />
  },
  'first-rating': {
    title: '첫 평가',
    description: '처음으로 영화를 평가했습니다!',
    icon: <Star className="h-6 w-6" />
  },
  'rating-enthusiast': {
    title: '평가 애호가',
    description: '10편의 영화를 평가했습니다',
    icon: <Medal className="h-6 w-6" />
  },
  'rating-expert': {
    title: '평가 전문가',
    description: '50편의 영화를 평가했습니다',
    icon: <Trophy className="h-6 w-6" />
  }
};

function formatWatchTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}시간 ${remainingMinutes}분`;
}

export function UserJourney() {
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/users/me/progress"],
    retry: 3,
    retryDelay: 1000
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/users/me/achievements"],
    retry: 3,
    retryDelay: 1000
  });

  if (progressLoading || achievementsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {/* 시청 통계 */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">시청 통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-4">
            <Film className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">시청한 영화</p>
              <p className="text-2xl font-bold">{progress?.totalWatched || 0}편</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Star className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">평가한 영화</p>
              <p className="text-2xl font-bold">{progress?.totalRated || 0}편</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">총 시청 시간</p>
              <p className="text-2xl font-bold">{formatWatchTime(progress?.watchTime || 0)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 업적 */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">업적</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements?.map((achievement) => {
            const details = ACHIEVEMENT_DETAILS[achievement.achievementId];
            if (!details) return null;

            return (
              <div
                key={achievement.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border ${
                  achievement.completed
                    ? "bg-primary/10 border-primary"
                    : "bg-muted border-muted-foreground"
                }`}
              >
                <div className="shrink-0 text-primary">{details.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{details.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {details.description}
                  </p>
                  <Progress
                    value={achievement.progress}
                    className="mt-2"
                  />
                </div>
                {achievement.completed && (
                  <Badge variant="secondary">
                    달성!
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
