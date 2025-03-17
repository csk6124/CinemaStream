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

export function ContentRow({ title, content }: ContentRowProps) {
  return (
    <div className="py-4">
      <h2 className="text-2xl font-semibold mb-4 px-4">{title}</h2>
      <ScrollArea>
        <div className="flex space-x-4 px-4 pb-4">
          {content.map((item) => (
            <Card 
              key={item.id}
              className="min-w-[200px] hover:scale-105 transition-transform cursor-pointer"
            >
              <CardContent className="p-0">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-[300px] object-cover rounded-md"
                />
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
