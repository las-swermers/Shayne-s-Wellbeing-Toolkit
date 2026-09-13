// Build the connected Lab from the same HTML used by the public site.
import fs from 'node:fs';
const origin='https://shayne-s-wellbeing-toolkit.vercel.app/';
let html=fs.readFileSync('sleep-lab.html','utf8');
html=html.replace('<head>','<head>\n<base target="_top">\n<script>window.SLEEP_BOOT = <?!= bootJson ?>;</script>');
html=html.replace(/(href|src)="([^"#:]+)"/g,(all,attr,url)=>/^https?:|^data:/.test(url)?all:attr+'="'+origin+url+'"');
// Bundle styles and application scripts so an Apps Script version is self-contained.
html=html.replace(/<link rel="stylesheet" href="https:\/\/shayne-s-wellbeing-toolkit.vercel.app\/([^"/]+\.css)">/g,(_,file)=>'<style>'+fs.readFileSync(file,'utf8').replaceAll('url(\'assets/','url(\''+origin+'assets/').replaceAll('url("assets/','url("'+origin+'assets/')+'</style>');
html=html.replace(/<script src="https:\/\/shayne-s-wellbeing-toolkit.vercel.app\/night-passage.js" defer><\/script>/,'');
fs.writeFileSync('apps-script/Lab.html',html);
console.log('Built apps-script/Lab.html');
