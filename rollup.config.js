import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    sourcemap: true,
    dir: "dist",
    format: "cjs",
  },
  external: ["ethers", "needle"],
  plugins: [typescript({})],
};
