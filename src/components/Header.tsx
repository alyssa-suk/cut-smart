import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Header = () => {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="text-2xl font-bold text-primary cursor-pointer"
          onClick={() => navigate('/')}
        >
          CutSmart
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => navigate('/')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/about')}
            className="text-foreground hover:text-primary transition-colors"
          >
            About
          </button>
          {user && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-foreground hover:text-primary transition-colors"
            >
              My Info
            </button>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Log In
              </Button>
              <Button onClick={() => navigate('/auth?mode=signup')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;