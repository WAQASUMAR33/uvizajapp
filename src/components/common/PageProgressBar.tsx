"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { useColorMode } from "@/components/ThemeRegistry";

interface PageProgressBarProps {
  loading?: boolean;
  height?: number;
}

export function PageProgressBar({ loading = true, height = 3 }: PageProgressBarProps) {
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  if (!loading) return null;

  return (
    <Box sx={{ width: "100%", overflow: "hidden", position: "relative" }}>
      <LinearProgress
        sx={{
          height,
          borderRadius: 0,
          bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(99, 102, 241, 0.08)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 0,
            background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 35%, #0ea5e9 70%, #10b981 100%)",
            boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)",
          },
        }}
      />
    </Box>
  );
}

interface TableSkeletonRowsProps {
  columns: number;
  rows?: number;
}

export function TableSkeletonRows({ columns, rows = 5 }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow key={`skeleton-row-${rIdx}`}>
          {Array.from({ length: columns }).map((_, cIdx) => (
            <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`} sx={{ py: 2 }}>
              <Skeleton
                variant="rectangular"
                height={20}
                sx={{
                  borderRadius: 0,
                  width: cIdx === 0 ? "40%" : cIdx === columns - 1 ? "60%" : "85%",
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
