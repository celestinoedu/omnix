import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const targetDirectory = resolve("dist", ".openai");

await mkdir(targetDirectory, { recursive: true });
await copyFile(
  resolve(".openai", "hosting.json"),
  resolve(targetDirectory, "hosting.json"),
);

console.log("Sites metadata prepared in dist/.openai/");
