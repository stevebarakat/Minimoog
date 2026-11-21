import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { filterDirectory, readFilterBinary, renderScenario, scenarios } from "./filter-test-helpers.mjs";

const binary = await readFilterBinary();
const fixture = JSON.parse(await readFile(new URL("./fixtures/filter-audio-baseline.json", import.meta.url), "utf8"));

test("the released source, binary, and build script match their checksums", async () => {
  const manifest = await readFile(join(filterDirectory, "SHA256SUMS"), "utf8");
  const lines = manifest.trim().split("\n");
  assert.equal(lines.length, 3);
  for (const line of lines) {
    const [, expected, file] = line.match(/^([a-f0-9]{64})  ([\w.]+)$/) ?? [];
    assert.ok(file, `Invalid checksum line: ${line}`);
    const actual = createHash("sha256").update(await readFile(join(filterDirectory, file))).digest("hex");
    assert.equal(actual, expected, `${file}: rebuild the filter and manifest together`);
  }
});

test("the binary imports the memory and math interface provided by the worklet", () => {
  const module = new WebAssembly.Module(binary);
  assert.deepEqual(WebAssembly.Module.imports(module).map(({ module, name, kind }) => [module, name, kind]).sort(), [
    ["env", "memory", "memory"],
    ["env", "__memory_base", "global"],
    ["env", "fmin", "function"],
    ["env", "exp", "function"],
    ["env", "tanh", "function"],
  ].sort());
});

for (const scenario of scenarios) {
  test(`deployed audio regression: ${scenario.name}`, async () => {
    const actual = await renderScenario(binary, scenario);
    const expected = fixture.scenarios[scenario.name];
    assert.ok(expected, `Missing deployed baseline for ${scenario.name}`);
    const close = (a, b) => assert.ok(Math.abs(a - b) <= 0.000002 * Math.max(1, Math.abs(b)), `${a} differs from baseline ${b}`);
    assert.equal(actual.samples.length, expected.samples.length);
    actual.samples.forEach((value, i) => close(value, expected.samples[i]));
    close(actual.peak, expected.peak);
    close(actual.rms, expected.rms);
  });
}

for (const filename of ["huovilainen-worklet-processor.js", "huovilainen-worklet-processor-optimized.js"]) {
  test(`actual AudioWorklet initializes and filters audio: ${filename}`, async () => {
    let Processor;
    const messages = [];
    class AudioWorkletProcessor {
      constructor() { this.port = { postMessage: (data) => messages.push(data) }; }
    }
    const context = vm.createContext({
      AudioWorkletProcessor, WebAssembly, ArrayBuffer, Float32Array, console,
      registerProcessor: (_name, cls) => { Processor = cls; },
    });
    vm.runInContext(await readFile(join(filterDirectory, filename), "utf8"), context);
    const processor = new Processor();
    processor.port.onmessage({ data: binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength) });
    // The worklet's public message handler initializes WASM asynchronously.
    for (let i = 0; i < 100 && !processor.filter; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    assert.equal(typeof processor.filter, "function", JSON.stringify(messages));
    assert.equal(processor.inputBuffer.buffer, processor.wasmMemory.buffer);
    processor.port.onmessage({ data: { cutOff: 500 } });
    processor.port.onmessage({ data: { resonance: 0.5 } });
    const input = Float32Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.5) * 0.1);
    const output = new Float32Array(128);
    assert.equal(processor.process([[input]], [[output]], {}), true);
    assert.ok(output.every(Number.isFinite));
    assert.ok(output.some((v) => v !== 0), "Filter produced silence");
    assert.ok(output.some((v, i) => Math.abs(v - input[i]) > 0.00001), "Worklet fell back to pass-through");
    assert.ok(!messages.some((m) => m.error || m.event === "error"), JSON.stringify(messages));
    processor.port.onmessage({ data: { type: "cleanup" } });
    assert.equal(processor.filter, null);
  });
}

test("only the used, licensed filter and matching sources are distributed", async () => {
  const parent = join(filterDirectory, "..");
  const entries = await readdir(parent, { withFileTypes: true });
  assert.deepEqual(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name), ["huovilainen"]);
  const files = await readdir(filterDirectory);
  assert.deepEqual(files.filter((name) => name.includes(".wasm")), ["huovilainenFilterKernel.wasm"]);
  for (const file of ["COPYING.LESSER", "LICENSE.MIT", "UNLICENSE", "THIRD_PARTY_NOTICES.md", "NOTICE.html"]) {
    assert.ok((await readFile(join(parent, file))).length > 0);
  }
  const html = await readFile(join(parent, "NOTICE.html"), "utf8");
  for (const [, href] of html.matchAll(/href="([^\"]+)"/g)) {
    if (href.startsWith("/") || href.startsWith("https://")) continue;
    assert.ok((await readFile(join(parent, href))).length > 0, `Missing notice target: ${href}`);
  }
});
