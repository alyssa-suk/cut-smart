import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Plus, Calendar } from "lucide-react";

interface Profile {
  id: string;
  name: string;
}

interface WeightCuttingPlan {
  id: string;
  name: string;
  current_weight: number;
  desired_weight: number;
  weigh_in_date: string;
  sport: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<WeightCuttingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's weight cutting plans
        const { data: plansData, error: plansError } = await supabase
          .from('weight_cutting_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (plansError) throw plansError;
        setPlans(plansData || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.name}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Ready to start your weight-cut plan?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/create-plan')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Plan
              </CardTitle>
              <CardDescription>
                Start a new AI-powered weight cutting plan tailored to your goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                View Saved Plans
              </CardTitle>
              <CardDescription>
                Access your previous weight cutting plans and track progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                You have {plans.length} saved plan{plans.length !== 1 ? 's' : ''}
              </div>
              {plans.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {plans.slice(0, 3).map((plan) => (
                    <div key={plan.id} className="p-2 bg-muted rounded text-sm">
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-muted-foreground">
                        {plan.current_weight} → {plan.desired_weight} lbs | {plan.sport}
                      </div>
                    </div>
                  ))}
                  {plans.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{plans.length - 3} more plans
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No plans yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;