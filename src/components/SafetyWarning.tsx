import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";

interface SafetyWarningProps {
  currentWeight: number;
  desiredWeight: number;
  weighInDate: string;
  weightUnit: string;
}

export const SafetyWarning = ({ currentWeight, desiredWeight, weighInDate, weightUnit }: SafetyWarningProps) => {
  const weightDiff = currentWeight - desiredWeight;
  const daysToWeighIn = Math.ceil((new Date(weighInDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const dailyWeightLoss = weightDiff / daysToWeighIn;
  
  // Convert to consistent units for safety checks
  const maxSafeDaily = weightUnit === "lbs" ? 2 : 0.9; // 2 lbs or 0.9 kg per day max
  const maxSafeTotal = weightUnit === "lbs" ? 15 : 7; // 15 lbs or 7 kg total max
  
  const isUnsafe = dailyWeightLoss > maxSafeDaily || weightDiff > maxSafeTotal || daysToWeighIn < 3;
  
  if (!isUnsafe) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4" />
        <AlertTitle className="text-green-800">Safe Weight Cut Plan</AlertTitle>
        <AlertDescription className="text-green-700">
          Your weight cutting goal is within safe parameters. Daily target: {dailyWeightLoss.toFixed(1)} {weightUnit}/day over {daysToWeighIn} days.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>⚠️ Aggressive Weight Cut Warning</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p><strong>This weight cut may be unsafe:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            {dailyWeightLoss > maxSafeDaily && (
              <li>Daily weight loss: {dailyWeightLoss.toFixed(1)} {weightUnit}/day (recommended max: {maxSafeDaily} {weightUnit}/day)</li>
            )}
            {weightDiff > maxSafeTotal && (
              <li>Total weight cut: {weightDiff.toFixed(1)} {weightUnit} (recommended max: {maxSafeTotal} {weightUnit})</li>
            )}
            {daysToWeighIn < 3 && (
              <li>Timeline too short: {daysToWeighIn} days (minimum recommended: 3 days)</li>
            )}
          </ul>
          <p className="mt-2 font-medium">Consider consulting with a sports nutritionist or extending your timeline.</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};