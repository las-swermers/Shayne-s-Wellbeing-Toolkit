export function createHandler({config,verify,probeSheet}) {
  function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));}
  return async function handler(req,res){
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Vary','Origin');
    let path;try{path=new URL(req.url,'http://localhost').pathname;}catch{return json(res,400,{error:'bad_request'});}
    if(path==='/healthz' && req.method==='GET') return json(res,200,{status:'ok',recordSync:false});
    if(!['/api/session','/api/connection'].includes(path)) return json(res,404,{error:'not_found'});
    const origin=req.headers.origin;
    if(!config.origins.includes(origin)) return json(res,403,{error:'origin_not_allowed'});
    res.setHeader('Access-Control-Allow-Origin',origin);
    // Explicit bearer credentials, never ambient cookies or tokens in URLs.
    if(req.method==='OPTIONS'){
      if(req.headers['access-control-request-method']!=='POST') return json(res,405,{error:'method_not_allowed'});
      const headers=(req.headers['access-control-request-headers']||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);
      if(headers.some(x=>x!=='authorization')) return json(res,400,{error:'headers_not_allowed'});
      res.setHeader('Access-Control-Allow-Methods','POST');res.setHeader('Access-Control-Allow-Headers','Authorization');
      res.writeHead(204);return res.end();
    }
    if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return json(res,405,{error:'method_not_allowed'});}
    if(req.headers['transfer-encoding'] || Number(req.headers['content-length']||0)!==0) return json(res,400,{error:'body_not_expected'});
    const match=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'');
    let identity;
    try{identity=await verify(match?.[1]);}catch{return json(res,401,{error:'approved_account_required'});}
    if(path==='/api/session')return json(res,200,{...identity,authenticated:true,recordSync:false});
    try{await probeSheet();return json(res,200,{connected:true,recordSync:false});}
    catch{return json(res,503,{connected:false,error:'sheet_unavailable',recordSync:false});}
  };
}
