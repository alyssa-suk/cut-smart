import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { WeightCuttingPlanFormData } from "@/lib/validations";
import { useState, useEffect } from "react";

interface HeightInputProps {
  control: Control<WeightCuttingPlanFormData>;
}

export const HeightInput = ({ control }: HeightInputProps) => {
  const [feet, setFeet] = useState<number>(0);
  const [inches, setInches] = useState<number>(0);

  return (
    <FormField
      control={control}
      name="height"
      render={({ field }) => {
        // Initialize feet and inches from field value when it changes
        useEffect(() => {
          if (field.value && !isNaN(field.value)) {
            setFeet(Math.floor(field.value));
            setInches(Math.round((field.value % 1) * 12));
          }
        }, [field.value]);

        return (
          <FormItem>
            <FormLabel>Height</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <FormField
                  control={control}
                  name="heightUnit"
                  render={({ field: unitField }) => (
                    unitField.value === 'ft' ? (
                      <Input 
                        type="number" 
                        step="1"
                        placeholder="5" 
                        value={feet || ''}
                        onChange={(e) => {
                          const newFeet = parseInt(e.target.value) || 0;
                          setFeet(newFeet);
                          field.onChange(newFeet + inches / 12);
                        }}
                      />
                    ) : (
                      <Input 
                        type="number" 
                        step="1"
                        placeholder="170" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? 0 : parseFloat(value));
                        }}
                      />
                    )
                  )}
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
                      value={inches || ''}
                      onChange={(e) => {
                        let newInches = parseInt(e.target.value) || 0;
                        
                        if (newInches >= 12) {
                          const additionalFeet = Math.floor(newInches / 12);
                          const remainingInches = newInches % 12;
                          const newFeet = feet + additionalFeet;
                          setFeet(newFeet);
                          setInches(remainingInches);
                          field.onChange(newFeet + remainingInches / 12);
                        } else {
                          setInches(newInches);
                          field.onChange(feet + newInches / 12);
                        }
                      }}
                    />
                  ) : null
                )}
              />
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};