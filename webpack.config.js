const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
module.exports = {
  entry: "./index.js", // The entry point for bundling
  output: {
    filename: "bundle.js", // Output bundled file
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            // Browsers with native ES modules (iOS/Safari 11+, Chrome 61+): no regenerator or ES5 helpers
            presets: [["@babel/preset-env", { targets: { esmodules: true }, bugfixes: true }]],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                {
                  pragma: "h",
                  pragmaFrag: "Fragment",
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["css-loader"],
      },
    ],
  },
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat", // Must be below test-utils
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
  optimization: {
    minimizer: [
      // Escape non-ASCII so the bundle renders correctly on pages without a UTF-8 charset
      new TerserPlugin({ terserOptions: { format: { ascii_only: true } } }),
    ],
  },
  mode: process.env.NODE_ENV ?? "development",
};
