import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
import minimist from "minimist";
import esbuild from "esbuild";

const filename = fileURLToPath(import.meta.url)
const __dirname = dirname(filename)

console.log(__dirname);

const args = minimist(process.argv.slice(2));
const target = args._[0];
const format = args.f || 'esm';


const entry = path.resolve(__dirname, `../packages/${target}/src/index.ts`)
const outfile = path.resolve(__dirname, `../packages/${target}/dist/index.js`)

esbuild.build({
    entryPoints: [entry],
    outfile: outfile,
    bundle: true,
    platform: 'browser',
    format,
    globalName: 'EasyFile',
}).then(() => {
    console.log('Build successful');
}).catch((error) => {
    console.error('Build failed', error);
});