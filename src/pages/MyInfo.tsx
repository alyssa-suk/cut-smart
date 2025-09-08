import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { User, Calendar, Weight, Ruler, Trophy } from 'lucide-react';

interface MostRecentPlan {
  id: string;
  name: string;
  current_weight: number;
  desired_weight: number;
  weigh_in_date: string;
  weight_unit: string;
  height: number;
  height_unit: string;
  gender: string;
  age: number;
  sport: string;
  training_schedule: string;
  food_preferences?: string;
  created_at: string;
}

export default function MyInfo() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mostRecentPlan, setMostRecentPlan] = useState<MostRecentPlan | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMostRecentPlan();
    }
  }, [user]);

  const fetchMostRecentPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_cutting_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching most recent plan:', error);
      } else {
        setMostRecentPlan(data);
      }
    } catch (error) {
      console.error('Error fetching most recent plan:', error);
    } finally {
      setLoadingData(false);
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

  if (!mostRecentPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">My Info</h1>
            <p className="text-muted-foreground mb-6">
              No plans found. Create your first weight cutting plan to see your athlete information here.
            </p>
            <button 
              onClick={() => navigate('/create-plan')}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Create Your First Plan
            </button>
          </div>
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
            <h1 className="text-3xl font-bold mb-2">My Athlete Information</h1>
            <p className="text-muted-foreground">
              Information from your most recent plan: <span className="font-medium">{mostRecentPlan.name}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Created on {new Date(mostRecentPlan.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Age</span>
                  <Badge variant="outline">{mostRecentPlan.age} years old</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Gender</span>
                  <Badge variant="outline">{mostRecentPlan.gender}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Sport</span>
                  <Badge variant="outline">{mostRecentPlan.sport}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Physical Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  Physical Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Height</span>
                  <Badge variant="outline">{mostRecentPlan.height}{mostRecentPlan.height_unit}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Current Weight</span>
                  <Badge variant="outline">{mostRecentPlan.current_weight} {mostRecentPlan.weight_unit}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Target Weight</span>
                  <Badge variant="secondary">{mostRecentPlan.desired_weight} {mostRecentPlan.weight_unit}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Training Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Training Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Training Schedule</span>
                  <Badge variant="outline">{mostRecentPlan.training_schedule}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Weigh-in Date</span>
                  <Badge variant="outline">
                    {new Date(mostRecentPlan.weigh_in_date).toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Food Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Food Preferences</span>
                  <p className="text-sm">
                    {mostRecentPlan.food_preferences || 'No specific preferences noted'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Want to update your information? Create a new plan with updated details.
            </p>
            <button 
              onClick={() => navigate('/create-plan')}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Create New Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}