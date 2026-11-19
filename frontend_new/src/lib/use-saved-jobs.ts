import { useCallback, useEffect, useState } from "react";

const KEY = "jobsite:saved";
const EVENT = "jobsite:saved-change";

function read(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useSavedJobs() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setSaved(read());
    const sync = () => setSaved(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    return next.includes(id);
  }, []);

  return { saved, isSaved: (id: string) => saved.includes(id), toggle };
}
