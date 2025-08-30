import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="text-primary">CutSmart</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            AI-powered weight-cutting plans for combat athletes – safe, smart, and personalized.
          </p>
          
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              CutSmart creates customized short-term weight-cut plans based on your goals, 
              current training schedule, and diet preferences. No starving, no overtraining—just 
              science-based strategies tailored to you.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Sign Up
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/auth')}
            >
              Log In
            </Button>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-lg">AI</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Plans</h3>
            <p className="text-muted-foreground">
              Personalized cutting strategies based on your unique profile and goals
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-lg">⚖️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Scientific</h3>
            <p className="text-muted-foreground">
              Evidence-based approach that prioritizes your health and performance
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-lg">🥊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Combat Sports Focus</h3>
            <p className="text-muted-foreground">
              Designed specifically for wrestlers, MMA fighters, and combat athletes
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
