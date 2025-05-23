"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface DynamicFormProps {
  fields: FormField[];
}

export default function DynamicForm({ fields }: DynamicFormProps) {
  const { control, formState: { errors } } = useFormContext();

  if (!control) {
    throw new Error("DynamicForm must be used within a FormProvider");
  }

  const renderField = (field: FormField) => {
    const rules = {
      required: field.required ? `${field.label} is required` : false,
    };

    switch (field.type) {
      case 'text':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => (
              <Input
                type="text"
                placeholder={field.placeholder}
                value={value || ''}
                onChange={onChange}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => (
              <Textarea
                placeholder={field.placeholder}
                value={value || ''}
                onChange={onChange}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => (
              <Input
                type="number"
                placeholder={field.placeholder}
                value={value || ''}
                onChange={onChange}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => (
              <Select onValueChange={onChange} value={value}>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="flex flex-col gap-2">
                {field.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.id}-${option}`}
                      checked={value?.includes(option)}
                      onCheckedChange={(checked) => {
                        const currentValues = value || [];
                        const newValues = checked
                          ? [...currentValues, option]
                          : currentValues.filter((val: string) => val !== option);
                        onChange(newValues);
                      }}
                    />
                    <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                  </div>
                ))}
              </div>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => (
              <RadioGroup onValueChange={onChange} value={value}>
                {field.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                    <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => onChange(date?.toISOString())}
                />
              </div>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {renderField(field)}
          {errors[field.id] && (
            <p className="text-sm font-medium text-destructive">
              {errors[field.id]?.message as string}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}