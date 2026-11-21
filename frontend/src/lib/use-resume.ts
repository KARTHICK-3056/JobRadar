import { useCallback, useEffect, useState } from "react";
import type { Profile } from "./api";

// Only the extracted skills are kept, on this device. The resume file itself is never stored.
const KEY = "jobradar:resume";
const EVENT = "jobradar:resume-change";

export interface ResumeProfile extends Profile {
  filename?: string;
  years_experience?: number | null;
}

function read(): ResumeProfile | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    return v && Array.isArray(v.skills) ? v : null;
  } catch {
    return null;
  }
}

function write(p: ResumeProfile | null) {
  try {
    if (p && p.skills.length) window.localStorage.setItem(KEY, JSON.stringify(p));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useResume() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);

  useEffect(() => {
    setProfile(read());
    const sync = () => setProfile(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const set = useCallback((p: ResumeProfile | null) => write(p), []);
  const removeSkill = useCallback((s: string) => {
    const cur = read();
    if (!cur) return;
    write({ ...cur, skills: cur.skills.filter((x) => x !== s) });
  }, []);
  const addSkill = useCallback((s: string) => {
    const v = s.trim();
    if (!v) return;
    const cur = read() ?? { skills: [] };
    if (cur.skills.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    write({ ...cur, skills: [...cur.skills, v] });
  }, []);

  return { profile: profile?.skills.length ? profile : null, set, removeSkill, addSkill, clear: () => write(null) };
}
