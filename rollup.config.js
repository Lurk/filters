import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      dir: "dist/",
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [del({ targets: "dist/*" }), typescript()],
};
