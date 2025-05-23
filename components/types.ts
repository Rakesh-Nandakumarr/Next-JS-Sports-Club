export interface Field {
  _id?: string;
  type: 'text' | 'email' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface Form {
  _id?: string;
  title: string;
  description?: string;
  fields: Field[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormResponse {
  fieldId: string;
  value: string | number | boolean | Date | string[];
}

export interface FormSubmission {
  _id?: string;
  formId: string;
  responses: FormResponse[];
  submittedAt?: Date;
}