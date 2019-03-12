import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import filesize from 'rollup-plugin-filesize'

const pkg = require('./package.json')

export default {
  input: 'src/index.js',

  output: [
    { file: pkg.main, name: 'hotkeyz', format: 'umd' },
    { file: pkg.module, format: 'es' }
  ],

  external: ['tslib'],

  plugins: [
    resolve(),
    commonjs({ include: 'node_modules/**' }),
    babel({ exclude: 'node_modules/**' }),
    filesize()
  ]
}
