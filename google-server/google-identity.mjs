import {createHmac} from 'node:crypto';

export async function verifyGoogle(token,config,client) {
  if(typeof token!=='string' || !token || token.length>8192) throw new Error('unauthorized');
  // Google Auth Library verifies the signature, issuer, audience and expiry.
  const ticket=await client.verifyIdToken({idToken:token,audience:config.clientId});
  const p=ticket.getPayload();
  if(!p || !['accounts.google.com','https://accounts.google.com'].includes(p.iss) ||
     p.aud!==config.clientId || !Number.isFinite(p.exp) || p.exp<=Date.now()/1000 ||
     p.hd!==config.domain || p.email_verified!==true || typeof p.sub!=='string' || !p.sub ||
     typeof p.email!=='string') throw new Error('unauthorized');
  return {accountId:'gis_v1_'+createHmac('sha256',config.accountKey).update('google\0'+p.sub).digest('hex'),
    email:p.email,expiresAt:p.exp*1000};
}
