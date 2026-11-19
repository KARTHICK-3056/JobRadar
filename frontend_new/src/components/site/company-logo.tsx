import { cn } from "@/lib/utils";
import type { Company } from "@/lib/jobs";

const toneClass: Record<Company["tone"], string> = {
  1: "bg-tone-1",
  2: "bg-tone-2",
  3: "bg-tone-3",
  4: "bg-tone-4",
  5: "bg-tone-5",
  6: "bg-tone-6",
};

export function CompanyLogo({ company, size = "md" }: { company: Company; size?: "sm" | "md" | "lg" }) {
  const initials = company.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-display text-tone-ink",
        toneClass[company.tone],
        size === "sm" && "size-9 text-base",
        size === "md" && "size-12 text-xl",
        size === "lg" && "size-16 text-3xl rounded-2xl",
      )}
    >
      {initials}
    </div>
  );
}
