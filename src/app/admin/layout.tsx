import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminTopbar } from "@/components/admin/Topbar";
import Box from "@mui/material/Box";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "SALESMAN"];
  if (!session || !STAFF_ROLES.includes(role)) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <Box className="admin-scope" sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <AdminSidebar role={role} user={session.user} />

      <Box
        component="div"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          bgcolor: "background.default",
        }}
      >
        <AdminTopbar user={session.user!} />
        <Box component="main" sx={{ flex: 1, overflow: "auto" }}>
          <Box sx={{ p: { xs: 2.5, sm: 3.5, md: 4 } }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
