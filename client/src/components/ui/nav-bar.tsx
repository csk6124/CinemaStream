import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Menu, X } from "lucide-react";

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Add passive event listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
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
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/movies">영화</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/tv">TV 프로그램</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/new">신작</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Avatar className="cursor-pointer">
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Link>
              <span className="hidden md:inline text-sm font-medium">{user.name || 'User'}</span>
            </div>
          ) : (
            <Button onClick={handleLogin}>Sign In with Replit</Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="container mx-auto py-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/movies">영화</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/tv">TV 프로그램</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/new">신작</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}