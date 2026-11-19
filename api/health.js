import app from '../server/index.js';
export default function handler(req, res) {
  req.url = '/api/health';
  return app(req, res);
}
