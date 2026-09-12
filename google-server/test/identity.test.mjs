import test from 'node:test';
import assert from 'node:assert/strict';
import { IAP_ISSUER, schoolIdentity, verifyIap } from '../identity.mjs';

const secret = 'test-key-only-do-not-use-in-production';
const valid = { iss:IAP_ISSUER, sub:'google-subject-1', email:'student@las.ch' };
test('IDs are stable, opaque, tied to subject and key rather than email', () => {
  const first = schoolIdentity(valid,secret).accountId;
  assert.match(first,/^v1_[a-f0-9]{64}$/);
  assert.equal(first,schoolIdentity({...valid,email:'renamed@las.ch'},secret).accountId);
  assert.notEqual(first,schoolIdentity({...valid,sub:'other'},secret).accountId);
  assert.notEqual(first,schoolIdentity(valid,secret+'rotated').accountId);
});
test('outside accounts, suffix tricks, missing identity, and weak keys fail closed', () => {
  for (const email of ['student@gmail.com','student@las.ch.attacker.com','@las.ch','a@b@las.ch','a\n@las.ch']) {
    assert.throws(()=>schoolIdentity({...valid,email},secret));
  }
  assert.throws(()=>schoolIdentity({...valid,iss:'https://attacker.test'},secret));
  assert.throws(()=>schoolIdentity({...valid,sub:''},secret));
  assert.throws(()=>schoolIdentity(valid,'short'));
});
test('verification passes expected audience/issuer and requires a signed assertion', async () => {
  let called = false;
  const client = {
    getIapPublicKeys:async()=>({pubkeys:{test:'cert'}}),
    verifySignedJwtWithCertsAsync:async(token,keys,audience,issuers)=>{
      called=true;
      assert.equal(token,'signed'); assert.equal(audience,'configured-audience');
      assert.deepEqual(issuers,[IAP_ISSUER]);
      assert.deepEqual(keys,{test:'cert'});
      return {getPayload:()=>valid};
    }
  };
  await assert.rejects(()=>verifyIap('', 'configured-audience',secret,client));
  assert.equal(called,false);
  assert.equal((await verifyIap('signed','configured-audience',secret,client)).toolkit,"Shayne's Wellbeing Toolkit");
  client.verifySignedJwtWithCertsAsync=async()=>{throw new Error('signature expired or invalid');};
  await assert.rejects(()=>verifyIap('invalid','configured-audience',secret,client));
});
