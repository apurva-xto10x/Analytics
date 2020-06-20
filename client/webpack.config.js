const webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const Dotenv = require("dotenv");
const DotEnvExpand = require("dotenv-expand");
const workboxPlugin = require("workbox-webpack-plugin");
const WebpackAssetsManifest = require("webpack-manifest-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const chalk = require("chalk");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const TerserPlugin = require("terser-webpack-plugin");
const safePostCssParser = require("postcss-safe-parser");
const postcssNormalize = require("postcss-normalize");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const isDebugMode = () => {
  if (process.env.DEBUG === "true") return true;
  return false;
};

const isHTTPS = () => {
  if (process.env.DEBUG === "false") return false;
  return true;
};

const getAdditionalOptimisationFlags = () => {
  if (isDebugMode()) {
    return {
      namedModules: true,
      namedChunks: true,
      nodeEnv: "development",
      flagIncludedChunks: false,
      occurrenceOrder: false,
      concatenateModules: false,
      noEmitOnErrors: false,
      checkWasmTypes: false,
      removeAvailableModules: false,
    };
  }
  return {
    namedModules: false,
    namedChunks: false,
    nodeEnv: "production",
    flagIncludedChunks: true,
    occurrenceOrder: true,
    concatenateModules: true,
    noEmitOnErrors: true,
    checkWasmTypes: true,
  };
};

const getPublicURL = () => {
  const PUBLIC_URL_FROM_ENV = process.env.PUBLIC_URL;
  if (PUBLIC_URL_FROM_ENV) return PUBLIC_URL_FROM_ENV;
  return "/";
};

const appDirectory = fs.realpathSync(process.cwd());
const resolveEnvFilePath = (filePath) => path.resolve(appDirectory, filePath);

const dot_env_files = () => {
  const filePaths = [resolveEnvFilePath(".env")];
  if (isDebugMode()) filePaths.push(resolveEnvFilePath(".env.development"));
  else filePaths.push(resolveEnvFilePath(".env.production"));
  return filePaths;
};

dot_env_files().forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    DotEnvExpand(
      Dotenv.config({
        path: dotenvFile,
      })
    );
  }
});

const ENV_PREFIX_PATTERN = /^APP/i;

const env_stringified = {
  "process.env": Object.keys(process.env)
    .filter((key) => ENV_PREFIX_PATTERN.test(key))
    .reduce((env, key) => {
      env[key] = JSON.stringify(process.env[key]);
      return env;
    }, {}),
};

const config = {
  mode: isDebugMode() ? "development" : "none",
  performance: {
    hints: isDebugMode() ? false : "warning",
  },
  entry: ["react-hot-loader/patch", "./src/index.js"],
  output: {
    pathinfo: isDebugMode() ? true : false,
    path: path.resolve(__dirname, "build"),
    filename: !isDebugMode()
      ? "static/js/[name].[contenthash:8].js"
      : "static/js/[name].[hash:8].js",
    chunkFilename: !isDebugMode()
      ? "static/js/[name].[contenthash:8].chunk.js"
      : "static/js/[name].[hash:8].chunk.js",
    publicPath: getPublicURL(),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        use: [{ loader: "file-loader", options: { esModule: false } }],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: "url-loader",
            options: {
              mimetype: "image/png",
            },
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        // exclude: /node_modules/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: () => [
                require("postcss-flexbugs-fixes"),
                require("postcss-preset-env")({
                  autoprefixer: {
                    flexbox: "no-2009",
                  },
                  stage: 3,
                }),
                // Adds PostCSS Normalize as the reset css with default options,
                // so that it honors browserslist config in package.json
                // which in turn let's users customize the target behavior as per their needs.
                postcssNormalize(),
              ],
              sourceMap: isDebugMode(),
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
    modules: ["node_modules", "src"],
  },
  devServer: {
    contentBase: path.join(__dirname, "build"),
    historyApiFallback: true,
    progress: true,
    compress: true,
    https: isHTTPS(),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin(env_stringified),
    new webpack.EnvironmentPlugin({
      PUBLIC_URL: getPublicURL(),
    }),
    new HtmlWebpackPlugin({
      template: "public/index.html",
      filename: "index.html",
      title: "Analytics Dashboard",
      templateParameters: {
        PUBLIC_URL: getPublicURL(),
      },
      inject: "body",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime.*.js$/]),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new MiniCssExtractPlugin({
      filename: !isDebugMode()
        ? "static/css/[name].[contenthash:8].css"
        : "static/css/[name].[hash:8].css",
      chunkFilename: !isDebugMode()
        ? "static/css/[name].[contenthash:8].chunk.css"
        : "static/css/[name].[hash:8].chunk.css",
    }),
    new workboxPlugin.GenerateSW({
      clientsClaim: true,
      exclude: [/\.map$/, /asset-manifest\.json$/, /service-worker\.js$/],
      importWorkboxFrom: "cdn",
      navigateFallback: "/" + "index.html",
      navigateFallbackBlacklist: [
        // Exclude URLs starting with /_, as they're likely an API call
        new RegExp("^/_"),
        // Exclude any URLs whose last part seems to be a file extension
        // as they're likely a resource and not a SPA route.
        // URLs containing a "?" character won't be blacklisted as they're likely
        // a route with query params (e.g. auth callbacks).
        new RegExp("/[^/?]+\\.[^/]+$"),
      ],
    }),
    new WebpackAssetsManifest({
      fileName: "asset-manifest.json",
    }),
    new ProgressBarPlugin({
      format: `  building [:bar] ${chalk.green.bold(
        ":percent"
      )} (:elapsed seconds)`,
      clear: false,
    }),
    // new CopyPlugin({
    //   patterns: [{ from: "./assets", to: "assets" }],
    // }),
  ],
  optimization: {
    ...getAdditionalOptimisationFlags(),
    minimize: !isDebugMode(),
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          // Added for profiling in devtools
          keep_classnames: true,
          keep_fnames: false,
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        },
        sourceMap: isDebugMode(),
      }),
      // This is only used in production mode
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          parser: safePostCssParser,
          map: isDebugMode()
            ? {
                // `inline: false` forces the sourcemap to be output into a
                // separate file
                inline: false,
                // `annotation: true` appends the sourceMappingURL to the end of
                // the css file, helping the browser find the sourcemap
                annotation: true,
              }
            : false,
        },
        cssProcessorPluginOptions: {
          preset: ["default", { minifyFontValues: { removeQuotes: false } }],
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        chunks: "all",
        commons: {
          test: /.*/,
          name: (module, chunks, cacheGroupKey) => {
            const node_modules_dirname = path.resolve(
              __dirname,
              "node_modules"
            );
            const moduleNameWithoutNodeDir = module
              .identifier()
              .split(node_modules_dirname);
            let moduleFileName =
              moduleNameWithoutNodeDir[1] &&
              moduleNameWithoutNodeDir[1].split("/")[1] !== "babel-loader"
                ? moduleNameWithoutNodeDir[1].split("/")[1]
                : "";
            if (
              (moduleFileName && moduleFileName.includes("aws")) ||
              (moduleFileName && moduleFileName.includes("cognito"))
            ) {
              moduleFileName = "auth.bundle";
            }
            if (
              moduleFileName &&
              ((moduleFileName.includes("react") &&
                !moduleFileName.includes("react-")) ||
                moduleFileName.includes("react-dom") ||
                moduleFileName.includes("react-router") ||
                moduleFileName.includes("react-router-dom"))
            ) {
              moduleFileName = "react.bundle";
            }
            if (
              moduleFileName &&
              (moduleFileName.includes("redux") ||
                moduleFileName.includes("redux-saga"))
            ) {
              moduleFileName = "redux.bundle";
            }
            if (
              moduleFileName &&
              (moduleFileName.includes("mixpanel") ||
                moduleFileName.includes("react-ga"))
            ) {
              moduleFileName = "analytics.bundle";
            }
            if (
              moduleFileName &&
              (moduleFileName.includes("datadog") ||
                moduleFileName.includes("sentry"))
            ) {
              moduleFileName = "apm.bundle";
            }
            moduleFileName.replace("@", "");
            if (moduleFileName) return `${cacheGroupKey}-${moduleFileName}`;
            return null;
          },
          chunks: "all",
        },
      },
    },
    runtimeChunk: {
      name: "runtime",
    },
  },
};

if (isDebugMode()) {
  config.devtool = "eval-source-map";
}

module.exports = (env, argv) => {
  if (isDebugMode()) {
    config.cache = true;
    if (!argv.port) config.devServer.port = 3000;
    if (argv.analyzer && process.env.ANALYZER !== "false") {
      config.plugins = [
        ...config.plugins,
        new BundleAnalyzerPlugin({
          openAnalyzer: false,
          analyzerMode: "server",
          analyzerHost: "localhost",
          defaultSizes: "gzip",
          analyzerPort: 9000,
        }),
      ];
    }
    if (argv.hot) {
      // Cannot use 'contenthash' when hot reloading is enabled.
      config.output.filename = "[name].[hash].js";
    }
  }
  if (
    process.env.NODE_ENV === "production" &&
    !argv.analyzer &&
    argv.compress &&
    (!process.env.COMPRESS_JS || process.env.COMPRESS_JS === "true")
  ) {
    config.plugins = [
      ...config.plugins,
      new CompressionPlugin({
        test: /\.js(\?.*)?$/i,
        filename: "[path]",
      }),
    ];
  }
  return config;
};
