import * as React from "react";
import { useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormTextFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  id?: string;
}

export function FormTextField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  className,
  autoComplete,
  id,
}: FormTextFieldProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-1.5 text-left">
          <FormLabel className="flex items-center gap-1 text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-red-500 font-bold" aria-hidden="true">*</span>}
            {required && <span className="sr-only">(required)</span>}
          </FormLabel>
          <FormControl>
            <div className="relative flex items-center">
              <Input
                {...field}
                id={id || name}
                type={actualType}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={!!fieldState.error}
                className={cn(
                  "h-11 bg-white/3 border-white/10 focus-visible:ring-primary/50 focus-visible:border-primary/50",
                  isPassword && "pr-11",
                  className
                )}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-hidden rounded-md p-1 transition-colors cursor-pointer"
                  aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-xs font-semibold text-destructive mt-1.5" />
        </FormItem>
      )}
    />
  );
}
