import test from 'node:test';
import assert from 'node:assert/strict';
import {backend} from './apps-script.test.mjs';

test('startup failures identify the stage without exposing raw errors',()=>{
  const b=backend();
  b.setEmail('');assert.match(b.ctx.doGet({}).text,/Check: identity/);
  b.setEmail('owner@las.ch');
  b.ctx.PropertiesService.getScriptProperties().setProperty('ACCOUNT_ID_KEY','');
  assert.match(b.ctx.doGet({}).text,/Check: setup-required/);b.ctx.setupSheets();
  const secret='private account, token or template contents';
  b.ctx.HtmlService.createTemplateFromFile=()=>{throw Error(secret);};
  assert.match(b.ctx.doGet({}).text,/Check: lab-file/);
  assert.ok(!b.ctx.doGet({}).text.includes(secret));
  b.ctx.HtmlService.createTemplateFromFile=()=>({evaluate(){throw Error(secret);}});
  assert.match(b.ctx.doGet({}).text,/Check: lab-render/);
  assert.ok(!b.ctx.doGet({}).text.includes(secret));
});

test('editor check is owner-only, reports template failures and never changes records',()=>{
  const b=backend(),logs=[],before=JSON.stringify(b.sheets);
  b.ctx.Logger.log=s=>logs.push(s);
  b.setEmail('student@las.ch');assert.throws(()=>b.ctx.selfTest(),/owner-only/);
  b.setEmail('owner@las.ch');
  b.ctx.HtmlService.createTemplateFromFile=()=>{throw Error('sensitive raw error');};
  assert.throws(()=>b.ctx.selfTest(),/LAB FILE/);
  b.ctx.HtmlService.createTemplateFromFile=()=>({getRawContent:()=>'<html>wrong file</html>'});
  assert.throws(()=>b.ctx.selfTest(),/LAB CONTENT/);
  b.ctx.HtmlService.createTemplateFromFile=()=>({
    getRawContent:()=>'<!doctype html><script>window.SLEEP_BOOT = <?!= bootJson ?>;</script>',
    evaluate(){return {setTitle(){return this;},addMetaTag(){return this;}};}
  });
  assert.match(b.ctx.selfTest(),/Editor checks passed/);
  assert.equal(JSON.stringify(b.sheets),before);
  assert.ok(!logs.join(' ').includes('owner@las.ch'));
  assert.ok(!logs.join(' ').includes('sensitive raw error'));
});
