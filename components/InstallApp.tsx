"use client";
import { useEffect, useState } from "react";
import { isInstalledDisplay } from "@/lib/install/displayMode";

type InstallPrompt = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt>();
  const [installed, setInstalled] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const detectInstalled = () => setInstalled(isInstalledDisplay(window));
    detectInstalled();
    const ready = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const done = () => { setInstalled(true); setPrompt(undefined); };
    displayMode.addEventListener("change", detectInstalled);
    window.addEventListener("beforeinstallprompt", ready); window.addEventListener("appinstalled", done);
    return () => {
      displayMode.removeEventListener("change", detectInstalled);
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  async function install() {
    if (!prompt) return;
    try { await prompt.prompt(); const choice = await prompt.userChoice; setNotice(choice.outcome === "accepted" ? "Installation started." : "You can install later from your browser menu."); setPrompt(undefined); }
    catch { setNotice("Use your browser's install or Add to Home Screen option."); }
  }
  return <div className="space-y-4">
    {installed ? <p className="font-semibold text-emerald-800">You are using the installed app.</p> : <>
      {prompt && <button className="rounded-xl bg-[#0a5c4f] px-5 py-3 font-semibold text-white" onClick={() => void install()}>Install Acquisition Lens</button>}
      <p className="text-base leading-7 text-slate-600"><strong className="text-slate-900">iPhone or iPad:</strong> open the analyzer in Safari, tap Share, then Add to Home Screen. Enable Open as Web App if offered.</p>
      <p className="text-base leading-7 text-slate-600"><strong className="text-slate-900">Android or desktop:</strong> use Install app or Add to Home Screen in your browser menu.</p>
    </>}
    {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
    <p className="text-sm leading-6 text-slate-500">This installs the web app. An internet connection is needed to open it. Saved deals stay on the device and browser where they were created; use JSON export to move them.</p>
  </div>;
}
