// Resume <-> job matching. Weighted skill overlap (title skills count double) plus small boosts.

const norm = (s) => String(s).toLowerCase();

/**
 * profile: { skills: string[], seniority?: "Junior"|"Mid"|"Senior"|"Lead", wantsInternship?: boolean }
 * job:     { skills: string[], title_skills?: string[], seniority, job_type }
 * returns  { match_score: 0..100, matched_skills: string[] }
 */
export function scoreJob(profile, job) {
  const mine = new Set((profile?.skills ?? []).map(norm));
  const jobSkills = job.skills ?? [];
  if (!mine.size) return { match_score: 0, matched_skills: [] };
  const titleSet = new Set((job.title_skills ?? []).map(norm));

  let total = 0;
  let got = 0;
  const matched = [];
  for (const s of jobSkills) {
    const w = titleSet.has(norm(s)) ? 2 : 1;
    total += w;
    if (mine.has(norm(s))) {
      got += w;
      matched.push(s);
    }
  }
  // Coverage of what the job asks for (weighted, title skills x2), discounted when the job lists very few
  // skills (one overlap with a 1-skill posting is weak evidence), plus how much of the resume is used.
  const coverage = total ? got / total : 0;
  const confidence = Math.min(jobSkills.length, 3) / 3;
  const breadth = Math.min(matched.length, 5) / Math.min(Math.max(mine.size, 1), 5);
  let score = total ? 55 * coverage * confidence + 30 * breadth : 0;

  if (profile.seniority && job.seniority) {
    if (profile.seniority === job.seniority) score += 8;
    else if (rank(profile.seniority) + 1 < rank(job.seniority)) score -= 8; // clearly over-levelled
  }
  if (profile.wantsInternship) {
    if (job.job_type === "Internship") score += 7;
    else if (job.seniority === "Senior" || job.seniority === "Lead") score -= 6;
  }
  return { match_score: Math.max(0, Math.min(100, Math.round(score))), matched_skills: matched };
}

function rank(s) {
  return { Junior: 0, Mid: 1, Senior: 2, Lead: 3 }[s] ?? 1;
}
