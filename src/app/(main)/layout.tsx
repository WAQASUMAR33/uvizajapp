import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MainSidebar } from "@/components/MainSidebar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role    = (session?.user as any)?.role;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {session && <MainSidebar role={role} />}

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box component="main" sx={{ flex: 1 }}>{children}</Box>

        <Box component="footer" sx={{ bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", py: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            © 2026 Ujivaj. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
