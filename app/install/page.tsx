import type { Metadata } from "next";
import { InstallApp } from "@/components/InstallApp";

export const metadata: Metadata = { title: "Install Acquisition Lens" };
export default function InstallPage() {
  return <main className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
    <a href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800 underline">Back to analyzer</a>
    <h1 className="mt-8 text-4xl font-semibold tracking-tight">Your deal workspace, within reach.</h1>
    <p className="mt-4 text-lg leading-8 text-slate-600">Use Acquisition Lens on your phone or capture listing figures as you browse on your computer.</p>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="mb-5 text-2xl font-semibold">Add the app to your home screen</h2><InstallApp /></section>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-2xl font-semibold">Chrome & Edge extension</h2><p className="mt-3 text-base leading-7 text-slate-600">Capture a listing you choose, correct the extracted amounts, see basic earnings ratios, and send the reviewed figures to the analyzer. Capture, draft storage, and export work locally.</p><a href="/downloads/acquisition-lens-extension.zip" download className="mt-5 inline-block rounded-xl bg-[#0a5c4f] px-5 py-3 font-semibold text-white">Download extension</a><p className="mt-3 text-sm text-slate-500">Desktop developer preview. It has not been published to the Chrome Web Store.</p><ol className="mt-5 list-decimal space-y-3 pl-5 text-base leading-7 text-slate-700"><li>Download and extract the ZIP on your computer.</li><li>Open Chrome's Extensions page and switch on Developer mode. In Edge, use Manage extensions.</li><li>Choose Load unpacked and select the extracted folder containing manifest.json.</li><li>Open a business listing, click the Acquisition Lens icon, and choose Capture this listing.</li></ol><p className="mt-5 text-sm leading-6 text-slate-500">The extension reads the selected page only after your click. It has no access to browsing history, cookies or passwords. It does not run AI calls. Some pages and PDF viewers cannot be captured; paste listing text into the website instead.</p></section>
  </main>;
}
