// Self-contained copy of the app for a recording, served from a scoped HTTP
// directory. This does not change the deployed app or any hosting permissions.
import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const directory = resolve(process.argv[2] || "artifacts/recording");
const result = await build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  format: "iife",
  platform: "browser",
  outfile: "app.js",
  minify: true,
  write: false,
  define: { "process.env.NODE_ENV": '"production"' },
});
const js = result.outputFiles.find((f) => f.path.endsWith(".js")).text;
const css = result.outputFiles.find((f) => f.path.endsWith(".css")).text;
const html = (await readFile("index.html", "utf8"))
  .replace("</head>", () => `<style>${css}</style></head>`)
  .replace(
    /<script type="module" src="\/src\/main.jsx"><\/script>/,
    () => `<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`,
  );
await mkdir(directory, { recursive: true });
await writeFile(resolve(directory, "app.html"), html);
console.log(`Recording build: ${resolve(directory, "app.html")}`);
