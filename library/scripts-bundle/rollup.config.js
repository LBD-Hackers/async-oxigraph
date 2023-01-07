import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: "./src/index.ts",
  output: [
    {
      file: './build/scripts.bundle.module.js',
      format: "es",
      globals: {
        wasm: 'wasm'
      }
    },
    {
      file: './build/scripts.bundle.js',
      format: "iife",
      name: 'scripts',
      globals: {
        wasm: 'wasm'
      }
    },
  ],
  plugins: [
    resolve(),
    typescript(),
    commonjs()
  ],
};