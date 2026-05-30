import MuiCard from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";
import MuiCardHeader from "@mui/material/CardHeader";
import MuiCardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <MuiCard className={cn(className)} {...(props as any)} />;
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Typography variant="h6" component="h3" className={cn(className)} {...(props as any)}>
      {children}
    </Typography>
  );
}

function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Typography variant="body2" color="text.secondary" className={cn(className)} {...(props as any)}>
      {children}
    </Typography>
  );
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <MuiCardContent className={cn(className)} {...(props as any)} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <MuiCardActions
      className={cn("px-4 py-3 border-t border-slate-100 bg-slate-50", className)}
      {...(props as any)}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
