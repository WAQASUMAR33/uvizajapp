import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MainSidebar } from "@/components/MainSidebar";
import { MainHeader } from "@/components/MainHeader";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role    = (session?.user as any)?.role;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      {session && <MainSidebar role={role} />}

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <MainHeader session={session} />

        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>

        <Box
          component="footer"
          sx={{
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            py: 3,
            px: 3,
            mt: "auto",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
            © {new Date().getFullYear()} Ujivaj Inc. All rights reserved. Premium Gastronomy Privileges.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
