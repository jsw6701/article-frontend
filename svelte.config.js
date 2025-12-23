import web from './svelte.config.web.js';
import app from './svelte.config.app.js';
import staticConfig from './svelte.config.static.js';

const target = process.env.BUILD_TARGET || 'web';

// BUILD_TARGET에 따라 config 선택
const configs = {
  web: web,
  app: app,
  static: staticConfig
};

export default configs[target] || web;
