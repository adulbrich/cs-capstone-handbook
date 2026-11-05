// Fits a live sheet to its page: the largest of FIT_SCALES at which the
// laid-out sheet (`.ds-page`) does not run past its height. Reading the
// layout needs the DOM, so it lives beside the components; the choice of
// scale is firstFit in defense-sheets.mjs. Each sheet is fitted on its own,
// since a long name or team name can take a second line of the header: the
// example page fits its one sheet, the tool its preview as it changes and
// every printed sheet when Print is pressed.
import { FIT_SCALES, firstFit } from "../../../lib/tools/defense-sheets.mjs";

/**
 * The scale that fits `page`, or null when none does. Leaves `--ds-scale`
 * on `page` set to that scale, or to the smallest when none fits.
 */
export function fitPage(page) {
  const fits = firstFit((scale) => {
    page.style.setProperty("--ds-scale", String(scale));
    return page.scrollHeight <= page.clientHeight;
  });
  page.style.setProperty("--ds-scale", String(fits ?? FIT_SCALES.at(-1)));
  return fits;
}

/**
 * Fits a live sheet as fitPage does, and lets one that fits at no scale run
 * onto a second page (`ds-overflow`). The class comes off before measuring,
 * since a sheet carrying it has no fixed height and so fits at any scale.
 * Returns the scale, or null.
 */
export function fitSheet(page) {
  page.classList.remove("ds-overflow");
  const fits = fitPage(page);
  if (fits === null) {
    page.classList.add("ds-overflow");
  }
  return fits;
}
