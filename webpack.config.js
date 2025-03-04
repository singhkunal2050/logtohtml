const path = require('path');

module.exports = {
  entry: './index.js', // The entry point for bundling
  output: {
    filename: 'bundle.js', // Output bundled file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader', // Optional: if you're using Babel for JS transpiling
      },
      {
        test: /\.css$/i,
        use: ["css-loader"],
      },
    ],
  },
  mode: 'production', // For production build
};
