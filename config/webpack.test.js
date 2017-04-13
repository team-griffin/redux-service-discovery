const path = require('path');
const webpack = require('webpack');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

module.exports = {
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.js', '.json'],

    alias: {
    }
  },
  module: {
    rules: [
      /*
       * Typescript loader support for .ts and Angular 2 async routes via .async.ts
       * Replace templateUrl and stylesUrl with require()
       *
       * See: https://github.com/s-panferov/awesome-typescript-loader
       * See: https://github.com/TheLarkInn/angular2-template-loader
       */
      {
        test: /\.js$/,
        loader: 'isparta-loader',
        exclude: /(node_modules|bower_components)/
      },

      {
        test: /\.json$/, loader: 'json-loader'
      }
    ],
  },
  plugins: [
    // new DefinePlugin({
    // })

    new LoaderOptionsPlugin({
        debug: false,
        options: {
          isparta: {
            embedSource: true,
            noAutoWrap: true,
            // these babel options will be passed only to isparta and not to babel-loader
            babel: {
              presets: ['es2015', 'stage-0', 'react'],
            }
          }
        }
      }),
  ],

  externals: {
    // 'cheerio': 'window',
    'react/addons': 'react',
    'react/lib/ExecutionEnvironment': 'react',
    'react/lib/ReactContext': 'react',
  }
};