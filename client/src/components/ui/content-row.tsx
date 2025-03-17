import React, { useState } from "react";
import { useLocation } from "wouter";
import { Blurhash } from "react-blurhash";
import { Card, CardContent } from "./card";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { Skeleton } from "./skeleton";

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  description?: string;
  year?: number;
  rating?: number;
}

interface ContentRowProps {
  title: string;
  content: Movie[];
}

// 개별 콘텐츠 카드 컴포넌트 메모이제이션
const ContentCard = React.memo(({ item }: { item: Movie }) => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showBlurhash, setShowBlurhash] = useState(true);

  // 기본 이미지 URL (포스터가 없는 경우 사용)
  const defaultImageUrl = "https://placehold.co/500x750/222222/FFFFFF/png?text=No+Poster";
  const defaultBlurhash = "L5H2EC=PM+yV0g-mq.wG9c010J}I";  // 어두운 그레이 블러해시

  // TMDB 이미지 URL 처리
  const imageUrl = item.posterUrl || defaultImageUrl;

  console.log('Loading image:', imageUrl); // 디버깅용 로그

  return (
    <Card 
      key={item.id}
      className="min-w-[220px] hover:scale-105 transition-transform cursor-pointer group overflow-hidden"
      onClick={() => setLocation(`/movie/${item.id}`)}
    >
      <CardContent className="p-0 relative h-[330px]">
        {/* 블러해시 플레이스홀더 */}
        {showBlurhash && (
          <div className="absolute inset-0">
            <Blurhash
              hash={defaultBlurhash}
              width="100%"
              height="100%"
              resolutionX={32}
              resolutionY={32}
              punch={1}
            />
          </div>
        )}

        {/* 실제 이미지 */}
        <img 
          src={imageUrl}
          alt={item.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading || showBlurhash ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            console.log('Image loaded successfully:', imageUrl); // 디버깅용 로그
            setIsLoading(false);
            // 이미지가 로드된 후 약간의 지연을 두고 블러해시를 제거
            setTimeout(() => setShowBlurhash(false), 100);
          }}
          onError={(e) => {
            console.error('Image load error:', imageUrl); // 디버깅용 로그
            const target = e.target as HTMLImageElement;
            target.src = defaultImageUrl;
            setHasError(true);
            setIsLoading(false);
            setShowBlurhash(false);
          }}
        />

        {/* 오버레이 정보 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{item.title}</h3>
            <div className="flex items-center gap-2 text-sm mb-2">
              {item.year && <span>{item.year}</span>}
              {item.rating && (
                <span className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  {item.rating.toFixed(1)}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-200 line-clamp-3">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ContentCard.displayName = "ContentCard";

// ContentRow 컴포넌트 메모이제이션
export const ContentRow = React.memo(({ title, content }: ContentRowProps) => {
  return (
    <div className="py-6">
      <h2 className="text-2xl font-semibold mb-4 px-4">{title}</h2>
      <ScrollArea>
        <div className="flex space-x-4 px-4 pb-4">
          {content.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
});

ContentRow.displayName = "ContentRow";