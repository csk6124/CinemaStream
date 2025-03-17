import React from "react";
import { useQuery } from "@tanstack/react-query";
import { VideoHero } from "@/components/ui/video-hero";
import { ContentRow } from "@/components/ui/content-row";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";

// 로딩 중인 콘텐츠 카드를 보여주는 컴포넌트
const LoadingContentRow = () => (
  <div className="py-6">
    <Skeleton className="h-8 w-48 mb-4 mx-4" />
    <div className="flex space-x-4 px-4 pb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="min-w-[220px] h-[330px]" />
      ))}
    </div>
  </div>
);

export default function Home() {
  // 추천 영화 데이터 가져오기
  const { data: recommendations, isLoading: recommendationsLoading, error } = useQuery({
    queryKey: ["/api/recommendations"],
    retry: 3,  // 실패 시 3번까지 재시도
    retryDelay: 1000, // 1초 간격으로 재시도
    onError: (error) => {
      console.error('Failed to fetch recommendations:', error);
    }
  });

  console.log('Recommendations query state:', {
    isLoading: recommendationsLoading,
    error,
    data: recommendations
  });

  // 카테고리 설정
  const categories = [
    { key: 'popular', title: '인기 영화' },
    { key: 'nowPlaying', title: '현재 상영작' },
    { key: 'topRated', title: '평점 높은 영화' },
    { key: 'upcoming', title: '곧 개봉할 영화' },
    { key: 'action', title: '액션 영화' },
    { key: 'drama', title: '드라마' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <VideoHero />
      <div className="container mx-auto -mt-32 relative z-10">
        {/* 개인화된 추천 섹션 */}
        {recommendationsLoading ? (
          <LoadingContentRow />
        ) : recommendations ? (
          <>
            {categories.map(category => (
              recommendations[category.key]?.length > 0 && (
                <ContentRow
                  key={category.key}
                  title={category.title}
                  content={recommendations[category.key]}
                />
              )
            ))}
          </>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {error ? '영화 정보를 불러오는데 실패했습니다.' : '추천 영화가 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
}