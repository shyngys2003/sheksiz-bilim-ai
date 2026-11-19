import app from '../server/index.js';
export default function handler(req, res) {
  req.url = '/api/ai';
  return app(req, res);
}
