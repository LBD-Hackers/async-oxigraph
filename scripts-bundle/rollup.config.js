import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: "./src/index.js",
  output: [
    {
      file: './build/scripts.worker.module.js',
      format: "es",
      globals: {
        wasm: 'wasm'
      }
    },
    {
      file: './build/scripts.worker.js',
      format: "iife",
      name: 'scripts',
      globals: {
        wasm: 'wasm'
      }
    },
  ],
  plugins: [
    resolve(),
    commonjs()
  ],
};