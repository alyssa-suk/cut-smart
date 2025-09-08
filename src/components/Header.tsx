import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="text-2xl font-bold text-foreground cursor-pointer flex items-center"
          onClick={() => navigate('/')}
        >
          <span className="text-primary">Cut</span>
          <span>Smart</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => navigate('/')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </button>
          {user && (
            <button 
              onClick={() => navigate('/my-info')}
              className="text-foreground hover:text-primary transition-colors"
            >
              My Info
            </button>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Log In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};