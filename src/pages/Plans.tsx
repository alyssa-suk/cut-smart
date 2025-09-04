import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Target, Trophy } from 'lucide-react';

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
  const [plans, setPlans] = useState<WeightCuttingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

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
                <Card 
                  key={plan.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/plan/${plan.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Created on {new Date(plan.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <Trophy className="h-4 w-4" />
                          {plan.sport}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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