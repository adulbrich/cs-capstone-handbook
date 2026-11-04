// Fits a live sheet to its page: the largest of FIT_SCALES at which the
// laid-out sheet (`.ds-page`) does not run past its height. Reading the
// layout needs the DOM, so it lives beside the components; the choice of
// scale is firstFit in defense-sheets.mjs. The tool runs it on its hidden
// measuring copy, and the example page on its one sheet.
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
