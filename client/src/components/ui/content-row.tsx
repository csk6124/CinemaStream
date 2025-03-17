import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "./card";
import { ScrollArea, ScrollBar } from "./scroll-area";

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

  // posterUrl이 상대 경로인 경우 TMDB 기본 URL 추가
  const imageUrl = item.posterUrl?.startsWith('/')
    ? `https://image.tmdb.org/t/p/w500${item.posterUrl}`
    : item.posterUrl;

  return (
    <Card 
      key={item.id}
      className="min-w-[220px] hover:scale-105 transition-transform cursor-pointer group overflow-hidden"
      onClick={() => setLocation(`/movie/${item.id}`)}
    >
      <CardContent className="p-0 relative h-[330px]">
        <img 
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
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