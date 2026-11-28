export type InstallDisplayEnvironment = {
  matchMedia(query: string): { matches: boolean };
  navigator: Navigator & { standalone?: boolean };
};

/**
 * iOS exposes installed web-app state through navigator.standalone rather than
 * the standard display-mode media query used by Chromium and other browsers.
 */
export function isInstalledDisplay(environment: InstallDisplayEnvironment): boolean {
  return environment.matchMedia("(display-mode: standalone)").matches
    || environment.navigator.standalone === true;
}
