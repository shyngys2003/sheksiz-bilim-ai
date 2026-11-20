import app from '../server/index.js';
export default function handler(req,res){req.url='/api/materials';return app(req,res);}
