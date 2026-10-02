// ═══════════════════════════════════════════════════
// 🌐 Universal English Fallback for 404 Pages
// ═══════════════════════════════════════════════════
// A 404 can be reached by any visitor from any country.
// English is the safest universal secondary language
// when we cannot know the user's preferred language.

export const ENGLISH_FALLBACK = {
  title: "Page Not Found",
  description:
    "The link you're looking for may be broken or the page has been removed. Don't worry — you can go back or return to the homepage.",
  backButton: "Go Back",
  homeButton: "Return Home",
  label: "English",
} as const;