import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Heart, Star, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  year: number;
  director: string;
  cast: string[];
  rating: number;
}

export default function MovieDetail() {
  const params = useParams();
  const id = params.id;
  const { toast } = useToast();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then(res => res.json())
      .then(data => setMovie(data))
      .catch(err => {
        toast({
          title: "Error",
          description: "영화 정보를 불러오는데 실패했습니다.",
          variant: "destructive"
        });
      });
  }, [id, toast]);

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? "좋아요 취소" : "좋아요",
      description: liked ? "좋아요가 취소되었습니다." : "이 영화를 좋아합니다!",
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment("");
      toast({
        title: "댓글 등록",
        description: "댓글이 등록되었습니다.",
      });
    }
  };

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto py-8 px-4"
      >
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-[2/3] rounded-xl overflow-hidden"
          >
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">{movie.title}</h1>
              <Button
                variant={liked ? "default" : "outline"}
                onClick={handleLike}
                className="gap-2"
              >
                <Heart className={liked ? "fill-current" : ""} />
                {liked ? "좋아요 취소" : "좋아요"}
              </Button>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{movie.rating}/5.0</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{movie.year}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{movie.director}</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground">{movie.description}</p>

            <div>
              <h3 className="text-lg font-semibold mb-2">출연진</h3>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold mb-4">댓글</h2>
          <form onSubmit={handleComment} className="flex gap-2">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1"
            />
            <Button type="submit">작성</Button>
          </form>

          <motion.div className="mt-4 space-y-4">
            {comments.map((comment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg bg-muted"
              >
                {comment}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}