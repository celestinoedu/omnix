import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("out");
const target = resolve("dist");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

console.log("Static export prepared in dist/");
