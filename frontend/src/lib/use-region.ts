import { useCallback, useEffect, useState } from "react";

// The selected region lives on the device. Default is Chennai.
export const DEFAULT_REGION = "Chennai";
const KEY = "jobradar:region";
const EVENT = "jobradar:region-change";

function read(): string {
  try {
    return window.localStorage.getItem(KEY) || DEFAULT_REGION;
  } catch {
    return DEFAULT_REGION;
  }
}

/** Map legacy/alias labels used across the UI to the API's region ids. */
export function regionId(input: string | undefined | null): string {
  const t = (input ?? "").trim();
  if (!t) return DEFAULT_REGION;
  const l = t.toLowerCase();
  if (l === "all" || l === "global" || l.startsWith("global (")) return "Global";
  if (l === "all india" || l === "india (all)" || l === "india") return "India";
  if (l === "delhi-ncr" || l.startsWith("delhi ncr") || l === "gurgaon / delhi ncr") return "Delhi NCR";
  if (l === "remote (india)") return "Remote India";
  return t;
}

export function useRegion() {
  const [region, setRegionState] = useState<string>(DEFAULT_REGION);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRegionState(read());
    setReady(true);
    const sync = () => setRegionState(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setRegion = useCallback((next: string) => {
    const id = regionId(next);
    try {
      window.localStorage.setItem(KEY, id);
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { region, setRegion, ready };
}
