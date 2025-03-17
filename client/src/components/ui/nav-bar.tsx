import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export function NavBar() {
  // Fetch current user with proper error handling
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/users/me"],
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Failed to fetch user data:', error);
    }
  });

  const handleLogin = () => {
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

  // Get user's initial if available, otherwise use fallback
  const userInitial = user?.name ? user.name[0]?.toUpperCase() : '?';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "bg-transparent"
    }`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">NetflixClone</h1>
          </Link>
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost">TV Shows</Button>
            <Button variant="ghost">Movies</Button>
            <Button variant="ghost">New & Popular</Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name || 'User'}</span>
            </div>
          ) : (
            <Button onClick={handleLogin}>Sign In with Replit</Button>
          )}
        </div>
      </div>
    </nav>
  );
}