import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export function NavBar() {
  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false
  });

  const handleLogin = () => {
    // Replit 로그인 페이지로 리다이렉트
    window.location.href = "/__repl";
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "bg-transparent"
    }`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-primary">NetflixClone</h1>
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">TV Shows</Button>
            <Button variant="ghost">Movies</Button>
            <Button variant="ghost">New & Popular</Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          ) : (
            <Button onClick={handleLogin}>Sign In with Replit</Button>
          )}
        </div>
      </div>
    </nav>
  );
}