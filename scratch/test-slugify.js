function slugifyPath(path) {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) =>
      segment
        .toLowerCase()
        .replace(/[äöüÄÖÜß]/g, (c) =>
          (({ ä: "ae", ö: "oe", ü: "ue", Ä: "ae", Ö: "oe", Ü: "ue", ß: "ss" })[c] ?? c)
        )
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .join("/");
}

console.log("Original: 11. History & Context/openai-gpt5");
console.log("Slugified: " + slugifyPath("11. History & Context/openai-gpt5"));

function slugifyPathNoAnd(path) {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) =>
      segment
        .toLowerCase()
        .replace(/[äöüÄÖÜß]/g, (c) =>
          (({ ä: "ae", ö: "oe", ü: "ue", Ä: "ae", Ö: "oe", Ü: "ue", ß: "ss" })[c] ?? c)
        )
        // .replace(/&/g, "and") // REMOVED
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .join("/");
}

console.log("NoAnd Slugified: " + slugifyPathNoAnd("11. History & Context/openai-gpt5"));
