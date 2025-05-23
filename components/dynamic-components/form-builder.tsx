"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Save, X } from "lucide-react";

type FormFieldType = 
  | 'text' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'date'
  | 'textarea'
  | 'number';

interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormBuilderProps {
  onFieldsChange: (fields: FormField[]) => void;
  initialFields?: FormField[];
}

export default function FormBuilder({ onFieldsChange, initialFields = [] }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [currentField, setCurrentField] = useState<Omit<FormField, 'id'>>({
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
  });
  const [optionsInput, setOptionsInput] = useState('');

  const addField = () => {
    if (!currentField.label) return;

    const newField: FormField = {
      ...currentField,
      id: Date.now().toString(),
      options: (currentField.type === 'select' || currentField.type === 'radio' || currentField.type === 'checkbox')
        ? optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt)
        : undefined,
    };

    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onFieldsChange(updatedFields);
    resetFieldForm();
  };

  const resetFieldForm = () => {
    setCurrentField({
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
    });
    setOptionsInput('');
  };

  const removeField = (id: string) => {
    const updatedFields = fields.filter(field => field.id !== id);
    setFields(updatedFields);
    onFieldsChange(updatedFields);
  };

  const clearAll = () => {
    setFields([]);
    onFieldsChange([]);
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(field => field.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
    onFieldsChange(newFields);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
    onFieldsChange(updatedFields);
  };

  const renderPreviewField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input 
            type="text" 
            placeholder={field.placeholder} 
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'number':
        return (
          <Input 
            type="number" 
            placeholder={field.placeholder} 
            required={field.required}
          />
        );
      case 'select':
        return (
          <Select required={field.required}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, i) => (
                <SelectItem key={i} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex flex-col gap-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${i}`} />
                <Label htmlFor={`${field.id}-${i}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <RadioGroup required={field.required}>
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${i}`} />
                <Label htmlFor={`${field.id}-${i}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'date':
        return (
          <Calendar
            mode="single"
            className="rounded-md border"
            required={field.required}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Form Field</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field-type">Field Type</Label>
              <Select
                value={currentField.type}
                onValueChange={(value) => setCurrentField({...currentField, type: value as FormFieldType})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="textarea">Text Area</SelectItem>
                  <SelectItem value="number">Number Input</SelectItem>
                  <SelectItem value="select">Select Dropdown</SelectItem>
                  <SelectItem value="checkbox">Checkbox Group</SelectItem>
                  <SelectItem value="radio">Radio Group</SelectItem>
                  <SelectItem value="date">Date Picker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-label">Label *</Label>
              <Input
                id="field-label"
                value={currentField.label}
                onChange={(e) => setCurrentField({...currentField, label: e.target.value})}
                placeholder="Field label"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-placeholder">Placeholder (optional)</Label>
              <Input
                id="field-placeholder"
                value={currentField.placeholder || ''}
                onChange={(e) => setCurrentField({...currentField, placeholder: e.target.value})}
                placeholder="Field placeholder"
              />
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="field-required"
                checked={currentField.required}
                onCheckedChange={(checked) => setCurrentField({...currentField, required: checked})}
              />
              <Label htmlFor="field-required">Required</Label>
            </div>
          </div>

          {(currentField.type === 'select' || currentField.type === 'checkbox' || currentField.type === 'radio') && (
            <div className="space-y-2">
              <Label htmlFor="field-options">
                Options (comma separated) *
              </Label>
              <Input
                id="field-options"
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
                placeholder="Option 1, Option 2, Option 3"
                required
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple options with commas
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetFieldForm}
              disabled={!currentField.label && !currentField.placeholder && !optionsInput}
            >
              Reset
            </Button>
            <Button 
              type="button" 
              onClick={addField}
              disabled={!currentField.label || (
                (currentField.type === 'select' || currentField.type === 'checkbox' || currentField.type === 'radio') && 
                !optionsInput
              )}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Form Preview</CardTitle>
            {fields.length > 0 && (
              <Button variant="destructive" onClick={clearAll}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fields added yet. Add some fields to see the preview.
            </div>
          ) : (
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="group relative">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          ({field.type})
                        </span>
                      </div>
                      {renderPreviewField(field)}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeField(field.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveField(field.id, 'up')}
                        disabled={index === 0}
                        className="h-8 w-8"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveField(field.id, 'down')}
                        disabled={index === fields.length - 1}
                        className="h-8 w-8"
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}