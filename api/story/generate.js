import app from '../../server/index.js';
export default function handler(req, res) {
  req.url = '/api/story/generate';
  return app(req, res);
}
