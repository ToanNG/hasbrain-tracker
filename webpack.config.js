import webpack from 'webpack';

export default {
  context: __dirname + '/app/scripts',
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:8080',
    'webpack/hot/only-dev-server',
    './index',
  ],
  output: {
    path: __dirname + '/dist',
    publicPath: '/assets/',
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
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
    modulesDirectories: ['web_modules', 'node_modules', 'app/scripts', 'app/styles'],
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
      { test: /\.s?css$/, loader: 'style!css!myth!sass' },
    ],
  },
};
