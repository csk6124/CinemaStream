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

  return (
    <Card 
      key={item.id}
      className="min-w-[200px] hover:scale-105 transition-transform cursor-pointer group"
      onClick={() => setLocation(`/movie/${item.id}`)}
    >
      <CardContent className="p-0 relative">
        <img 
          src={item.posterUrl}
          alt={item.title}
          className="w-full h-[300px] object-cover rounded-md"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="text-white font-semibold">{item.title}</h3>
          {item.year && <p className="text-white text-sm">{item.year}</p>}
          {item.rating && <p className="text-white text-sm">★ {item.rating.toFixed(1)}</p>}
        </div>
      </CardContent>
    </Card>
  );
});

ContentCard.displayName = "ContentCard";

// ContentRow 컴포넌트 메모이제이션
export const ContentRow = React.memo(({ title, content }: ContentRowProps) => {
  return (
    <div className="py-4">
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