import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { VideoHero } from "@/components/ui/video-hero";
import { ContentRow } from "@/components/ui/content-row";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { categories } from "@/data/mock-content";

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
          <div className="py-8">
            <LoadingSpinner variant="netflix" />
          </div>
        ) : recommendations?.length > 0 ? (
          <ContentRow
            title="회원님을 위한 추천"
            content={recommendations}
          />
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