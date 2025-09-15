import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

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
  weight_unit: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<WeightCuttingPlan[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user's weight cutting plans
      const { data: plansData, error: plansError } = await supabase
        .from('weight_cutting_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (plansError) {
        console.error('Error fetching plans:', plansError);
      } else {
        setPlans(plansData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const deletePlan = async (planId: string, planName: string) => {
    setDeletingPlanId(planId);
    try {
      const { error } = await supabase
        .from('weight_cutting_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      // Remove the plan from local state
      setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      
      toast({
        title: "Plan Deleted",
        description: `Successfully deleted "${planName}"`,
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingPlanId(null);
    }
  };

  if (loading || loadingData) {
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
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.name || 'Athlete'}!
          </h1>
          <p className="text-muted-foreground">
            Ready to start your weight-cut plan?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/create-plan')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create New Plan
              </CardTitle>
              <CardDescription>
                Generate a personalized AI-powered weight cutting plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/plans')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                View Saved Plans
              </CardTitle>
              <CardDescription>
                Access and manage your existing weight cutting plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Plans ({plans.length})
              </Button>
            </CardContent>
          </Card>
        </div>

        {plans.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Plans</h2>
            <div className="grid gap-4">
              {plans.slice(0, 3).map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/plan/${plan.id}`)}
                      >
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>
                          {plan.current_weight} → {plan.desired_weight} {plan.weight_unit} • 
                          Weigh-in: {new Date(plan.weigh_in_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={deletingPlanId === plan.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{plan.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deletePlan(plan.id, plan.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}