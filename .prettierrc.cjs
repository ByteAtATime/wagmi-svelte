module.exports = {
  ...require("@byteatatime/prettier-config"),
  plugins: ["prettier-plugin-svelte"],
  overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
};
