import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import config from './webpack.config';

let compiler = webpack(config);
let server = new WebpackDevServer(compiler, {
  contentBase: __dirname + '/public',
  hot: true,
  historyApiFallback: true,
  quiet: false,
  noInfo: false,
  lazy: false,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
  publicPath: config.output.publicPath,
  stats: { colors: true },
});
server.listen(8080, 'localhost', function() {});
