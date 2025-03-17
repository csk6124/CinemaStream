import React from "react";
import { Card, CardContent } from "./card";
import { ScrollArea, ScrollBar } from "./scroll-area";

interface Content {
  id: number;
  title: string;
  image: string;
}

interface ContentRowProps {
  title: string;
  content: Content[];
}

// 개별 콘텐츠 카드 컴포넌트 메모이제이션
const ContentCard = React.memo(({ item }: { item: Content }) => (
  <Card 
    key={item.id}
    className="min-w-[200px] hover:scale-105 transition-transform cursor-pointer"
  >
    <CardContent className="p-0">
      <img 
        src={item.image} 
        alt={item.title}
        className="w-full h-[300px] object-cover rounded-md"
        loading="lazy"
        decoding="async"
      />
    </CardContent>
  </Card>
));

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