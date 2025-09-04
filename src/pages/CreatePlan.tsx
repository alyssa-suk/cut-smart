import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { weightCuttingPlanSchema, type WeightCuttingPlanFormData } from "@/lib/validations";
import { SafetyWarning } from "@/components/SafetyWarning";
import { PlanCalendar } from "@/components/PlanCalendar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { HeightInput } from "@/components/HeightInput";
import { WeightInput } from "@/components/WeightInput";
import { AgeInput } from "@/components/AgeInput";
import { UnitConverter } from "@/components/UnitConverter";
import { AIChat } from "@/components/AIChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, MessageSquare } from "lucide-react";

const CreatePlan = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [foodUnit, setFoodUnit] = useState<'oz' | 'g'>('oz');
  const [waterUnit, setWaterUnit] = useState<'oz' | 'l'>('oz');

  const form = useForm<WeightCuttingPlanFormData>({
    resolver: zodResolver(weightCuttingPlanSchema),
    defaultValues: {
      name: '',
      height: 0,
      heightUnit: 'ft',
      currentWeight: 0,
      weightUnit: 'lbs',
      gender: 'Male',
      age: 0,
      sport: '',
      desiredWeight: 0,
      weighInDate: '',
      trainingSchedule: '',
      foodPreferences: '',
    },
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      }
    };
    checkUser();
  }, [navigate]);

  // Generate AI plan based on form data
  const generateAIPlan = (data: WeightCuttingPlanFormData) => {
    const daysToWeighIn = Math.ceil((new Date(data.weighInDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const dailyWeightLoss = (data.currentWeight - data.desiredWeight) / daysToWeighIn;
    
    // Generate a 7-day sample plan (in a real app, this would be AI-generated)
    const samplePlan = Array.from({ length: Math.min(7, daysToWeighIn) }, (_, index) => ({
      date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      meals: {
        breakfast: index < 3 ? "2 egg whites, 1 slice whole grain toast, green tea" : "1 boiled egg, protein bar, water",
        lunch: index < 3 ? "Grilled chicken breast (4oz), steamed vegetables, quinoa (1/2 cup)" : "Lean fish (3oz), green salad",
        dinner: index < 3 ? "Lean protein (3oz), steamed broccoli, sweet potato (small)" : "Protein shake, handful of nuts",
        snacks: index < 3 ? "Apple with 1 tbsp almond butter" : undefined
      },
      hydration: {
        amount: index < 3 ? "80-100 oz" : index < 5 ? "60-80 oz" : "40-60 oz",
        timing: index < 3 
          ? ["Upon waking", "Pre-workout", "Post-workout", "With meals", "Before bed"]
          : index < 5 
          ? ["Upon waking", "Pre-workout", "Post-workout", "With meals"]
          : ["Upon waking", "Pre-workout", "Post-workout"]
      },
      workout: {
        time: data.sport === "Wrestling" ? "5:00 PM" : "6:00 PM",
        activity: index < 3 
          ? `${data.sport} practice + 20-min moderate cardio`
          : index < 5
          ? `Light ${data.sport} drilling + 15-min cardio`
          : "Light technique work only",
        duration: index < 3 ? "90 minutes" : index < 5 ? "60 minutes" : "45 minutes"
      },
      recovery: index < 3 
        ? ["10-min sauna", "Foam rolling", "Stretching", "8 hours sleep"]
        : index < 5
        ? ["Warm bath", "Light stretching", "8 hours sleep"]
        : ["Gentle walk", "Meditation", "9 hours sleep"],
      targetWeight: data.currentWeight - (dailyWeightLoss * (index + 1))
    }));

    return samplePlan;
  };

  const loadSavedInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the most recent plan to load saved preferences
      const { data: lastPlan, error } = await supabase
        .from('weight_cutting_plans')
        .select('height, height_unit, gender, age, sport, food_preferences')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching saved info:', error);
        return;
      }

      if (lastPlan) {
        form.setValue('height', lastPlan.height);
        form.setValue('heightUnit', lastPlan.height_unit as 'ft' | 'cm');
        form.setValue('gender', lastPlan.gender as 'Male' | 'Female');
        form.setValue('age', lastPlan.age);
        form.setValue('sport', lastPlan.sport);
        form.setValue('foodPreferences', lastPlan.food_preferences || '');
        
        toast({
          title: "Info Loaded",
          description: "Your saved information has been loaded.",
        });
      } else {
        toast({
          title: "No Saved Info",
          description: "No previous plans found to load information from.",
        });
      }
    } catch (error) {
      console.error('Error loading saved info:', error);
      toast({
        title: "Error",
        description: "Failed to load saved information.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: WeightCuttingPlanFormData) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate AI plan
      const aiPlan = generateAIPlan(data);

      const { error } = await supabase
        .from('weight_cutting_plans')
        .insert({
          user_id: user.id,
          name: data.name,
          height: data.height,
          height_unit: data.heightUnit,
          current_weight: data.currentWeight,
          weight_unit: data.weightUnit,
          gender: data.gender,
          age: data.age,
          sport: data.sport,
          desired_weight: data.desiredWeight,
          weigh_in_date: data.weighInDate,
          training_schedule: data.trainingSchedule,
          food_preferences: data.foodPreferences,
          ai_generated_plan: aiPlan,
        });

      if (error) throw error;

      setGeneratedPlan(aiPlan);
      setShowPlan(true);

      toast({
        title: "Success",
        description: "Your AI-powered weight cutting plan has been generated!",
      });
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

  const exportPlan = () => {
    // Generate PDF content
    const formData = form.getValues();
    const planContent = `
WEIGHT CUTTING PLAN
===================

Plan Name: ${formData.name}
Athlete: ${formData.gender}, Age ${formData.age}
Height: ${formData.height} ${formData.heightUnit}
Current Weight: ${formData.currentWeight} ${formData.weightUnit}
Target Weight: ${formData.desiredWeight} ${formData.weightUnit}
Weigh-in Date: ${formData.weighInDate}
Sport: ${formData.sport}

DAILY PLAN
==========

${generatedPlan.map((day: any, index: number) => `
DAY ${index + 1} - ${new Date(day.date).toLocaleDateString()}
Target Weight: ${day.targetWeight?.toFixed(1)} ${formData.weightUnit}

MEALS:
- Breakfast: ${day.meals.breakfast}
- Lunch: ${day.meals.lunch}
- Dinner: ${day.meals.dinner}
${day.meals.snacks ? `- Snacks: ${day.meals.snacks}` : ''}

HYDRATION:
- Amount: ${day.hydration.amount}
- Timing: ${day.hydration.timing.join(', ')}

WORKOUT:
- Time: ${day.workout.time}
- Activity: ${day.workout.activity}
- Duration: ${day.workout.duration}

RECOVERY:
${day.recovery.map((item: string) => `- ${item}`).join('\n')}

`).join('\n')}

Training Schedule: ${formData.trainingSchedule}
Food Preferences: ${formData.foodPreferences || 'None specified'}

IMPORTANT: This plan should be supervised by a qualified coach or nutritionist.
`;

    const dataBlob = new Blob([planContent], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.name}-weight-cutting-plan.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Plan Exported",
      description: "Your weight cutting plan has been downloaded as a text file.",
    });
  };

  const handleUnitsChange = (newFoodUnit: 'oz' | 'g', newWaterUnit: 'oz' | 'l') => {
    setFoodUnit(newFoodUnit);
    setWaterUnit(newWaterUnit);
    // In a real app, you would convert the plan values here
    toast({
      title: "Units Updated",
      description: `Food measurements: ${newFoodUnit}, Water measurements: ${newWaterUnit}`,
    });
  };

  if (showPlan && generatedPlan) {
    const formData = form.getValues();
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {formData.name}
                </h1>
                <p className="text-muted-foreground">
                  Your personalized AI-generated weight cutting plan
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPlan(false)}>
                  Edit Plan
                </Button>
                <Button onClick={exportPlan} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Plan
                </Button>
              </div>
            </div>

            {/* Safety Warning */}
            <div className="mb-6">
              <SafetyWarning
                currentWeight={formData.currentWeight}
                desiredWeight={formData.desiredWeight}
                weighInDate={formData.weighInDate}
                weightUnit={formData.weightUnit}
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
                <PlanCalendar plan={generatedPlan} weightUnit={formData.weightUnit} />
              </TabsContent>
              
              <TabsContent value="progress" className="mt-6">
                <ProgressTracker
                  targetWeight={formData.desiredWeight}
                  currentWeight={formData.currentWeight}
                  weightUnit={formData.weightUnit}
                />
              </TabsContent>
              
              <TabsContent value="chat" className="mt-6">
                <AIChat 
                  planData={generatedPlan} 
                  onPlanUpdate={setGeneratedPlan}
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Your Weight Cutting Plan
            </h1>
            <p className="text-muted-foreground">
              Tell us about yourself and your goals to get a personalized AI-powered plan
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Plan Information</CardTitle>
              <CardDescription>
                Fill out the details below to create your custom weight cutting plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={loadSavedInfo}
                  className="gap-2"
                >
                  Load Saved Info
                </Button>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Championship Cut 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <HeightInput control={form.control} />
                    <WeightInput 
                      control={form.control} 
                      name="currentWeight" 
                      label="Current Weight" 
                      placeholder="170" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <AgeInput control={form.control} />
                  </div>

                  <FormField
                    control={form.control}
                    name="sport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sport</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your sport" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Wrestling">Wrestling</SelectItem>
                            <SelectItem value="MMA">MMA</SelectItem>
                            <SelectItem value="Jiu-Jitsu">Jiu-Jitsu</SelectItem>
                            <SelectItem value="Boxing">Boxing</SelectItem>
                            <SelectItem value="Muay Thai">Muay Thai</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <WeightInput 
                      control={form.control} 
                      name="desiredWeight" 
                      label="Desired Weight" 
                      placeholder="155" 
                    />

                    <FormField
                      control={form.control}
                      name="weighInDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weigh-In Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="trainingSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Training Schedule</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., 3 practices per week, 2 lifting sessions, cardio on off days"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foodPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food Preferences & Allergies</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., vegetarian, gluten-free, nut allergy, lactose intolerant"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Plan..." : "Create AI-Powered Plan"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;