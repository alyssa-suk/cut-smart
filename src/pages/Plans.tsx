import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Target, Trophy, Trash2 } from 'lucide-react';
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

interface WeightCuttingPlan {
  id: string;
  name: string;
  current_weight: number;
  desired_weight: number;
  weigh_in_date: string;
  weight_unit: string;
  sport: string;
  created_at: string;
}

export default function Plans() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<WeightCuttingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_cutting_plans')
        .select('id, name, current_weight, desired_weight, weigh_in_date, weight_unit, sport, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching plans:', error);
      } else {
        setPlans(data || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoadingPlans(false);
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

  if (loading || loadingPlans) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mb-2">
              Your Weight Cutting Plans
            </h1>
            <p className="text-muted-foreground">
              View and manage all your saved plans
            </p>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No plans yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first weight cutting plan to get started
              </p>
              <Button onClick={() => navigate('/create-plan')}>
                Create New Plan
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/plan/${plan.id}`)}
                      >
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Created on {new Date(plan.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 mb-1">
                            <Trophy className="h-4 w-4" />
                            {plan.sport}
                          </div>
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
                    </div>
                  </CardHeader>
                  <CardContent 
                    className="cursor-pointer"
                    onClick={() => navigate(`/plan/${plan.id}`)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Weight Cut:</span>
                        <span className="font-medium">
                          {plan.current_weight} → {plan.desired_weight} {plan.weight_unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Weigh-in:</span>
                        <span className="font-medium">
                          {new Date(plan.weigh_in_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Loss:</span>
                        <span className="font-medium text-accent">
                          {Math.abs(plan.current_weight - plan.desired_weight).toFixed(1)} {plan.weight_unit}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button 
              variant="outline"
              onClick={() => navigate('/create-plan')}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Create New Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}