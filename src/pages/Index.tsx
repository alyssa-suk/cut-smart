import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Target, Brain, Clock } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to <span className="text-primary">Cut</span>Smart
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered weight-cutting plans for combat athletes – safe, smart, and personalized.
          </p>
          <div className="mb-8">
            <p className="text-lg mb-6 max-w-3xl mx-auto">
              CutSmart creates customized short-term weight-cut plans based on your goals, 
              current training schedule, and diet preferences. No starving, no overtraining—just 
              science-based strategies tailored to you.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="text-lg px-8 py-6"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 py-6"
                >
                  Sign Up
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 py-6"
                >
                  Log In
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-muted-foreground">
              Smart algorithms create personalized plans based on your unique profile and goals.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Scientific</h3>
            <p className="text-muted-foreground">
              Evidence-based strategies that prioritize your health and performance.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized</h3>
            <p className="text-muted-foreground">
              Tailored to your sport, training schedule, and dietary preferences.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Time-Efficient</h3>
            <p className="text-muted-foreground">
              Quick plan generation with day-by-day guidance for optimal results.
            </p>
          </div>
        </section>

        {/* Sports Section */}
        <section className="text-center bg-muted/50 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Built for Combat Athletes</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Whether you're a wrestler, MMA fighter, or jiu-jitsu competitor, 
            CutSmart understands the unique demands of your sport.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Wrestling</span>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">MMA</span>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Jiu-Jitsu</span>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Boxing</span>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Kickboxing</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;