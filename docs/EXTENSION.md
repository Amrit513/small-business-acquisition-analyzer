# Acquisition Lens extension

Desktop developer preview for Chrome and Edge. No store submission or developer fee is required to load this local preview. The package is not a Chrome Web Store listing.

## Install

1. Extract the ZIP into a folder on your computer.
2. Open Chrome's Extensions page, or Edge's Manage extensions page.
3. Turn on Developer mode.
4. Select Load unpacked and choose the folder containing manifest.json.
5. Open a business listing and click the Acquisition Lens toolbar icon.

## Use

Choose Capture this listing. A text selection takes priority; otherwise capture reads a nonempty main region, or a single article when there is no main region. Pages with several article cards and no main region require you to select one listing first. Review the amounts, edit anything that needs correcting, and leave unknown figures blank. Annual USD amounts only. Ranges, monthly amounts, foreign currency and conflicting values need manual review. Cash flow is only treated as SDE when explicitly labeled SDE.

Save draft stores a single draft in this browser. Clear deletes it. Export listing downloads JSON you can later import through Import listing on the website. Review in full analyzer opens https://acquisition-lens.vercel.app with a compact fragment handoff. The analyzer removes the fragment from the current history entry and requires a review before applying it. Fragments are not HTTP query parameters, but the destination page and browser can read them; only use this with listing information you intend to bring into Acquisition Lens.

The redesigned workspace starts a new deal with unknown assumptions blank. Confirm the annual reporting period, assumptions and financing before preparing the memo. Review asks for confirmation before replacing an unsaved deal.

## Privacy and permissions

- activeTab: temporary access to the page selected by your toolbar click.
- scripting: reads the current text selection or visible main listing content when Capture is clicked.
- storage: saves a draft locally, only after Save draft.
- No broad host permissions, automatic content scripts, browsing history, cookies, account login or background network requests.
- Extracted numbers, the source URL without query parameters, capture time and short evidence excerpts are retained. Full page text is not saved.
- No AI service or API key is used by this extension.

Some websites, browser pages, PDF viewers and protected documents cannot be captured. Paste text into the web importer instead. A page is not authenticated evidence, and extraction is not a substitute for reviewing source documents. Local drafts do not synchronize between devices.

## Build and validation

From the repository root, run `npm ci`, `npm run build:extension`, `npm test` and `npm run typecheck`. Build output is in `dist/extension`; the ZIP is in `public/downloads`. `npm run build` creates the extension package before building Next.js. The extractor and screening functions are shared by the web and extension bundles.

The extension uses Manifest V3 and temporary activeTab permissions, following [Chrome's permission guidance](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab). Installation of the web app uses the [Next.js manifest convention](https://nextjs.org/docs/app/guides/progressive-web-apps).
