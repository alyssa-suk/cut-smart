import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const CreatePlan = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    height: '',
    heightUnit: 'ft',
    currentWeight: '',
    weightUnit: 'lbs',
    gender: '',
    age: '',
    sport: '',
    desiredWeight: '',
    weighInDate: '',
    trainingSchedule: '',
    foodPreferences: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('weight_cutting_plans')
        .insert({
          user_id: user.id,
          name: formData.name,
          height: parseFloat(formData.height),
          height_unit: formData.heightUnit,
          current_weight: parseFloat(formData.currentWeight),
          weight_unit: formData.weightUnit,
          gender: formData.gender,
          age: parseInt(formData.age),
          sport: formData.sport,
          desired_weight: parseFloat(formData.desiredWeight),
          weigh_in_date: formData.weighInDate,
          training_schedule: formData.trainingSchedule,
          food_preferences: formData.foodPreferences,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Plan created successfully! Generating your AI-powered weight cutting plan...",
      });

      // TODO: Navigate to AI plan generation
      navigate('/dashboard');
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Championship Cut 2024"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <div className="flex gap-2">
                      <Input
                        id="height"
                        placeholder="5.5 or 170"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        required
                      />
                      <Select value={formData.heightUnit} onValueChange={(value) => setFormData({ ...formData, heightUnit: value })}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ft">ft</SelectItem>
                          <SelectItem value="cm">cm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentWeight">Current Weight</Label>
                    <div className="flex gap-2">
                      <Input
                        id="currentWeight"
                        placeholder="170"
                        value={formData.currentWeight}
                        onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                        required
                      />
                      <Select value={formData.weightUnit} onValueChange={(value) => setFormData({ ...formData, weightUnit: value })}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lbs">lbs</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sport">Sport</Label>
                  <Select value={formData.sport} onValueChange={(value) => setFormData({ ...formData, sport: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wrestling">Wrestling</SelectItem>
                      <SelectItem value="MMA">MMA</SelectItem>
                      <SelectItem value="Jiu-Jitsu">Jiu-Jitsu</SelectItem>
                      <SelectItem value="Boxing">Boxing</SelectItem>
                      <SelectItem value="Muay Thai">Muay Thai</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="desiredWeight">Desired Weight</Label>
                    <Input
                      id="desiredWeight"
                      placeholder="155"
                      value={formData.desiredWeight}
                      onChange={(e) => setFormData({ ...formData, desiredWeight: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weighInDate">Weigh-In Date</Label>
                    <Input
                      id="weighInDate"
                      type="date"
                      value={formData.weighInDate}
                      onChange={(e) => setFormData({ ...formData, weighInDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingSchedule">Current Training Schedule</Label>
                  <Textarea
                    id="trainingSchedule"
                    placeholder="e.g., 3 practices per week, 2 lifting sessions, cardio on off days"
                    value={formData.trainingSchedule}
                    onChange={(e) => setFormData({ ...formData, trainingSchedule: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foodPreferences">Food Preferences & Allergies</Label>
                  <Textarea
                    id="foodPreferences"
                    placeholder="e.g., vegetarian, gluten-free, nut allergy, lactose intolerant"
                    value={formData.foodPreferences}
                    onChange={(e) => setFormData({ ...formData, foodPreferences: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Plan..." : "Create AI-Powered Plan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;