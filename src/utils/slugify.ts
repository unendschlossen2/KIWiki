export function slugifyCategory(cat: string): string {
  return cat
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(
      /[äöüÄÖÜß]/g,
      (c: string) =>
        (
          ({
            ä: "ae",
            ö: "oe",
            ü: "ue",
            Ä: "Ae",
            Ö: "Oe",
            Ü: "Ue",
            ß: "ss",
          }) as Record<string, string>
        )[c] ?? c,
    );
}
