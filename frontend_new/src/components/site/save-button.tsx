import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSavedJobs } from "@/lib/use-saved-jobs";

export function SaveButton({ jobId, title, className }: { jobId: string; title: string; className?: string }) {
  const { isSaved, toggle } = useSavedJobs();
  const saved = isSaved(jobId);
  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${title} from saved jobs` : `Save ${title}`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowSaved = toggle(jobId);
        toast(nowSaved ? "Saved to your list" : "Removed from saved", { description: title });
      }}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        saved && "border-highlight bg-highlight text-highlight-foreground hover:border-highlight hover:text-highlight-foreground",
        className,
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}
