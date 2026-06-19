import { createAuthApp } from '../../server/createAuthApp.js';

let app;

function getApp() {
  if (!app) {
    app = createAuthApp();
  }
  return app;
}

export default function handler(req, res) {
  return getApp()(req, res);
}
