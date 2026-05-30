import TextField from "@mui/material/TextField";
import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, rows = 4, className, style, ...props }, ref) => (
    <TextField
      id={id}
      label={label}
      error={!!error}
      helperText={error}
      multiline
      rows={rows}
      inputRef={ref}
      className={className}
      style={style}
      slotProps={{ htmlInput: props as any }}
      size="small"
      fullWidth
    />
  )
);

Textarea.displayName = "Textarea";
export { Textarea };
