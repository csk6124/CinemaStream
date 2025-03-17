import { useState, useEffect } from "react";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { User } from "firebase/auth";

export function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

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
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={handleLogin}>Sign In</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
