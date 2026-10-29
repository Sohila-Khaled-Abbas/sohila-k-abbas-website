import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
  try{
    const decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let target=path.resolve(root,'.'+decoded);
    if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html');
    const data=await fs.readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'});res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await fs.readFile(path.join(root,'404.html')).catch(()=>Buffer.from('Not found')));}
}).listen(port,'0.0.0.0',()=>console.log('Portfolio preview listening on port '+port));
