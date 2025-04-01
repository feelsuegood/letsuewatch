const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const BASE_JS = "./src/client/js/";

module.exports = {
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    recorder: BASE_JS + "recorder.js",
    commentSection: BASE_JS + "commentSection.js",
  },
  mode: "development",
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/client/ffmpeg-core.js"),
          to: path.resolve(__dirname, "assets/ffmpeg-core.js"),
        },
        {
          from: path.resolve(__dirname, "src/client/ffmpeg-core.wasm"),
          to: path.resolve(__dirname, "assets/ffmpeg-core.wasm"),
        },
      ],
    }),
  ],
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
