import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import MuiButton from "@mui/material/Button";
import { Calendar, Settings } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/profile");

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", px: 3, py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, borderColor: "divider", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Avatar sx={{ width: 64, height: 64, fontSize: "1.5rem", fontWeight: 700, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 3 }}>
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.name || "No name set"}</Typography>
              <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              <Chip
                label="Admin"
                size="small"
                sx={{ mt: 1, bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600, fontSize: "0.72rem" }}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Calendar size={16} color="#94a3b8" />
            <Typography variant="caption" color="text.secondary">
              Member since {formatDate(user.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <MuiButton
          component={Link}
          href="/admin"
          variant="contained"
          startIcon={<Settings size={16} />}
          sx={{ borderRadius: "10px" }}
        >
          Go to Admin Panel
        </MuiButton>
      </Box>
    </Box>
  );
}
