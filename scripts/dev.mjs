import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const args = process.argv.slice(2).filter(arg => arg !== "--strictPort").map(arg => arg === "--host" ? "--hostname" : arg);
const proc = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", ...args], {stdio: "inherit", env: {...process.env, NEXT_TELEMETRY_DISABLED: "1"}});
for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => proc.kill(sig));
proc.on("exit", code => process.exit(code ?? 1));
