import React, { useMemo } from "react";
import { VideoHero } from "@/components/ui/video-hero";
import { ContentRow } from "@/components/ui/content-row";
import { categories } from "@/data/mock-content";

export default function Home() {
  // 카테고리 데이터 메모이제이션
  const memoizedCategories = useMemo(() => categories, []);

  return (
    <div className="min-h-screen bg-background">
      <VideoHero />
      <div className="container mx-auto -mt-32 relative z-10">
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