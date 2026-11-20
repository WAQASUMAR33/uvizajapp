"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import { Plus, Trash2, Clock, Copy, Calendar } from "lucide-react";

export interface TimeSlot {
  open: string;
  close: string;
}

export interface DaySchedule {
  closed: boolean;
  slots: TimeSlot[];
}

export type WeeklySchedule = Record<string, DaySchedule>;

export const DAYS_CONFIG = [
  { key: "monday", label: "Monday", labelHr: "Ponedjeljak" },
  { key: "tuesday", label: "Tuesday", labelHr: "Utorak" },
  { key: "wednesday", label: "Wednesday", labelHr: "Srijeda" },
  { key: "thursday", label: "Thursday", labelHr: "Četvrtak" },
  { key: "friday", label: "Friday", labelHr: "Petak" },
  { key: "saturday", label: "Saturday", labelHr: "Subota" },
  { key: "sunday", label: "Sunday", labelHr: "Nedjelja" },
];

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  monday: { closed: false, slots: [{ open: "09:00", close: "22:30" }] },
  tuesday: { closed: false, slots: [{ open: "09:00", close: "22:30" }] },
  wednesday: { closed: false, slots: [{ open: "09:00", close: "22:30" }] },
  thursday: { closed: false, slots: [{ open: "09:00", close: "20:30" }] },
  friday: { closed: false, slots: [{ open: "09:00", close: "22:30" }] },
  saturday: { closed: false, slots: [{ open: "09:00", close: "22:30" }] },
  sunday: { closed: true, slots: [{ open: "09:00", close: "22:30" }] },
};

export function parseOpeningHours(jsonOrStr?: string | null): WeeklySchedule {
  if (!jsonOrStr) return DEFAULT_WEEKLY_SCHEDULE;
  try {
    const parsed = JSON.parse(jsonOrStr);
    if (parsed && typeof parsed === "object") {
      const result: WeeklySchedule = {};
      for (const day of DAYS_CONFIG) {
        if (parsed[day.key]) {
          const item = parsed[day.key];
          result[day.key] = {
            closed: Boolean(item.closed),
            slots: Array.isArray(item.slots) && item.slots.length > 0
              ? item.slots.map((s: any) => ({ open: s.open || "09:00", close: s.close || "22:30" }))
              : [{ open: item.open || "09:00", close: item.close || "22:30" }],
          };
        } else {
          result[day.key] = { ...DEFAULT_WEEKLY_SCHEDULE[day.key] };
        }
      }
      return result;
    }
  } catch (_) {
    // Plain string fallback
  }
  return DEFAULT_WEEKLY_SCHEDULE;
}

export function formatScheduleSummaries(schedule: WeeklySchedule): {
  workingDaysEn: string;
  workingDaysHr: string;
  workingHours: string;
} {
  const openDays = DAYS_CONFIG.filter((d) => !schedule[d.key]?.closed);
  const openKeys = openDays.map((d) => d.key);

  let workingDaysEn = "Every day (Mon - Sun)";
  let workingDaysHr = "Svaki dan (Pon - Ned)";

  if (openKeys.length === 0) {
    workingDaysEn = "Temporarily closed";
    workingDaysHr = "Privremeno zatvoreno";
  } else if (openKeys.length === 5 && openKeys.every((k) => ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(k))) {
    workingDaysEn = "From Monday to Friday";
    workingDaysHr = "Od ponedjeljka do petka";
  } else if (openKeys.length === 6 && openKeys.every((k) => ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].includes(k))) {
    workingDaysEn = "Monday - Saturday";
    workingDaysHr = "Od ponedjeljka do subote";
  } else if (openKeys.length === 6 && openKeys.every((k) => ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(k))) {
    workingDaysEn = "Tuesday - Sunday";
    workingDaysHr = "Od utorka do nedjelje";
  } else if (openKeys.length === 2 && openKeys.includes("saturday") && openKeys.includes("sunday")) {
    workingDaysEn = "Weekends only";
    workingDaysHr = "Samo vikendom";
  } else if (openKeys.length < 7) {
    workingDaysEn = openDays.map((d) => d.label.slice(0, 3)).join(", ");
    workingDaysHr = openDays.map((d) => d.labelHr.slice(0, 3)).join(", ");
  }

  let workingHours = "09:00 - 22:30";
  if (openDays.length > 0) {
    const firstDay = schedule[openDays[0].key];
    if (firstDay && firstDay.slots.length > 0) {
      workingHours = firstDay.slots.map((s) => `${s.open} - ${s.close}`).join(", ");
    }
  }

  return { workingDaysEn, workingDaysHr, workingHours };
}

interface OperatingHoursManagerProps {
  value?: string | null;
  onChange: (data: {
    openingHoursJson: string;
    workingDaysEn: string;
    workingDaysHr: string;
    workingHours: string;
  }) => void;
}

export function OperatingHoursManager({ value, onChange }: OperatingHoursManagerProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => parseOpeningHours(value));

  useEffect(() => {
    if (value) {
      setSchedule(parseOpeningHours(value));
    }
  }, [value]);

  const updateSchedule = (newSchedule: WeeklySchedule) => {
    setSchedule(newSchedule);
    const summaries = formatScheduleSummaries(newSchedule);
    onChange({
      openingHoursJson: JSON.stringify(newSchedule),
      ...summaries,
    });
  };

  const toggleClosed = (dayKey: string, closed: boolean) => {
    const next = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        closed,
      },
    };
    updateSchedule(next);
  };

  const updateSlot = (dayKey: string, slotIndex: number, field: "open" | "close", val: string) => {
    const currentSlots = [...(schedule[dayKey]?.slots || [{ open: "09:00", close: "22:30" }])];
    currentSlots[slotIndex] = {
      ...currentSlots[slotIndex],
      [field]: val,
    };
    const next = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: currentSlots,
      },
    };
    updateSchedule(next);
  };

  const addSlot = (dayKey: string) => {
    const currentSlots = [...(schedule[dayKey]?.slots || [{ open: "09:00", close: "22:30" }])];
    currentSlots.push({ open: "17:00", close: "23:00" });
    const next = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: currentSlots,
      },
    };
    updateSchedule(next);
  };

  const removeSlot = (dayKey: string, slotIndex: number) => {
    const currentSlots = (schedule[dayKey]?.slots || []).filter((_, idx) => idx !== slotIndex);
    if (currentSlots.length === 0) {
      currentSlots.push({ open: "09:00", close: "22:30" });
    }
    const next = {
      ...schedule,
      [dayKey]: {
        ...schedule[dayKey],
        slots: currentSlots,
      },
    };
    updateSchedule(next);
  };

  const copyMondayToAllOpen = () => {
    const mon = schedule.monday;
    if (!mon) return;
    const next: WeeklySchedule = { ...schedule };
    for (const d of DAYS_CONFIG) {
      if (d.key !== "monday" && !next[d.key].closed) {
        next[d.key] = {
          ...next[d.key],
          slots: mon.slots.map((s) => ({ ...s })),
        };
      }
    }
    updateSchedule(next);
  };

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        color: "#0f172a",
        p: { xs: 2, sm: 2.5 },
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Header bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, pb: 1.5, borderBottom: "1px solid", borderColor: "divider", flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: "6px", bgcolor: "rgba(99, 102, 241, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={16} color="#6366f1" />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
              Operating Hours & Weekly Schedule
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.74rem" }}>
              Configure opening and closing times per day of week
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Copy Monday hours to all open days">
          <Chip
            icon={<Copy size={12} color="#475569" />}
            label="Copy Monday to open days"
            size="small"
            clickable
            onClick={copyMondayToAllOpen}
            sx={{
              borderRadius: "6px",
              bgcolor: "#f8fafc",
              color: "#334155",
              border: "1px solid #e2e8f0",
              fontSize: "0.72rem",
              fontWeight: 600,
              "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" },
            }}
          />
        </Tooltip>
      </Box>

      {/* Days List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {DAYS_CONFIG.map((day) => {
          const item = schedule[day.key] || { closed: false, slots: [{ open: "09:00", close: "22:30" }] };
          const isClosed = Boolean(item.closed);

          return (
            <Box
              key={day.key}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 1.5,
                py: 1,
                px: 1.5,
                borderRadius: "6px",
                bgcolor: isClosed ? "#fafafa" : "#ffffff",
                border: "1px solid",
                borderColor: isClosed ? "#f1f5f9" : "#f1f5f9",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: "#e2e8f0",
                  bgcolor: isClosed ? "#f8fafc" : "#fafcff",
                },
              }}
            >
              {/* Left: Day Title + Closed Checkbox */}
              <Box sx={{ minWidth: 130 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: isClosed ? "#64748b" : "#0f172a",
                    fontSize: "0.9rem",
                    mb: 0.25,
                  }}
                >
                  {day.label}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isClosed}
                      onChange={(e) => toggleClosed(day.key, e.target.checked)}
                      size="small"
                      sx={{
                        p: 0.25,
                        color: "#94a3b8",
                        "&.Mui-checked": {
                          color: "#6366f1",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: isClosed ? "#4f46e5" : "#64748b",
                        fontSize: "0.8rem",
                      }}
                    >
                      Closed
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </Box>

              {/* Right: Opens at / Closes at Inputs + Plus button (hidden if Closed) */}
              {!isClosed ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
                  {item.slots.map((slot, sIdx) => (
                    <Box
                      key={sIdx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Opens at */}
                      <TextField
                        label="Opens at"
                        size="small"
                        type="time"
                        value={slot.open || "09:00"}
                        onChange={(e) => updateSlot(day.key, sIdx, "open", e.target.value)}
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#64748b",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              "&.Mui-focused": { color: "#4f46e5" },
                            },
                          },
                          htmlInput: {
                            step: 300,
                            style: {
                              color: "#0f172a",
                              fontWeight: 600,
                              fontSize: "0.92rem",
                              padding: "8.5px 12px",
                            },
                          },
                        }}
                        sx={{
                          width: { xs: "100%", sm: 145 },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                            bgcolor: "#ffffff",
                            "& fieldset": {
                              borderColor: "#cbd5e1",
                            },
                            "&:hover fieldset": {
                              borderColor: "#94a3b8",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#6366f1",
                              borderWidth: "1.5px",
                            },
                          },
                        }}
                      />

                      {/* Closes at */}
                      <TextField
                        label="Closes at"
                        size="small"
                        type="time"
                        value={slot.close || "22:30"}
                        onChange={(e) => updateSlot(day.key, sIdx, "close", e.target.value)}
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                            sx: {
                              color: "#64748b",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                              "&.Mui-focused": { color: "#4f46e5" },
                            },
                          },
                          htmlInput: {
                            step: 300,
                            style: {
                              color: "#0f172a",
                              fontWeight: 600,
                              fontSize: "0.92rem",
                              padding: "8.5px 12px",
                            },
                          },
                        }}
                        sx={{
                          width: { xs: "100%", sm: 145 },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                            bgcolor: "#ffffff",
                            "& fieldset": {
                              borderColor: "#cbd5e1",
                            },
                            "&:hover fieldset": {
                              borderColor: "#94a3b8",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#6366f1",
                              borderWidth: "1.5px",
                            },
                          },
                        }}
                      />

                      {/* Action buttons: + or Trash */}
                      {sIdx === 0 ? (
                        <Tooltip title="Add second shift / extra hours">
                          <IconButton
                            size="small"
                            onClick={() => addSlot(day.key)}
                            sx={{
                              color: "#475569",
                              bgcolor: "#f8fafc",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              p: 0.85,
                              "&:hover": {
                                color: "#0f172a",
                                bgcolor: "#f1f5f9",
                                borderColor: "#94a3b8",
                              },
                            }}
                          >
                            <Plus size={16} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Remove time slot">
                          <IconButton
                            size="small"
                            onClick={() => removeSlot(day.key, sIdx)}
                            sx={{
                              color: "#ef4444",
                              bgcolor: "#fef2f2",
                              border: "1px solid #fecaca",
                              borderRadius: "6px",
                              p: 0.85,
                              "&:hover": {
                                color: "#dc2626",
                                bgcolor: "#fee2e2",
                              },
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <Chip
                    label="Closed all day"
                    size="small"
                    sx={{
                      bgcolor: "#fef2f2",
                      color: "#b91c1c",
                      border: "1px solid #fee2e2",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      borderRadius: "6px",
                      height: 24,
                    }}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
