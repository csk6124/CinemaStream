import { useEffect, useRef } from "react";
import { Button } from "./button";
import { Play, Info } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="relative w-full h-[85vh] overflow-hidden rounded-b-[2rem] shadow-2xl">
      <div 
        id="hero-player"
        ref={playerRef}
        className="absolute w-full h-full scale-125"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute bottom-0 left-0 p-12 space-y-6"
      >
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          신비한 동물들과 덤블도어의 비밀
        </h1>
        <p className="text-xl max-w-2xl text-gray-200">
          덤블도어와 그린델왈드의 숨막히는 대결. 마법 세계의 운명이 걸린 이야기가 시작됩니다.
        </p>
        <div className="space-x-4 flex">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" className="text-lg px-8">
              <Play className="mr-2 h-5 w-5" />
              재생
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="secondary" size="lg" className="text-lg px-8 bg-white/20 backdrop-blur-sm hover:bg-white/30">
              <Info className="mr-2 h-5 w-5" />
              상세 정보
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}