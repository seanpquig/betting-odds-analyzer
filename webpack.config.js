var webpack = require('webpack');
module.exports = {
  entry: [
    'whatwg-fetch',
    './public/javascripts/app.js'
  ],
  output: {
    path: __dirname + '/public/javascripts',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
  ]
};
