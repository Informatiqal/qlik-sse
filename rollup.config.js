import resolve from "@rollup/plugin-node-resolve";
import del from "rollup-plugin-delete";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json"));

export default {
  input: "lib/index.js",
  output: [
    {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/index.cjs",
      format: "commonjs",
      sourcemap: true,
    },
  ],
  external: [
    "path",
    "url",
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    del({
      targets: "dist/*",
    }),
    resolve(),
  ],
};
