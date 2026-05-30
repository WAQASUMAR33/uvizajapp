import TextField from "@mui/material/TextField";
import { forwardRef, SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, children, className, style, ...props }, ref) => (
    <TextField
      id={id}
      label={label}
      error={!!error}
      helperText={error}
      select
      SelectProps={{ native: true, inputRef: ref }}
      className={className}
      style={style}
      size="small"
      fullWidth
      {...(props as any)}
    >
      {children}
    </TextField>
  )
);

Select.displayName = "Select";
export { Select };
