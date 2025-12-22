import web from './svelte.config.web.js';
import app from './svelte.config.app.js';

const target = process.env.BUILD_TARGET || 'web';

// BUILD_TARGET=app 이면 app config, 아니면 web config
export default target === 'app' ? app : web;
