import { createHmac } from 'node:crypto';

export const IAP_ISSUER = 'https://cloud.google.com/iap';

export function schoolIdentity(payload, secret) {
  // Signature, issuer, audience and expiry must be verified before this helper.
  if (!payload || payload.iss !== IAP_ISSUER ||
      typeof payload.sub !== 'string' || !payload.sub ||
      typeof payload.email !== 'string' ||
      !/^[^@\s]+@las\.ch$/i.test(payload.email)) {
    throw new Error('forbidden');
  }
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('configuration');
  return {
    accountId: 'v1_' + createHmac('sha256', secret)
      .update(IAP_ISSUER + '\0' + payload.sub).digest('hex'),
    toolkit: "Shayne's Wellbeing Toolkit"
  };
}

export async function verifyIap(token, audience, secret, client) {
  if (typeof token !== 'string' || !token || !audience) throw new Error('unauthorized');
  const { pubkeys } = await client.getIapPublicKeys();
  const ticket = await client.verifySignedJwtWithCertsAsync(
    token, pubkeys, audience, [IAP_ISSUER]
  );
  return schoolIdentity(ticket.getPayload(), secret);
}
