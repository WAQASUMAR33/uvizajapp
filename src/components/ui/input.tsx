import TextField from "@mui/material/TextField";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, style, ...props }, ref) => (
    <TextField
      id={id}
      label={label}
      error={!!error}
      helperText={error}
      inputRef={ref}
      className={className}
      style={style}
      inputProps={props as any}
      size="small"
      fullWidth
    />
  )
);

Input.displayName = "Input";
export { Input };
