import { defineConfig } from 'umi';
import routes from './router';

export default defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  model: {},
  tailwindcss: {},
  access: {},
  initialState: {},
  define: {},
  request: { dataField: '' },
  history: {
    type: 'browser',
  },
  theme: {},
  layout: false,
  routes,
  targets: {
    ie: 11,
  },
  legacy: {
    buildOnly: false,
    nodeModulesTransform: false,
  },
  inlineLimit: 20000,
  npmClient: 'yarn',
});
