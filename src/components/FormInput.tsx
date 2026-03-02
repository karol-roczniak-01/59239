import type React from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";

interface FormInputProps {
  field: AnyFieldApi;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  hint?: string;
  suffix?: string;
  min?: string;
  max?: string;
  className?: string;
  textarea?: boolean;
  rows?: number;
  counter?: number;
}

const FormInput: React.FC<FormInputProps> = ({
  field,
  label,
  type = "text",
  autoComplete,
  placeholder,
  autoFocus,
  disabled,
  hint,
  suffix,
  min,
  max,
  className,
  textarea = false,
  rows,
  counter,
}) => {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-6 gap-2 items-start">
        <div className="col-span-2 flex flex-col">
          <label className="truncate">[{label}]</label>
          {counter !== undefined && (
            <span className="opacity-70">{field.state.value.trim().length}/{counter}</span>
          )}
          {hint && <span className="opacity-70">{hint}</span>}
        </div>
        <div className="col-span-4 flex items-center gap-1">
          {textarea ? (
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              className={`w-full resize-none ${className ?? ''}`}
            />
          ) : (
            <Input
              id={field.name}
              name={field.name}
              type={type}
              autoComplete={autoComplete}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              disabled={disabled}
              min={min}
              max={max}
              className={className}
            />
          )}
          {suffix && <span>{suffix}</span>}
        </div>
      </div>
      {field.state.meta.errors.length > 0 && (
        <p className="opacity-70">! {field.state.meta.errors[0]}</p>
      )}
    </div>
  );
};

export default FormInput;