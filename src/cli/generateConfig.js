const webpack = require('webpack');
const path = require('path');
const cwd = process.cwd();
import { defaultConfig } from '../../config/webpack.config.js';

export default function generateConfig(config) {
  config.huron = Object.assign({}, defaultConfig.huron, config.huron);
  const huron = config.huron;
  const entry = config.entry[huron.entry];

  // Manage entries
  config.entry[huron.entry] = [
    `webpack-dev-server/client?http://localhost:${huron.port}/`,
    'webpack/hot/dev-server',
    path.join(cwd, huron.root, 'js/huron'),
  ].concat(entry);

  // Manage loaders
  config.module = config.module || {};
  config.module.loaders = config.module.loaders || [];

  // Add loaders
  config.module.loaders.push({
    test: /\.html?$/,
    loader: 'dom?tag=dom-module!html',
    include: [path.join(cwd, huron.root, huron.templates)]
  });

  // De-dupe HMR plugin
  if (config.plugins && config.plugins.length) {
    config.plugins = config.plugins.filter(plugin => {
      return plugin.constructor.name !== 'HotModuleReplacementPlugin';
    });
  }
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  // Set ouput options
  config.output = Object.assign({}, config.output, defaultConfig.output);
  config.path = huron.root;
  delete config.output.publicPath;

  // Remove dev server options
  delete config.devServer;

  console.log(config)

  return config;
}