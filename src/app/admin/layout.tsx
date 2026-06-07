import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminTopbar } from "@/components/admin/Topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "SALESMAN"];
  if (!session || !STAFF_ROLES.includes(role)) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={role} />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <AdminTopbar user={session.user!} />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
