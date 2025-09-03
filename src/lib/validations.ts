import { z } from "zod";

export const weightCuttingPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  height: z.number().positive("Height must be positive"),
  heightUnit: z.enum(["ft", "cm"]),
  currentWeight: z.number().positive("Current weight must be positive"),
  weightUnit: z.enum(["lbs", "kg"]),
  gender: z.enum(["Male", "Female"]),
  age: z.number().min(13, "Age must be at least 13").max(70, "Age must be less than 70"),
  sport: z.string().min(1, "Sport is required"),
  desiredWeight: z.number().positive("Desired weight must be positive"),
  weighInDate: z.string().min(1, "Weigh-in date is required"),
  trainingSchedule: z.string().min(1, "Training schedule is required"),
  foodPreferences: z.string().optional(),
}).refine((data) => {
  const weightDiff = Math.abs(data.currentWeight - data.desiredWeight);
  const maxSafeWeightLoss = data.weightUnit === "lbs" ? 15 : 7; // 15 lbs or 7 kg max
  return weightDiff <= maxSafeWeightLoss;
}, {
  message: "Weight cut is too aggressive for safety. Maximum recommended is 15 lbs or 7 kg.",
  path: ["desiredWeight"]
});

export type WeightCuttingPlanFormData = z.infer<typeof weightCuttingPlanSchema>;