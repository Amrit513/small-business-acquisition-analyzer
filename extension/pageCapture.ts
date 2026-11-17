// Chrome serializes this function into the active tab. Keep it self-contained and
// return only a small, user-triggered excerpt; never retain the whole page.
export function readListingPage() {
  const page = { title: document.title, url: location.href, text: "", ambiguousArticles: false };
  if (document.activeElement?.closest("input, textarea, [contenteditable], [role=textbox]")) return page;

  const selection = window.getSelection()?.toString().trim();
  const main = Array.from(document.querySelectorAll<HTMLElement>("main, [role=main]"))
    .find(element => element.innerText?.trim())?.innerText;
  const articles = document.querySelectorAll<HTMLElement>("article");
  page.ambiguousArticles = !selection && !main && articles.length > 1;
  page.text = (selection || main || (articles.length === 1 ? articles[0]?.innerText : "") || "").slice(0, 60001);
  return page;
}
