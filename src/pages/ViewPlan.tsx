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
import jsPDF from 'jspdf';

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
  const [weightUnit, setWeightUnit] = useState<string>('');

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
      setWeightUnit(data.weight_unit);
    } catch (error) {
      console.error('Error fetching plan:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const exportPlan = () => {
    if (!plan) return;

    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 6;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const maxWidth = pageWidth - 2 * margin;

    // Helper function to add text with auto-wrap
    const addText = (text: string, fontSize = 10, isBold = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const splitText = doc.splitTextToSize(text, maxWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += splitText.length * lineHeight;
      
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Title
    addText(plan.name, 16, true);
    yPosition += 5;
    addText(`Generated on: ${new Date(plan.created_at || '').toLocaleDateString()}`, 10);
    yPosition += 10;

    // Athlete Information
    addText('ATHLETE INFORMATION', 14, true);
    yPosition += 2;
    addText(`Height: ${plan.height}${plan.height_unit}`, 10);
    addText(`Current Weight: ${plan.current_weight} ${plan.weight_unit}`, 10);
    addText(`Target Weight: ${plan.desired_weight} ${plan.weight_unit}`, 10);
    addText(`Gender: ${plan.gender}`, 10);
    addText(`Age: ${plan.age}`, 10);
    addText(`Sport: ${plan.sport}`, 10);
    addText(`Weigh-in Date: ${new Date(plan.weigh_in_date).toLocaleDateString()}`, 10);
    addText(`Training Schedule: ${plan.training_schedule}`, 10);
    if (plan.food_preferences) {
      addText(`Food Preferences: ${plan.food_preferences}`, 10);
    }
    yPosition += 10;

    // 7-Day Plan
    addText('7-DAY WEIGHT CUTTING PLAN', 14, true);
    yPosition += 5;

    if (plan.ai_generated_plan) {
      plan.ai_generated_plan.forEach((day: any, index: number) => {
        // Day header
        addText(`DAY ${index + 1} - ${day.date}${day.targetWeight ? ` (Target: ${day.targetWeight.toFixed(2)} ${plan.weight_unit})` : ''}`, 12, true);
        yPosition += 2;

        // Meals
        addText('MEALS:', 11, true);
        addText(`• Breakfast: ${day.meals.breakfast}`, 10);
        addText(`• Lunch: ${day.meals.lunch}`, 10);
        addText(`• Dinner: ${day.meals.dinner}`, 10);
        if (day.meals.snacks) {
          addText(`• Snacks: ${day.meals.snacks}`, 10);
        }
        yPosition += 3;

        // Hydration
        addText('HYDRATION:', 11, true);
        if (typeof day.hydration === 'string') {
          addText(`Amount: ${day.hydration}`, 10);
        } else {
          addText(`Amount: ${day.hydration.amount}`, 10);
          if (day.hydration.timing) {
            addText('Timing:', 10);
            day.hydration.timing.forEach((time: string) => {
              addText(`  • ${time}`, 10);
            });
          }
        }
        yPosition += 3;

        // Workout
        addText('WORKOUT:', 11, true);
        if (typeof day.workout === 'string') {
          addText(day.workout, 10);
        } else {
          addText(`Time: ${day.workout.time}`, 10);
          addText(`Activity: ${day.workout.activity}`, 10);
          addText(`Duration: ${day.workout.duration}`, 10);
        }
        yPosition += 3;

        // Recovery
        addText('RECOVERY:', 11, true);
        if (Array.isArray(day.recovery)) {
          day.recovery.forEach((item: string) => {
            addText(`• ${item}`, 10);
          });
        } else {
          addText(day.recovery, 10);
        }
        yPosition += 8;
      });
    }

    // Safety notes
    addText('IMPORTANT SAFETY NOTES', 14, true);
    yPosition += 2;
    addText('• This plan is AI-generated and should be reviewed by a qualified professional', 10);
    addText('• Always prioritize health and safety over rapid weight loss', 10);
    addText('• Consult with a doctor or nutritionist before making significant changes', 10);
    addText('• Stop the plan if you experience any concerning symptoms', 10);

    // Save the PDF
    doc.save(`${plan.name}-weight-cutting-plan.pdf`);
    
    toast({
      title: "Plan Exported",
      description: "Your weight cutting plan has been downloaded as a PDF.",
    });
  };

  const handleUnitsChange = (newFoodUnit: 'oz' | 'g', newWaterUnit: 'oz' | 'l', newWeightUnit?: string) => {
    setFoodUnit(newFoodUnit);
    setWaterUnit(newWaterUnit);
    if (newWeightUnit) {
      setWeightUnit(newWeightUnit);
    }
    toast({
      title: "Units Updated",
      description: `Food: ${newFoodUnit}, Water: ${newWaterUnit}${newWeightUnit ? `, Weight: ${newWeightUnit}` : ''}`,
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plan">Daily Plan</TabsTrigger>
              <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
              <TabsTrigger value="chat">AI Assistant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plan" className="mt-6">
              {plan.ai_generated_plan ? (
                <PlanCalendar 
                  key={JSON.stringify(plan.ai_generated_plan)} 
                  plan={plan.ai_generated_plan} 
                  weightUnit={weightUnit || plan.weight_unit} 
                />
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
                planId={planId}
                onPlanUpdate={(updatedPlan) => {
                  setPlan(prev => prev ? { ...prev, ai_generated_plan: updatedPlan } : null);
                  toast({
                    title: "Plan Updated",
                    description: "Your plan has been successfully modified.",
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}