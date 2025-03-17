import { useEffect, useRef } from "react";
import { Button } from "./button";
import { Play, Info } from "lucide-react";

export function VideoHero() {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player('hero-player', {
        videoId: 'ewmvkZqSWmo',
        playerVars: {
          autoplay: 1,
          controls: 0,
          mute: 1,
          loop: 1,
          playlist: 'ewmvkZqSWmo',
          playsinline: 1
        }
      });
    };
  }, []);

  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      <div 
        id="hero-player"
        ref={playerRef}
        className="absolute w-full h-full scale-125"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute bottom-0 left-0 p-8 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold">Movie Title</h1>
        <p className="text-lg max-w-xl">
          Description of the featured movie that gives viewers an idea of what to expect.
        </p>
        <div className="space-x-4">
          <Button size="lg">
            <Play className="mr-2 h-5 w-5" />
            Play
          </Button>
          <Button variant="secondary" size="lg">
            <Info className="mr-2 h-5 w-5" />
            More Info
          </Button>
        </div>
      </div>
    </div>
  );
}
