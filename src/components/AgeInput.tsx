import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { WeightCuttingPlanFormData } from "@/lib/validations";

interface AgeInputProps {
  control: Control<WeightCuttingPlanFormData>;
}

export const AgeInput = ({ control }: AgeInputProps) => {
  return (
    <FormField
      control={control}
      name="age"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Age</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              step="1"
              placeholder="25"
              {...field}
              value={field.value || ''}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === '' ? 0 : parseInt(value));
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};