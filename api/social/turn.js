import app from '../../server/index.js';
export default function handler(req, res) {
  req.url = '/api/social/turn';
  return app(req, res);
}
