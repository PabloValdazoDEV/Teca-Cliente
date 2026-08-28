import { createHash } from "node:crypto";
import { access, copyFile, mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const officeRoot = path.join(root, "public", "office");
const mode = process.argv.includes("--runtime") ? "runtime" : "vendor";

async function prepareVendor() {
  const target = path.join(officeRoot, "vendor");
  await mkdir(target, { recursive: true });
  await copyFile(path.join(root, "node_modules", "zetajs", "source", "zeta.js"), path.join(target, "zeta.js"));
  await copyFile(path.join(root, "node_modules", "zetajs", "LICENSE"), path.join(target, "ZETAJS-LICENSE.txt"));
  console.log("ZetaJS vendor assets preparados.");
}

async function downloadFile(fileName) {
  const baseUrl = "https://cdn.zetaoffice.net/zetaoffice_latest/";
  const targetDir = path.join(officeRoot, "runtime");
  const target = path.join(targetDir, fileName);
  const temporary = `${target}.download`;
  try {
    await access(target);
    console.log(`${fileName}: ya existe`);
    return;
  } catch {
    // Continue with a fresh download.
  }

  const response = await fetch(`${baseUrl}${fileName}`, { signal: AbortSignal.timeout(10 * 60_000) });
  if (!response.ok) throw new Error(`No se pudo descargar ${fileName}: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(temporary, buffer, { flag: "wx" });
  await rename(temporary, target);
  console.log(`${fileName}: ${(buffer.length / 1024 / 1024).toFixed(1)} MB · sha256 ${createHash("sha256").update(buffer).digest("hex").slice(0, 12)}`);
}

async function prepareRuntime() {
  const target = path.join(officeRoot, "runtime");
  await mkdir(target, { recursive: true });
  try {
    for (const file of ["soffice.js", "soffice.wasm", "soffice.data", "soffice.data.js.metadata"]) {
      await downloadFile(file);
    }
  } catch (error) {
    for (const file of ["soffice.js", "soffice.wasm", "soffice.data", "soffice.data.js.metadata"]) {
      await rm(path.join(target, `${file}.download`), { force: true });
    }
    throw error;
  }
  console.log("Runtime de LibreOffice WebAssembly preparado en public/office/runtime.");
}

await mkdir(officeRoot, { recursive: true });
if (mode === "runtime") await prepareRuntime();
else await prepareVendor();
