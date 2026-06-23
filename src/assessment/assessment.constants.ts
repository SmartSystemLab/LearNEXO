// Catalog of subjects supported by the Assessment hierarchy.
// `name` is the canonical Subject.name slug (also used as the URL slug);
// `code` is used to find/rename legacy Subject docs during seeding.
export const SUBJECT_CATALOG = [
  { name: "english", code: "ENG", label: "English Language", description: "English Language" },
  { name: "mathematics", code: "MAT", label: "Mathematics", description: "Mathematics" },
  { name: "civic-education", code: "CVE", label: "Civic Education", description: "Civic Education" },
  { name: "economics", code: "ECO", label: "Economics", description: "Economics" },
  { name: "basic-science-and-technology", code: "BST", label: "Basic Science and Technology", description: "Basic Science and Technology" },
] as const;

export const normalizeClass = (input: string): string =>
  input.toLowerCase().replace(/\s+/g, "").trim();
