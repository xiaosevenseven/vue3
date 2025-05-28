import minimist from "minimist";
import esbuild from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);


const args = minimist(process.argv.slice(2));
const target = args._[0] || "reactivity";
const format = args.f || "iife";

const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));

esbuild.context({
    entryPoints: [entry],
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`),
    bundle: true,  
    platform: "browser",
    format,
    globalName: pkg.buildOptions?.name,
    sourcemap: true,
}).then(ctx => {
    console.log("start dev");
    return ctx.watch();
})














console.log(target, format, __dirname, __filename, entry);