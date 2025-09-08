import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Utensils, Droplets, Dumbbell, RotateCcw } from "lucide-react";
import { useState } from "react";

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

// Conversion functions
const convertOzToG = (value: number) => Math.round(value * 28.3495 * 100) / 100;
const convertGToOz = (value: number) => Math.round(value / 28.3495 * 100) / 100;
const convertOzToL = (value: number) => Math.round(value * 0.0295735 * 100) / 100;
const convertLToOz = (value: number) => Math.round(value / 0.0295735 * 100) / 100;

const convertText = (text: string, fromUnit: string, toUnit: string) => {
  if (fromUnit === toUnit) return text;
  
  // Food conversions (oz <-> g)
  if ((fromUnit === 'oz' && toUnit === 'g') || (fromUnit === 'g' && toUnit === 'oz')) {
    const ozPattern = /(\d+(?:\.\d+)?)\s*oz/gi;
    const gPattern = /(\d+(?:\.\d+)?)\s*g/gi;
    
    if (fromUnit === 'oz' && toUnit === 'g') {
      return text.replace(ozPattern, (match, value) => {
        const converted = convertOzToG(parseFloat(value));
        return `${converted}g`;
      });
    } else {
      return text.replace(gPattern, (match, value) => {
        const converted = convertGToOz(parseFloat(value));
        return `${converted}oz`;
      });
    }
  }
  
  return text;
};

const convertHydration = (hydration: any, fromUnit: string, toUnit: string) => {
  if (fromUnit === toUnit || !hydration) return hydration;
  
  if (typeof hydration === 'string') {
    // Water conversions (oz <-> l)
    const ozPattern = /(\d+(?:\.\d+)?)\s*oz/gi;
    const lPattern = /(\d+(?:\.\d+)?)\s*l(?!bs)/gi; // exclude "lbs"
    
    if (fromUnit === 'oz' && toUnit === 'l') {
      return hydration.replace(ozPattern, (match, value) => {
        const converted = convertOzToL(parseFloat(value));
        return `${converted}l`;
      });
    } else if (fromUnit === 'l' && toUnit === 'oz') {
      return hydration.replace(lPattern, (match, value) => {
        const converted = convertLToOz(parseFloat(value));
        return `${converted}oz`;
      });
    }
  } else if (hydration && hydration.amount) {
    // Handle object format
    const ozPattern = /(\d+(?:\.\d+)?)\s*oz/gi;
    const lPattern = /(\d+(?:\.\d+)?)\s*l(?!bs)/gi;
    
    let convertedAmount = hydration.amount;
    if (fromUnit === 'oz' && toUnit === 'l') {
      convertedAmount = hydration.amount.replace(ozPattern, (match: string, value: string) => {
        const converted = convertOzToL(parseFloat(value));
        return `${converted}l`;
      });
    } else if (fromUnit === 'l' && toUnit === 'oz') {
      convertedAmount = hydration.amount.replace(lPattern, (match: string, value: string) => {
        const converted = convertLToOz(parseFloat(value));
        return `${converted}oz`;
      });
    }
    
    return {
      ...hydration,
      amount: convertedAmount
    };
  }
  
  return hydration;
};

export const PlanCalendar = ({ plan, weightUnit }: PlanCalendarProps) => {
  const [foodUnit, setFoodUnit] = useState<'oz' | 'g'>('oz');
  const [waterUnit, setWaterUnit] = useState<'oz' | 'l'>('oz');
  const [originalPlan] = useState(plan); // Store original plan to always convert from base

  const toggleFoodUnit = () => {
    setFoodUnit(foodUnit === 'oz' ? 'g' : 'oz');
  };

  const toggleWaterUnit = () => {
    setWaterUnit(waterUnit === 'oz' ? 'l' : 'oz');
  };

  const convertPlanData = (originalPlan: DayPlan[]) => {
    return originalPlan.map(day => ({
      ...day,
      meals: {
        breakfast: convertText(day.meals.breakfast, 'oz', foodUnit),
        lunch: convertText(day.meals.lunch, 'oz', foodUnit),
        dinner: convertText(day.meals.dinner, 'oz', foodUnit),
        snacks: day.meals.snacks ? convertText(day.meals.snacks, 'oz', foodUnit) : undefined
      },
      hydration: convertHydration(day.hydration, 'oz', waterUnit)
    }));
  };

  const convertedPlan = convertPlanData(originalPlan);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Your 7-Day Weight Cutting Plan</h2>
        </div>
        
        {/* Unit Conversion Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Food:</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFoodUnit}
              className="w-12 h-8"
            >
              {foodUnit}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Water:</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleWaterUnit}
              className="w-12 h-8"
            >
              {waterUnit}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        {convertedPlan.map((day, index) => (
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
                      <p className="text-muted-foreground">
                        {typeof day.hydration === 'string' ? day.hydration : day.hydration.amount}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Timing:</span>
                      <ul className="text-muted-foreground">
                        {(typeof day.hydration === 'string' ? [] : day.hydration.timing || []).map((time, i) => (
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