// Full-page screenshots via Chrome DevTools Protocol (no npm deps; Node 22+ global WebSocket).
// Usage: node tools/shoot.mjs [baseURL]   (serve the folder first: python3 -m http.server 8250)
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "shots"); mkdirSync(OUT, { recursive: true });
const BASE = process.argv[2] || "http://localhost:8250/";
const CH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const chrome = spawn(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-prefers-reduced-motion",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "ags-"))}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

async function connect() {
  for (let t = 0; t < 50; t++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find(p => p.type === "page");
      ws = new WebSocket(page.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener("open", r));
      ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
      return;
    } catch { await sleep(200); }
  }
  throw new Error("chrome did not start");
}

async function shot(name, width, height, mobile, theme) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Page.navigate", { url: `${BASE}?theme=${theme}` });
  await sleep(2500);
  // scroll through so lazy images load, then back to top
  await send("Runtime.evaluate", { expression: `(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}scrollTo(0,0);})()`, awaitPromise: true });
  await sleep(1500);
  const fold = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, `${name}-fold.png`), Buffer.from(fold.data, "base64"));
  const { cssContentSize } = await send("Page.getLayoutMetrics");
  const h = Math.ceil(cssContentSize.height);
  await send("Emulation.setDeviceMetricsOverride", { width, height: h, deviceScaleFactor: 1, mobile });
  await sleep(1200);
  const full = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: h, scale: 1 } });
  writeFileSync(join(OUT, `${name}-full.png`), Buffer.from(full.data, "base64"));
  console.log(name, width + "x" + h);
}

await connect();
await send("Page.enable");
for (const theme of ["light", "dark"]) {
  await shot(`desktop-${theme}`, 1440, 900, false, theme);
  await shot(`phone-${theme}`, 390, 844, true, theme);
}
ws.close(); chrome.kill();
