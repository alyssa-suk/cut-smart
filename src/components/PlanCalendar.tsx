import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Utensils, Droplets, Dumbbell, RotateCcw, TrendingDown } from "lucide-react";
import { useState } from "react";

interface DayPlan {
  date: string;
  calories?: {
    target: number;
    breakdown: {
      breakfast: number;
      lunch: number;
      dinner: number;
      snacks: number;
    };
  };
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
const convertOzToG = (value: number) => Math.round(value * 28.3495 * 10) / 10;
const convertGToOz = (value: number) => Math.round(value / 28.3495 * 10) / 10;
const convertOzToL = (value: number) => Math.round(value * 0.0295735 * 10) / 10;
const convertLToOz = (value: number) => Math.round(value / 0.0295735 * 10) / 10;

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
    // Water conversions (oz <-> l) - handle ranges and single values
    const ozRangePattern = /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*oz/gi;
    const ozSinglePattern = /(\d+(?:\.\d+)?)\s*oz/gi;
    const lRangePattern = /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*l(?!bs)/gi;
    const lSinglePattern = /(\d+(?:\.\d+)?)\s*l(?!bs)/gi;
    
    if (fromUnit === 'oz' && toUnit === 'l') {
      // Convert ranges first
      let result = hydration.replace(ozRangePattern, (match, value1, value2) => {
        const converted1 = convertOzToL(parseFloat(value1));
        const converted2 = convertOzToL(parseFloat(value2));
        return `${converted1}-${converted2}l`;
      });
      
      // Then convert any remaining single values
      result = result.replace(ozSinglePattern, (match, value) => {
        const converted = convertOzToL(parseFloat(value));
        return `${converted}l`;
      });
      
      return result;
    } else if (fromUnit === 'l' && toUnit === 'oz') {
      // Convert ranges first
      let result = hydration.replace(lRangePattern, (match, value1, value2) => {
        const converted1 = convertLToOz(parseFloat(value1));
        const converted2 = convertLToOz(parseFloat(value2));
        return `${converted1}-${converted2}oz`;
      });
      
      // Then convert any remaining single values
      result = result.replace(lSinglePattern, (match, value) => {
        const converted = convertLToOz(parseFloat(value));
        return `${converted}oz`;
      });
      
      return result;
    }
  } else if (hydration && hydration.amount) {
    // Handle object format
    const ozRangePattern = /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*oz/gi;
    const ozSinglePattern = /(\d+(?:\.\d+)?)\s*oz/gi;
    const lRangePattern = /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*l(?!bs)/gi;
    const lSinglePattern = /(\d+(?:\.\d+)?)\s*l(?!bs)/gi;
    
    let convertedAmount = hydration.amount;
    if (fromUnit === 'oz' && toUnit === 'l') {
      // Convert ranges first
      convertedAmount = hydration.amount.replace(ozRangePattern, (match: string, value1: string, value2: string) => {
        const converted1 = convertOzToL(parseFloat(value1));
        const converted2 = convertOzToL(parseFloat(value2));
        return `${converted1}-${converted2}l`;
      });
      
      // Then convert any remaining single values
      convertedAmount = convertedAmount.replace(ozSinglePattern, (match: string, value: string) => {
        const converted = convertOzToL(parseFloat(value));
        return `${converted}l`;
      });
    } else if (fromUnit === 'l' && toUnit === 'oz') {
      // Convert ranges first
      convertedAmount = hydration.amount.replace(lRangePattern, (match: string, value1: string, value2: string) => {
        const converted1 = convertLToOz(parseFloat(value1));
        const converted2 = convertLToOz(parseFloat(value2));
        return `${converted1}-${converted2}oz`;
      });
      
      // Then convert any remaining single values
      convertedAmount = convertedAmount.replace(lSinglePattern, (match: string, value: string) => {
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
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="section-title">Your 7-Day Plan</h2>
          </div>
          <div className="accent-line w-24"></div>
        </div>
        
        {/* Unit Conversion Controls */}
        <div className="flex items-center gap-6 bg-card/50 backdrop-blur-sm p-4 rounded-lg shadow-elevation">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Food:</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFoodUnit}
              className="w-12 h-8 font-bold"
            >
              {foodUnit}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Water:</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleWaterUnit}
              className="w-12 h-8 font-bold"
            >
              {waterUnit}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6">
        {convertedPlan.map((day, index) => (
          <Card key={index} className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border-0">
            <CardHeader className="bg-gradient-card shadow-inner-glow py-6">
              <CardTitle className="flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-2xl font-bold uppercase tracking-wide">Day {index + 1}</span>
                  <div className="text-sm text-muted-foreground font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {day.calories && (
                    <Badge variant="secondary" className="font-bold text-sm px-3 py-1">
                      {day.calories.target} CAL
                    </Badge>
                  )}
                  {day.targetWeight && (
                    <Badge variant="outline" className="font-bold text-sm px-3 py-1 border-primary">
                      TARGET: {day.targetWeight.toFixed(2)} {weightUnit.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                {/* Calories */}
                {day.calories && (
                  <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-bold text-lg uppercase tracking-wide">Calories</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Daily Target:</span>
                        <p className="text-muted-foreground font-semibold">{day.calories.target} cal</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs">Breakfast:</span>
                          <span className="text-xs text-muted-foreground">{day.calories.breakdown.breakfast}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Lunch:</span>
                          <span className="text-xs text-muted-foreground">{day.calories.breakdown.lunch}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Dinner:</span>
                          <span className="text-xs text-muted-foreground">{day.calories.breakdown.dinner}</span>
                        </div>
                        {day.calories.breakdown.snacks > 0 && (
                          <div className="flex justify-between">
                            <span className="text-xs">Snacks:</span>
                            <span className="text-xs text-muted-foreground">{day.calories.breakdown.snacks}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* Meals */}
                <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg uppercase tracking-wide">Meals</h4>
                  </div>
                   <div className="space-y-2 text-sm">
                     <div>
                       <div className="flex items-center justify-between">
                         <span className="font-medium">Breakfast:</span>
                         {day.calories && (
                           <Badge variant="outline" className="text-xs">
                             {day.calories.breakdown.breakfast} cal
                           </Badge>
                         )}
                       </div>
                       <p className="text-muted-foreground">{day.meals.breakfast}</p>
                     </div>
                     <div>
                       <div className="flex items-center justify-between">
                         <span className="font-medium">Lunch:</span>
                         {day.calories && (
                           <Badge variant="outline" className="text-xs">
                             {day.calories.breakdown.lunch} cal
                           </Badge>
                         )}
                       </div>
                       <p className="text-muted-foreground">{day.meals.lunch}</p>
                     </div>
                     <div>
                       <div className="flex items-center justify-between">
                         <span className="font-medium">Dinner:</span>
                         {day.calories && (
                           <Badge variant="outline" className="text-xs">
                             {day.calories.breakdown.dinner} cal
                           </Badge>
                         )}
                       </div>
                       <p className="text-muted-foreground">{day.meals.dinner}</p>
                     </div>
                     {day.meals.snacks && (
                       <div>
                         <div className="flex items-center justify-between">
                           <span className="font-medium">Snacks:</span>
                           {day.calories && day.calories.breakdown.snacks > 0 && (
                             <Badge variant="outline" className="text-xs">
                               {day.calories.breakdown.snacks} cal
                             </Badge>
                           )}
                         </div>
                         <p className="text-muted-foreground">{day.meals.snacks}</p>
                       </div>
                     )}
                   </div>
                </div>

                {/* Hydration */}
                <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Droplets className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg uppercase tracking-wide">Hydration</h4>
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
                <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg uppercase tracking-wide">Workout</h4>
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
                <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg uppercase tracking-wide">Recovery</h4>
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