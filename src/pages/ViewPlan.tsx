import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { PlanCalendar } from '@/components/PlanCalendar';
import { SafetyWarning } from '@/components/SafetyWarning';
import { ProgressTracker } from '@/components/ProgressTracker';
import { AIChat } from '@/components/AIChat';
import { UnitConverter } from '@/components/UnitConverter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Download, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeightCuttingPlan {
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
  ai_generated_plan?: any;
  created_at?: string;
}

export default function ViewPlan() {
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plan, setPlan] = useState<WeightCuttingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [foodUnit, setFoodUnit] = useState<'oz' | 'g'>('oz');
  const [waterUnit, setWaterUnit] = useState<'oz' | 'l'>('oz');

  useEffect(() => {
    if (!user || !planId) {
      navigate('/dashboard');
      return;
    }
    fetchPlan();
  }, [user, planId, navigate]);

  const fetchPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_cutting_plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching plan:', error);
        toast({
          title: "Error",
          description: "Failed to load plan. Redirecting to dashboard.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setPlan(data);
    } catch (error) {
      console.error('Error fetching plan:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const exportPlan = () => {
    if (!plan) return;

    const planContent = `
${plan.name}
Generated on: ${new Date(plan.created_at || '').toLocaleDateString()}

ATHLETE INFORMATION:
- Height: ${plan.height}${plan.height_unit}
- Current Weight: ${plan.current_weight} ${plan.weight_unit}
- Target Weight: ${plan.desired_weight} ${plan.weight_unit}
- Gender: ${plan.gender}
- Age: ${plan.age}
- Sport: ${plan.sport}
- Weigh-in Date: ${new Date(plan.weigh_in_date).toLocaleDateString()}
- Training Schedule: ${plan.training_schedule}
${plan.food_preferences ? `- Food Preferences: ${plan.food_preferences}` : ''}

7-DAY WEIGHT CUTTING PLAN:
${plan.ai_generated_plan ? plan.ai_generated_plan.map((day: any, index: number) => `
DAY ${index + 1} - ${day.date}${day.targetWeight ? ` (Target: ${day.targetWeight} ${plan.weight_unit})` : ''}

MEALS:
- Breakfast: ${day.meals.breakfast}
- Lunch: ${day.meals.lunch}
- Dinner: ${day.meals.dinner}

HYDRATION: ${day.hydration}
WORKOUT: ${day.workout}
RECOVERY: ${day.recovery}
`).join('\n') : 'Plan details not available'}

IMPORTANT SAFETY NOTES:
- This plan is AI-generated and should be reviewed by a qualified professional
- Always prioritize health and safety over rapid weight loss
- Consult with a doctor or nutritionist before making significant changes
- Stop the plan if you experience any concerning symptoms
`;

    const dataBlob = new Blob([planContent], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.name}-weight-cutting-plan.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Plan Exported",
      description: "Your weight cutting plan has been downloaded.",
    });
  };

  const handleUnitsChange = (newFoodUnit: 'oz' | 'g', newWaterUnit: 'oz' | 'l') => {
    setFoodUnit(newFoodUnit);
    setWaterUnit(newWaterUnit);
    toast({
      title: "Units Updated",
      description: `Food: ${newFoodUnit}, Water: ${newWaterUnit}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading plan...</div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Plan not found</p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="mb-4 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {plan.name}
              </h1>
              <p className="text-muted-foreground">
                Created on {new Date(plan.created_at || '').toLocaleDateString()}
              </p>
            </div>
            <Button onClick={exportPlan} className="gap-2">
              <Download className="h-4 w-4" />
              Export Plan
            </Button>
          </div>

          <div className="mb-6">
            <SafetyWarning
              currentWeight={plan.current_weight}
              desiredWeight={plan.desired_weight}
              weighInDate={plan.weigh_in_date}
              weightUnit={plan.weight_unit}
            />
          </div>

          <Tabs defaultValue="plan" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="plan">Daily Plan</TabsTrigger>
              <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
              <TabsTrigger value="chat">AI Assistant</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plan" className="mt-6">
              {plan.ai_generated_plan ? (
                <PlanCalendar plan={plan.ai_generated_plan} weightUnit={plan.weight_unit} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No plan details available
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6">
              <ProgressTracker
                targetWeight={plan.desired_weight}
                currentWeight={plan.current_weight}
                weightUnit={plan.weight_unit}
              />
            </TabsContent>
            
            <TabsContent value="chat" className="mt-6">
              <AIChat 
                planData={plan.ai_generated_plan} 
                onPlanUpdate={() => {}}
              />
            </TabsContent>
            
            <TabsContent value="units" className="mt-6">
              <UnitConverter onUnitsChange={handleUnitsChange} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}