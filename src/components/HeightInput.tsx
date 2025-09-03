import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { WeightCuttingPlanFormData } from "@/lib/validations";

interface HeightInputProps {
  control: Control<WeightCuttingPlanFormData>;
}

export const HeightInput = ({ control }: HeightInputProps) => {
  return (
    <FormField
      control={control}
      name="height"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Height</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input 
                type="number" 
                step="1"
                placeholder="5 or 170" 
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? 0 : parseFloat(value));
                }}
              />
            </FormControl>
            <FormField
              control={control}
              name="heightUnit"
              render={({ field: unitField }) => (
                <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ft">ft</SelectItem>
                    <SelectItem value="cm">cm</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {/* Inches field for feet */}
            <FormField
              control={control}
              name="heightUnit"
              render={({ field: unitField }) => (
                unitField.value === 'ft' ? (
                  <Input 
                    type="number" 
                    step="1"
                    placeholder="9" 
                    className="w-20"
                    onChange={(e) => {
                      const inches = parseFloat(e.target.value) || 0;
                      const feet = Math.floor(field.value || 0);
                      field.onChange(feet + inches / 12);
                    }}
                  />
                ) : null
              )}
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};