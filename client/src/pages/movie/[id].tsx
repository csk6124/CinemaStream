
import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MovieDetail() {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([...comments, comment]);
      setComment("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto py-8"
      >
        <div className="relative aspect-video rounded-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0"
            alt="Movie poster"
            className="w-full h-full object-cover"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">영화 제목 {id}</h1>
            <Button
              variant={liked ? "default" : "outline"}
              onClick={handleLike}
              className="gap-2"
            >
              <Heart className={liked ? "fill-current" : ""} />
              {liked ? "좋아요 취소" : "좋아요"}
            </Button>
          </div>

          <p className="mt-4 text-gray-400">
            영화에 대한 상세한 설명이 들어갑니다.
          </p>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">댓글</h2>
            <form onSubmit={handleComment} className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
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
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
