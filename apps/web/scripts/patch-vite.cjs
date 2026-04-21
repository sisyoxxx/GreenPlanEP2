/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

function findViteChunksDir() {
  try {
    const vitePkgJson = require.resolve("vite/package.json");
    const viteRoot = path.dirname(vitePkgJson);
    return path.join(viteRoot, "dist", "node", "chunks");
  } catch {
    return null;
  }
}

function patchFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");

  if (src.includes('try {\n  exec("net use",')) {
    return false;
  }

  const needle = 'exec("net use", (error, stdout) => {';
  const start = src.indexOf(needle);
  if (start === -1) return false;

  const end = src.indexOf("});", start);
  if (end === -1) return false;

  const before = src.slice(0, start);
  const call = src.slice(start, end + 3);
  const after = src.slice(end + 3);

  const patched =
    before +
    "try {\n  " +
    call +
    "\n} catch (e) {\n  // In some sandboxed / restricted Windows environments, running `net use` can throw EPERM.\n  // Ignore and keep using the native realpath implementation.\n}\n" +
    after;

  fs.writeFileSync(filePath, patched, "utf8");
  return true;
}

function main() {
  const chunksDir = findViteChunksDir();
  if (!chunksDir || !fs.existsSync(chunksDir)) {
    console.log("[patch-vite] vite chunks dir not found, skipping");
    return;
  }

  const files = fs
    .readdirSync(chunksDir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => path.join(chunksDir, name));

  let patchedAny = false;
  for (const filePath of files) {
    try {
      if (patchFile(filePath)) {
        console.log("[patch-vite] patched:", path.relative(process.cwd(), filePath));
        patchedAny = true;
      }
    } catch {
      // ignore
    }
  }

  if (!patchedAny) {
    console.log("[patch-vite] no matching chunk found, skipping");
  }
}

main();

