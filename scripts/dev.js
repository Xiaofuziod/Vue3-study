const args = require('minimist')(process.argv.slice(2))
const {resolve} = require('path')
const {build} = require('esbuild')


// minimist 解析命令行参数
// console.log(args)

const target = args._[0] || 'reactivity'
const format = args.f || 'global'

// 开发环境 只打包某一个
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))

// iife 立即执行函数
// cjs node 中的模块
// esm 浏览器中的esModule模块

const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

console.log(target, format,pkg.buildOptions?.name)


build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: {
        onRebuild(error) {
            if (!error) console.log(`rebuilt ....`)
        }
    }
}).then(() => {
    console.log('watching ...')
})