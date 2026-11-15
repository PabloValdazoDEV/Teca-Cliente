import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { access, copyFile, mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pipeline } from "node:stream/promises";
import { constants as zlibConstants, createGzip } from "node:zlib";

const root = process.cwd();
const officeRoot = path.join(root, "public", "office");
const mode = process.argv.includes("--runtime")
  ? "runtime"
  : process.argv.includes("--manifest")
    ? "manifest"
    : "vendor";
const RUNTIME_FILES = ["soffice.js", "soffice.wasm", "soffice.data", "soffice.data.js.metadata"];
const runtimeDir = path.join(officeRoot, "runtime");

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

// manifest.json fija la versión del runtime: el navegador lo guarda en Cache Storage
// bajo esa versión y solo vuelve a descargarlo cuando cambia.
async function writeManifest() {
  const files = [];
  for (const name of RUNTIME_FILES) {
    const file = path.join(runtimeDir, name);
    const { size } = await stat(file);
    files.push({ name, size, sha256: await sha256File(file) });
  }
  const version = createHash("sha256").update(files.map((file) => file.sha256).join(":")).digest("hex").slice(0, 16);
  await writeFile(path.join(runtimeDir, "manifest.json"), `${JSON.stringify({ version, generatedAt: new Date().toISOString(), files }, null, 2)}\n`);
  console.log(`manifest.json: versión ${version}`);
}

// Copias .gz para nginx `gzip_static on`: reducen la descarga de ~260 MB a ~60 MB.
async function writeGzipCopies() {
  for (const name of RUNTIME_FILES) {
    const source = path.join(runtimeDir, name);
    const target = `${source}.gz`;
    if ((await exists(target)) && (await stat(target)).mtimeMs >= (await stat(source)).mtimeMs) {
      console.log(`${name}.gz: ya existe`);
      continue;
    }
    await pipeline(createReadStream(source), createGzip({ level: zlibConstants.Z_BEST_COMPRESSION }), createWriteStream(`${target}.tmp`));
    await rename(`${target}.tmp`, target);
    console.log(`${name}.gz: ${((await stat(target)).size / 1024 / 1024).toFixed(1)} MB`);
  }
}

async function prepareManifest() {
  for (const name of RUNTIME_FILES) {
    if (!(await exists(path.join(runtimeDir, name)))) {
      throw new Error(`Falta ${name}. Ejecuta antes npm run office:runtime`);
    }
  }
  await writeManifest();
  await writeGzipCopies();
}


async function prepareVendor() {
  const target = path.join(officeRoot, "vendor");
  await mkdir(target, { recursive: true });
  await copyFile(path.join(root, "node_modules", "zetajs", "source", "zeta.js"), path.join(target, "zeta.js"));
  await copyFile(path.join(root, "node_modules", "zetajs", "LICENSE"), path.join(target, "ZETAJS-LICENSE.txt"));
  console.log("ZetaJS vendor assets preparados.");
  if ((await exists(path.join(runtimeDir, "soffice.wasm"))) && !(await exists(path.join(runtimeDir, "manifest.json")))) {
    await prepareManifest();
  }
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
  await prepareManifest();
  console.log("Runtime de LibreOffice WebAssembly preparado en public/office/runtime.");
}

await mkdir(officeRoot, { recursive: true });
if (mode === "runtime") await prepareRuntime();
else if (mode === "manifest") await prepareManifest();
else await prepareVendor();
