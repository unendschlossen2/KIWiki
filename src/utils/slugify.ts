export function slugifyCategory(cat: string): string {
  return cat
    .toLowerCase()
    .replace(/[äöüÄÖÜß]/g, (c: string) =>
      (({ ä: "ae", ö: "oe", ü: "ue", Ä: "ae", Ö: "oe", Ü: "ue", ß: "ss" }) as Record<string, string>)[c] ?? c
    )
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyTag(tag: string): string {
  return slugifyCategory(tag);
}
