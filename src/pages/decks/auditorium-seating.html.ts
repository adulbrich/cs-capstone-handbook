// Serves the auditorium seating map, decks/auditorium-seating.html, at
// /decks/auditorium-seating.html, so the fall week 1 deck can show it live
// in a <FrameSlide> with `?slide`. The file at the repository root stays the
// one copy: it still opens straight from disk, and an edit there reaches
// the deck at the next build. Like every page under /decks/, it is served
// noindex while no handbook page links it.
import seating from "../../../decks/auditorium-seating.html?raw";

const NOINDEX = '<head>\n    <meta name="robots" content="noindex">';

export function GET() {
  if (!seating.includes("<head>")) {
    throw new Error(
      "decks/auditorium-seating.html: no <head> to mark noindex."
    );
  }
  return new Response(seating.replace("<head>", NOINDEX), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
