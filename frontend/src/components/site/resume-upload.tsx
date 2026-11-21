import { useRef, useState } from "react";
import { FileText, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { ApiError, uploadResume } from "@/lib/api";
import { useResume } from "@/lib/use-resume";
import { cn } from "@/lib/utils";

/** "Upload resume" pill + editable skill chips. Only the extracted skills are kept, on this device. */
export function ResumeUpload({ className, align = "center" }: { className?: string; align?: "center" | "start" }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const { profile, set, removeSkill, addSkill, clear } = useResume();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("That file is larger than 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const r = await uploadResume(file);
      set({ skills: r.skills, seniority: r.seniority, wants_internship: r.wants_internship, years_experience: r.years_experience, filename: file.name });
      toast.success(`Found ${r.skills.length} skills in your resume`, { description: "Sorting by best match. Your file was not stored." });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const pill = "rounded-full border px-3 py-1 text-xs font-medium transition-all";

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm", align === "center" ? "justify-center" : "justify-start", className)}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
        aria-label="Upload resume (PDF, DOCX or TXT, max 5 MB)"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={cn(pill, "inline-flex items-center gap-1.5 border-border bg-card text-foreground hover:border-foreground/30 disabled:opacity-60")}
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
        {busy ? "Reading resume..." : profile ? "Replace resume" : "Upload resume"}
      </button>
      {!profile && <span className="text-xs text-muted-foreground">PDF, DOCX or TXT · matched on your skills, never stored</span>}
      {profile && (
        <>
          <span className="text-xs text-muted-foreground">Your skills:</span>
          {profile.skills.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-highlight py-0.5 pl-2.5 pr-1 text-xs font-medium text-highlight-foreground">
              {s}
              <button type="button" onClick={() => removeSkill(s)} aria-label={`Remove ${s}`} className="rounded-full p-0.5 hover:bg-highlight-foreground/10">
                <X className="size-3" />
              </button>
            </span>
          ))}
          {adding ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSkill(draft);
                setDraft("");
                setAdding(false);
              }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => setAdding(false)}
                placeholder="Add a skill"
                className={cn(pill, "w-28 border-border bg-card text-foreground outline-none")}
              />
            </form>
          ) : (
            <button type="button" onClick={() => setAdding(true)} className={cn(pill, "inline-flex items-center gap-1 border-border bg-card text-muted-foreground hover:text-foreground")}>
              <Plus className="size-3" /> Add
            </button>
          )}
          <button type="button" onClick={clear} className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Clear
          </button>
        </>
      )}
    </div>
  );
}
