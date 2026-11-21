import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = join(root, "public/audio/moog-filters");
const published = join(root, "dist/audio/moog-filters");

async function compareTree(from, to) {
  const entries = await readdir(from, { withFileTypes: true });
  assert.deepEqual((await readdir(to)).sort(), entries.map((entry) => entry.name).sort());
  for (const entry of entries) {
    const a = join(from, entry.name);
    const b = join(to, entry.name);
    if (entry.isDirectory()) await compareTree(a, b);
    else assert.deepEqual(await readFile(b), await readFile(a), `${b} differs from matching source asset`);
  }
}

await compareTree(source, published);
assert.deepEqual((await readdir(published, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name), ["huovilainen"]);
console.log("Production filter assets include only the retained filter, exact matching source/build files, and complete notices.");
