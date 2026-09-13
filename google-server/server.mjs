import {createServer} from 'node:http';
import {GoogleAuth,OAuth2Client} from 'google-auth-library';
import {readConfig} from './config.mjs';
import {verifyGoogle} from './google-identity.mjs';
import {createHandler} from './app.mjs';

const config=readConfig(process.env);
const identityClient=new OAuth2Client();
const sheetsAuth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/spreadsheets.readonly']});
const handler=createHandler({config,verify:token=>verifyGoogle(token,config,identityClient),probeSheet:async()=>{
  const client=await sheetsAuth.getClient();
  await client.request({url:'https://sheets.googleapis.com/v4/spreadsheets/'+config.spreadsheetId,
    params:{fields:'spreadsheetId'},timeout:10000});
}});
const server=createServer({maxHeaderSize:16384,requestTimeout:15000},handler);
server.listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log('Google identity and read-only Sheet probe ready; record sync disabled.'));
