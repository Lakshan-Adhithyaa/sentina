#!/usr/bin/env node

import { spawn, exec } from "child_process";
import http from "http";

const COMPONENT_NAMES = ["UserCard", "PricingCard", "NotificationBanner", "DataTable"];
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// ── Parse CLI args ──────────────────────────────────────────────────────
const rawName = process.argv[2];

if (!rawName) {
  console.error("\n  \x1b[31mError:\x1b[0m No component name provided.\n");
  printUsage();
  process.exit(1);
}

// Case-insensitive match
const match = COMPONENT_NAMES.find(
  (c) => c.toLowerCase() === rawName.toLowerCase()
);

if (!match) {
  console.error(
    `\n  \x1b[31mError:\x1b[0m Unknown component "\x1b[33m${rawName}\x1b[0m".\n`
  );
  printUsage();
  process.exit(1);
}

const targetUrl = `${BASE_URL}?component=${match}&autorun=true`;

console.log(`\n  \x1b[36mSentina\x1b[0m  UI Integrity Simulator`);
console.log(`  Component: \x1b[33m${match}\x1b[0m`);
console.log(`  Mode:      \x1b[32mautorun\x1b[0m (generate + enable all toggles)\n`);

// ── Check if server is already running ──────────────────────────────────
checkServer()
  .then((isRunning) => {
    if (isRunning) {
      console.log(`  Dev server already running on port ${PORT}.`);
      openBrowser(targetUrl);
    } else {
      startDevServer(targetUrl);
    }
  })
  .catch(() => {
    startDevServer(targetUrl);
  });

// ── Helpers ─────────────────────────────────────────────────────────────

function printUsage() {
  console.log("  \x1b[1mUsage:\x1b[0m  npm run sentina -- <component_name>\n");
  console.log("  \x1b[1mAvailable components:\x1b[0m");
  for (const name of COMPONENT_NAMES) {
    console.log(`    - ${name}`);
  }
  console.log("");
}

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(BASE_URL, (res) => {
      res.resume();
      resolve(res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startDevServer(url) {
  console.log("  Starting Next.js dev server...\n");

  const child = spawn("npx", ["next", "dev", "--turbo", "-p", String(PORT)], {
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
    cwd: process.cwd(),
  });

  let opened = false;

  child.stdout.on("data", (data) => {
    process.stdout.write(data);
    if (!opened && data.toString().includes("Ready")) {
      opened = true;
      // Small delay to ensure the server is fully ready
      setTimeout(() => openBrowser(url), 1000);
    }
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });

  // Forward SIGINT/SIGTERM to child
  process.on("SIGINT", () => {
    child.kill("SIGINT");
  });
  process.on("SIGTERM", () => {
    child.kill("SIGTERM");
  });

  // Fallback: poll until server is ready
  const pollInterval = setInterval(() => {
    if (opened) {
      clearInterval(pollInterval);
      return;
    }
    checkServer().then((isRunning) => {
      if (isRunning && !opened) {
        opened = true;
        clearInterval(pollInterval);
        openBrowser(url);
      }
    });
  }, 2000);
}

function openBrowser(url) {
  console.log(`\n  Opening: \x1b[4m${url}\x1b[0m\n`);

  const platform = process.platform;
  let cmd;

  if (platform === "darwin") {
    cmd = `open "${url}"`;
  } else if (platform === "win32") {
    cmd = `start "" "${url}"`;
  } else {
    // Linux / WSL
    cmd = `xdg-open "${url}" 2>/dev/null || wslview "${url}" 2>/dev/null || echo "  Please open ${url} in your browser."`;
  }

  exec(cmd, (err) => {
    if (err) {
      console.log(`  Could not open browser automatically.`);
      console.log(`  Please open: \x1b[4m${url}\x1b[0m\n`);
    }
  });
}
