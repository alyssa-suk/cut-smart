import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { useState } from "react";

interface UnitConverterProps {
  onUnitsChange: (foodUnit: 'oz' | 'g', waterUnit: 'oz' | 'l') => void;
}

export const UnitConverter = ({ onUnitsChange }: UnitConverterProps) => {
  const [foodUnit, setFoodUnit] = useState<'oz' | 'g'>('oz');
  const [waterUnit, setWaterUnit] = useState<'oz' | 'l'>('oz');

  const toggleFoodUnit = () => {
    const newUnit = foodUnit === 'oz' ? 'g' : 'oz';
    setFoodUnit(newUnit);
    onUnitsChange(newUnit, waterUnit);
  };

  const toggleWaterUnit = () => {
    const newUnit = waterUnit === 'oz' ? 'l' : 'oz';
    setWaterUnit(newUnit);
    onUnitsChange(foodUnit, newUnit);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Unit Conversion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Food measurements:</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFoodUnit}
            className="w-20"
          >
            {foodUnit}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Water measurements:</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleWaterUnit}
            className="w-20"
          >
            {waterUnit}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};