import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary:    { main: "#4f46e5", light: "#6366f1", dark: "#4338ca", contrastText: "#fff" },
    secondary:  { main: "#f59e0b", light: "#fbbf24", dark: "#d97706", contrastText: "#fff" },
    error:      { main: "#ef4444" },
    success:    { main: "#10b981" },
    warning:    { main: "#f59e0b" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    text:       { primary: "#0f172a", secondary: "#64748b" },
    divider:    "#e2e8f0",
  },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 0 },
  shadows: [
    "none",
    "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "0 1px 3px 0 rgb(0 0 0 / 0.08)",
    "0 4px 6px -1px rgb(0 0 0 / 0.08)",
    "0 10px 15px -3px rgb(0 0 0 / 0.08)",
    "0 20px 25px -5px rgb(0 0 0 / 0.08)",
    ...Array(19).fill("0 25px 50px -12px rgb(0 0 0 / 0.18)"),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root:       { borderRadius: 0, fontWeight: 600, textTransform: "none" },
        sizeLarge:  { padding: "10px 24px", fontSize: "0.9375rem" },
        sizeMedium: { padding: "8px 18px" },
        sizeSmall:  { padding: "5px 12px", fontSize: "0.8125rem" },
      },
    },
    MuiTextField:    { defaultProps: { variant: "outlined", size: "small", fullWidth: true } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiInputLabel:   { styleOverrides: { root: { fontSize: "0.875rem" } } },
    MuiPaper: {
      styleOverrides: {
        root:    { backgroundImage: "none" },
        rounded: { borderRadius: 0 },
      },
    },
    MuiCard:   { styleOverrides: { root: { borderRadius: 0, boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.08)" } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 0, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" } } },
    MuiDialogTitle: {
      styleOverrides: { root: { fontSize: "1.125rem", fontWeight: 700, padding: "20px 24px 16px" } },
    },
    MuiDialogContent: { styleOverrides: { root: { padding: "8px 24px 24px" } } },
    MuiChip:  { styleOverrides: { root: { borderRadius: 0, fontWeight: 600, fontSize: "0.75rem" } } },
    MuiAvatar: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiTableHead: {
      styleOverrides: {
        root: { "& .MuiTableCell-head": { fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", backgroundColor: "#f8fafc" } },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { "&:last-child td": { borderBottom: 0 }, "&:hover": { backgroundColor: "#f8fafc" } },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderColor: "#e2e8f0", padding: "14px 20px" } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 0, margin: "1px 0" } } },
    MuiAlert:  { styleOverrides: { root: { borderRadius: 0 } } },
  },
});

export default theme;
