// Next 16.4 export on Windows writes prefetch segments as nested folders (__next.a/b/__PAGE__.txt)
// while the browser requests dotted names (__next.a.b.__PAGE__.txt). Copies them to the requested names.
// shortcut: works around that path-separator mismatch, no-op on Linux, drop once Next fixes it upstream.
import fs from "node:fs";
import path from "node:path";

let copied = 0;

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (!entry.name.startsWith("__next.")) { walk(full); continue; }
    for (const file of files(full)) {
      const flat = path.relative(dir, file).split(path.sep).join(".");
      fs.copyFileSync(file, path.join(dir, flat));
      copied++;
    }
  }
}

walk("out");
console.log(`flatten-segments: ${copied} files`);
