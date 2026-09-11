import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { verifyIap } from './identity.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const audience = process.env.IAP_AUDIENCE;
const idKey = process.env.ACCOUNT_ID_KEY;
const spreadsheetId = process.env.SPREADSHEET_ID;
if (!audience || !idKey || idKey.length < 32 || !/^[a-zA-Z0-9_-]+$/.test(spreadsheetId || '')) {
  throw new Error('Set IAP_AUDIENCE, ACCOUNT_ID_KEY (32+ characters), and SPREADSHEET_ID.');
}
const identityClient = new OAuth2Client();
const sheetsAuth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const assets = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/sleep-lab.html', ['sleep-lab.html', 'text/html']],
  ['/tools/sleep-lab/', ['tools/sleep-lab/index.html', 'text/html']],
  ['/tools/sleep-lab/index.html', ['tools/sleep-lab/index.html', 'text/html']],
  ...['landing.css', 'night-passage.css', 'lab-polish.css'].map(x => ['/'+x, [x, 'text/css']]),
  ...['landing.js', 'night-passage.js', 'tools.js'].map(x => ['/'+x, [x, 'text/javascript']]),
  ['/downloads/sleep-lab-tracker.pdf', ['downloads/sleep-lab-tracker.pdf', 'application/pdf']],
  ['/assets/tracker-preview.webp', ['assets/tracker-preview.webp', 'image/webp']],
  ...['alpine-night-clean', 'moonlit-clouds', 'cow-leap', 'sleep-sheep']
    .map(x => ['/assets/'+x+'.webp', ['assets/'+x+'.webp', 'image/webp']])
]);
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}
createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  let path;
  try { path = new URL(req.url, 'http://localhost').pathname; }
  catch { return json(res, 400, { error:'bad_request' }); }
  // This is the only unauthenticated response in the container.
  if (path === '/healthz' && req.method === 'GET') return json(res, 200, { status:'ok' });
  let identity;
  try {
    identity = await verifyIap(req.headers['x-goog-iap-jwt-assertion'], audience, idKey, identityClient);
  } catch { return json(res, 403, { error:'las_sign_in_required' }); }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return json(res, 405, { error:'method_not_allowed' });
  }
  if (path === '/api/session') {
    return json(res, 200, { ...identity, authenticated:true, recordSync:false });
  }
  if (path === '/api/connection') {
    // Read only spreadsheet metadata, never student rows. No writes in the design PR.
    try {
      const client = await sheetsAuth.getClient();
      await client.request({
        url:'https://sheets.googleapis.com/v4/spreadsheets/'+spreadsheetId,
        params:{ fields:'spreadsheetId' }, timeout:10000
      });
      return json(res, 200, { connected:true, recordSync:false });
    } catch { return json(res, 503, { connected:false, error:'sheet_unavailable' }); }
  }
  const asset = assets.get(path);
  if (!asset) return json(res, 404, { error:'not_found' });
  try {
    const body = await readFile(resolve(root, asset[0]));
    res.writeHead(200, { 'Content-Type':asset[1]+'; charset=utf-8', 'Content-Length':body.length });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { json(res, 500, { error:'asset_unavailable' }); }
}).listen(Number(process.env.PORT || 8080), '0.0.0.0', () => {
  console.log('LAS identity and Sheet connectivity service ready; record sync disabled.');
});
