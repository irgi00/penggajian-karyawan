import * as React from 'react';
import { cn } from '@/lib/utils';

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
};

/**
 * Simple wrapper that provides consistent label styling and optional error message.
 */
export const FormField: React.FC<FormFieldProps> = ({ label, children, error, className }) => {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
