import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

const pkg = require('./package.json')

export default {
  input: 'src/index.ts',

  output: [
    { file: pkg.main, name: 'hotkeyz', format: 'umd' },
    { file: pkg.module, format: 'es' }
  ],

  external: ['tslib'],

  plugins: [
    resolve(),
    commonjs({ include: 'node_modules/**' }),
    typescript({ cacheRoot: '/tmp/.rpt2-cache' })
  ]
}
