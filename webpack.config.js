var webpack = require('webpack');

module.exports = {
  context: __dirname + '/app/scripts',
  entry: {
    app: './index',
    background: './background',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new webpack.DefinePlugin({
      __DEVTOOLS__: true,
    }),
  ],
  resolve: {
    modulesDirectories: ['web_modules', 'node_modules', 'app/scripts', 'app/styles', 'app/images'],
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel', exclude: /node_modules/ },
      { test: /\.s?css$/, loader: 'style!css!myth!sass' },
      { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=10000&name=[name].[ext]' },
    ],
  },
};
