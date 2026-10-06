// Hands the browser a generated file to save. Browser only: it needs the
// DOM, so it stays out of the pure modules node --test covers.

/** The CSV media type every tool download uses unless it says otherwise. */
export const CSV_TYPE = "text/csv;charset=utf-8";

/** Saves `text` as a file called `name`, of media type `type`. */
export function download(name, text, type = CSV_TYPE) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoked later: some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
