import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = fileURLToPath(new URL("../public", import.meta.url));
const distDir = fileURLToPath(new URL("../dist", import.meta.url));

async function copyPublicAssets() {
  await mkdir(distDir, { recursive: true });
  const files = await readdir(publicDir);
  await Promise.all(files.map((file) => copyFile(join(publicDir, file), join(distDir, file))));
}

copyPublicAssets().catch((error) => {
  console.error("Failed to copy extension assets", error);
  process.exitCode = 1;
});
