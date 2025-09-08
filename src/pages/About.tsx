import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Target, Brain, Clock, Users, CheckCircle } from "lucide-react";

const About = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            About <span className="text-primary">Cut</span>Smart
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
                <Card className="max-w-md mx-auto mb-6 p-6">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg">Choose Your Experience</CardTitle>
                    <CardDescription>
                      Sign up to save your plans and track progress, or try as a guest
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/auth')}
                      className="w-full text-lg py-6"
                    >
                      Sign Up to Save Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => navigate('/create-plan')}
                      className="w-full text-lg py-6"
                    >
                      Continue as Guest
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Already have an account? <button onClick={() => navigate('/auth')} className="text-primary hover:underline">Log in</button>
                    </p>
                  </CardContent>
                </Card>
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

        {/* How It Works Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How CutSmart Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  Input Your Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Provide your current weight, target weight, sport, training schedule, and dietary preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI analyzes your profile and generates a personalized 7-day weight cutting plan.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  Follow Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get day-by-day guidance on meals, hydration, workouts, and recovery strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sports Section */}
        <section className="text-center bg-muted/50 rounded-lg p-8 mb-16">
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

        {/* Safety Section */}
        <section className="bg-card rounded-lg p-8 border">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Safety First</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-generated plans are designed with athlete safety in mind, but they should always be reviewed by qualified professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Evidence-based weight cutting strategies</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Gradual, sustainable weight loss approaches</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Hydration and nutrition optimization</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Performance maintenance during cuts</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Recovery and rehydration protocols</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Professional consultation recommendations</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;