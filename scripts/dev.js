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

// 构建 worker 独立输出
esbuild.build({
    entryPoints: [path.resolve(__dirname, `../packages/${target}/src/worker.ts`)],
    outfile: path.resolve(__dirname, `../packages/${target}/dist/worker.js`),
    bundle: true,
    format: 'esm',
    target: ['esnext'],
}).then(() => {
    console.log('✅ Worker 构建完成');
});