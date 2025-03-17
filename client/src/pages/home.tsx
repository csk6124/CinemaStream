import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { VideoHero } from "@/components/ui/video-hero";
import { ContentRow } from "@/components/ui/content-row";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { categories } from "@/data/mock-content";
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
  // 카테고리 데이터 메모이제이션
  const memoizedCategories = useMemo(() => categories, []);

  // 개인화된 추천 영화 가져오기
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/recommendations"],
    retry: false
  });

  return (
    <div className="min-h-screen bg-background">
      <VideoHero />
      <div className="container mx-auto -mt-32 relative z-10">
        {/* 개인화된 추천 섹션 */}
        {recommendationsLoading ? (
          <LoadingContentRow />
        ) : recommendations ? (
          <>
            {recommendations.popular?.length > 0 && (
              <ContentRow
                title="인기 영화"
                content={recommendations.popular}
              />
            )}
            {recommendations.similar?.length > 0 && (
              <ContentRow
                title="비슷한 영화"
                content={recommendations.similar}
              />
            )}
          </>
        ) : null}

        {/* 기존 카테고리 */}
        {memoizedCategories.map((category) => (
          <ContentRow
            key={category.id}
            title={category.title}
            content={category.content}
          />
        ))}
      </div>
    </div>
  );
}