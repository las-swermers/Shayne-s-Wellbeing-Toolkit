export function readConfig(env) {
  const clientId=env.GOOGLE_CLIENT_ID;
  const spreadsheetId=env.SPREADSHEET_ID;
  const accountKey=env.ACCOUNT_ID_KEY;
  const domain=env.ALLOWED_DOMAIN;
  const origins=(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(!/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(clientId||'') ||
     !/^[a-zA-Z0-9_-]+$/.test(spreadsheetId||'') || typeof accountKey!=='string' || accountKey.length<32 ||
     domain!=='las.ch' || !origins.length) throw new Error('Missing or invalid Google connection configuration');
  for(const origin of origins){const u=new URL(origin);if(u.protocol!=='https:' || u.origin!==origin) throw new Error('Use exact HTTPS origins');}
  return {clientId,spreadsheetId,accountKey,domain,origins};
}
