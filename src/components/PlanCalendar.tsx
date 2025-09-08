import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Utensils, Droplets, Dumbbell } from "lucide-react";

interface DayPlan {
  date: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks?: string;
  };
  hydration: {
    amount: string;
    timing: string[];
  };
  workout: {
    time: string;
    activity: string;
    duration: string;
  };
  recovery: string[];
  targetWeight?: number;
}

interface PlanCalendarProps {
  plan: DayPlan[];
  weightUnit: string;
}

export const PlanCalendar = ({ plan, weightUnit }: PlanCalendarProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Your 7-Day Weight Cutting Plan</h2>
      </div>
      
      <div className="grid gap-4">
        {plan.map((day, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center justify-between">
                <span>Day {index + 1} - {new Date(day.date).toLocaleDateString()}</span>
                {day.targetWeight && (
                  <Badge variant="outline">
                    Target: {day.targetWeight.toFixed(2)} {weightUnit}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Meals */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Meals</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Breakfast:</span>
                      <p className="text-muted-foreground">{day.meals.breakfast}</p>
                    </div>
                    <div>
                      <span className="font-medium">Lunch:</span>
                      <p className="text-muted-foreground">{day.meals.lunch}</p>
                    </div>
                    <div>
                      <span className="font-medium">Dinner:</span>
                      <p className="text-muted-foreground">{day.meals.dinner}</p>
                    </div>
                    {day.meals.snacks && (
                      <div>
                        <span className="font-medium">Snacks:</span>
                        <p className="text-muted-foreground">{day.meals.snacks}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hydration */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Hydration</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Total:</span>
                      <p className="text-muted-foreground">{day.hydration.amount}</p>
                    </div>
                    <div>
                      <span className="font-medium">Timing:</span>
                      <ul className="text-muted-foreground">
                        {day.hydration.timing.map((time, i) => (
                          <li key={i}>• {time}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Workout */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Workout</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Time:</span>
                      <p className="text-muted-foreground">{day.workout.time}</p>
                    </div>
                    <div>
                      <span className="font-medium">Activity:</span>
                      <p className="text-muted-foreground">{day.workout.activity}</p>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-muted-foreground">{day.workout.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Recovery */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Recovery</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    {day.recovery.map((item, i) => (
                      <div key={i} className="text-muted-foreground">• {item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};