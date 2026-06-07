"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { Save, FileText } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header", "bold", "italic", "underline", "strike",
  "list", "indent", "link",
];

export default function TermsPage() {
  const [content, setContent]     = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/terms")
      .then((r) => r.json())
      .then((data) => {
        setContent(data.content ?? "");
        setUpdatedAt(data.updatedAt ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const res  = await fetch("/api/terms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Save failed");
    } else {
      setUpdatedAt(data.updatedAt);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: "10px",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FileText size={20} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Terms & Conditions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {updatedAt
                ? `Last updated ${new Date(updatedAt).toLocaleString()}`
                : "Not published yet"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {saved && (
            <Chip label="Saved!" size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 600 }} />
          )}
          <Button
            variant="contained"
            startIcon={<Save size={16} />}
            onClick={handleSave}
            disabled={saving || loading}
            sx={{
              textTransform: "none", fontWeight: 600, borderRadius: 2,
              bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" },
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Paper variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2, borderColor: "#fca5a5", bgcolor: "#fef2f2" }}>
          <Typography variant="body2" color="error">{error}</Typography>
        </Paper>
      )}

      {/* Editor */}
      <Paper variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ py: 10, textAlign: "center", color: "text.secondary" }}>Loading…</Box>
        ) : (
          <Box sx={{
            ".ql-toolbar": {
              borderTop: "none", borderLeft: "none", borderRight: "none",
              borderBottom: "1px solid", borderColor: "divider",
              bgcolor: "#f8fafc",
            },
            ".ql-container": {
              border: "none",
              fontSize: "0.9375rem",
              fontFamily: "inherit",
              minHeight: 480,
            },
            ".ql-editor": { minHeight: 480, p: 3, lineHeight: 1.75 },
            "&:focus-within .ql-toolbar": { borderColor: "#4f46e5" },
          }}>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              placeholder="Write your Terms & Conditions here…"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
